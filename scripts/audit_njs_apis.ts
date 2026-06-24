#!/usr/bin/env bun

/**
 * NJS API Audit Script v4
 *
 * Scans submodules/njs C source for the complete QuickJS JavaScript API surface,
 * then compares against our Gleam bindings + FFI layer.
 *
 * Key design:
 *   - Each JSCFunctionListEntry array in C source → one NjsApiGroup
 *   - Each group has its own matching strategy (explicit FFI call or implicit name match)
 *   - Gleam @external bindings are matched against njs entries by:
 *       1. FFI file match
 *       2. Function name match (with camelCase/snake_case normalization)
 *   - For explicit-call groups, we also verify the FFI actually calls the njs API
 *
 * Usage: bun run scripts/audit_njs_apis.ts [--verbose] [--json]
 */

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dir, "..");
const NJS_ROOT = join(ROOT, "submodules", "njs");
const SRC_ROOT = join(ROOT, "src");

// ─── Types ───────────────────────────────────────────────────────────

interface NjsApiEntry {
  name: string;
  kind: "method" | "property" | "getter" | "constant";
  argc?: number;
}

interface NjsApiGroup {
  /** Unique key for this group (the C array name) */
  arrayName: string;
  /** Category for report ordering */
  category: string;
  /** Human label */
  label: string;
  /** How this API is accessed in JS, for display */
  jsAccess: string;
  /** Our FFI file(s) that handle this */
  ffiFile: string | string[];
  /** Match strategy */
  explicitCall: boolean;
  entries: NjsApiEntry[];
}

interface GleamBinding {
  gleamFile: string;
  gleamFunc: string;
  ffiFile: string;
  ffiFunc: string;
}

interface FFICall {
  ffiFile: string;
  exportName: string;
  njsCall: string;
}

// ─── C Source Parsing ────────────────────────────────────────────────

function parseEntry(line: string): NjsApiEntry | null {
  let m = line.match(/JS_CFUNC_DEF\s*\(\s*"([^"]+)"/);
  if (m) {
    const a = line.match(/JS_CFUNC_DEF\s*\(\s*"[^"]+"\s*,\s*(\d+)/);
    return { name: m[1], kind: "method", argc: a ? parseInt(a[1]) : undefined };
  }
  m = line.match(/JS_CFUNC_MAGIC_DEF\s*\(\s*"([^"]+)"/);
  if (m) {
    const a = line.match(/JS_CFUNC_MAGIC_DEF\s*\(\s*"[^"]+"\s*,\s*(\d+)/);
    return { name: m[1], kind: "method", argc: a ? parseInt(a[1]) : undefined };
  }
  if (line.includes("JS_CFUNC_SPECIAL_DEF")) return null;
  m = line.match(/JS_CGETSET_DEF\s*\(\s*"([^"]+)"/);
  if (m && !m[1].startsWith("[")) {
    return { name: m[1], kind: line.includes("NULL") ? "getter" : "property" };
  }
  m = line.match(/JS_CGETSET_MAGIC_DEF\s*\(\s*"([^"]+)"/);
  if (m && !m[1].startsWith("[")) {
    return { name: m[1], kind: line.includes("NULL") ? "getter" : "property" };
  }
  m = line.match(/JS_PROP_STRING_DEF\s*\(\s*"([^"]+)"/);
  if (m && !m[1].startsWith("[")) {
    return { name: m[1], kind: "constant" };
  }
  m = line.match(/JS_PROP_INT32_DEF\s*\(\s*"([^"]+)"/);
  if (m) {
    return { name: m[1], kind: "constant" };
  }
  m = line.match(/JS_OBJECT_DEF\s*\(\s*"([^"]+)"/);
  if (m) {
    return { name: m[1], kind: "property" };
  }
  return null;
}

function findArrayName(lines: string[], idx: number): string {
  for (let i = idx; i >= 0; i--) {
    const m = lines[i].match(/(?:static\s+)?(?:const\s+)?JSCFunctionListEntry\s+(\w+)\s*\[\s*\]/);
    if (m) return m[1];
  }
  return "unknown";
}

/**
 * Configuration for each known JSCFunctionListEntry array in njs C source.
 */
interface ArrayConfig {
  category: string;
  label: string;
  jsAccess: string;
  /** One FFI file or several (e.g. global group covers both timers_ffi and process_ffi) */
  ffiFile: string | string[];
  explicitCall: boolean;
}

const ARRAY_CONFIGS: Record<string, ArrayConfig> = {
  // ── Buffer module (src/qjs_buffer.c) ──
  qjs_buffer_export:    { category: "buffer", label: "Buffer static",  jsAccess: "Buffer",  ffiFile: "buffer_ffi.mjs", explicitCall: true },
  qjs_buffer_props:     { category: "buffer", label: "Buffer static",  jsAccess: "Buffer",  ffiFile: "buffer_ffi.mjs", explicitCall: true },
  qjs_buffer_constants: { category: "buffer", label: "Buffer.constants", jsAccess: "Buffer", ffiFile: "buffer_ffi.mjs", explicitCall: false },
  qjs_buffer_proto:     { category: "buffer", label: "Buffer.prototype", jsAccess: "buf",   ffiFile: "buffer_ffi.mjs", explicitCall: false },

  // ── FS module (external/qjs_fs_module.c) ──
  qjs_fs_export:        { category: "fs", label: "fs static+sync",    jsAccess: "fs",    ffiFile: "fs_ffi.mjs", explicitCall: false },
  qjs_fs_promises:      { category: "fs", label: "fs.promises",       jsAccess: "fs.promises", ffiFile: "fs_ffi.mjs", explicitCall: false },
  qjs_fs_constants:     { category: "fs", label: "fs.constants",      jsAccess: "fs.constants", ffiFile: "fs_ffi.mjs", explicitCall: false },
  qjs_fs_stats_proto:   { category: "fs", label: "fs.Stats",          jsAccess: "stats",  ffiFile: "fs_ffi.mjs", explicitCall: false },
  qjs_fs_dirent_proto:  { category: "fs", label: "fs.Dirent",         jsAccess: "dirent", ffiFile: "fs_ffi.mjs", explicitCall: false },
  qjs_fs_filehandle_proto: { category: "fs", label: "fs.FileHandle",  jsAccess: "fh",     ffiFile: "fs_ffi.mjs", explicitCall: false },

  // ── QueryString module ──
  qjs_querystring_export: { category: "querystring", label: "querystring", jsAccess: "qs", ffiFile: "querystring_ffi.mjs", explicitCall: true },

  // ── WebCrypto ──
  qjs_webcrypto_export:    { category: "crypto", label: "crypto global",  jsAccess: "crypto", ffiFile: "crypto_ffi.mjs", explicitCall: true },
  qjs_webcrypto_subtle:    { category: "crypto", label: "crypto.subtle",  jsAccess: "crypto.subtle", ffiFile: "crypto_ffi.mjs", explicitCall: true },
  qjs_webcrypto_key_proto: { category: "crypto", label: "CryptoKey",      jsAccess: "key",   ffiFile: "crypto_ffi.mjs", explicitCall: false },

  // ── Node crypto module ──
  qjs_crypto_export:    { category: "crypto_module", label: "crypto module", jsAccess: "crypto_mod", ffiFile: "crypto_ffi.mjs", explicitCall: false },
  qjs_hash_proto_proto: { category: "crypto_module", label: "Hash",         jsAccess: "hash", ffiFile: "crypto_ffi.mjs", explicitCall: false },
  qjs_hmac_proto_proto: { category: "crypto_module", label: "Hmac",         jsAccess: "hmac", ffiFile: "crypto_ffi.mjs", explicitCall: false },

  // ── XML module ──
  qjs_xml_export:     { category: "xml", label: "xml static", jsAccess: "xml",   ffiFile: "xml_ffi.mjs", explicitCall: false },
  qjs_xml_node_proto: { category: "xml", label: "XMLNode",    jsAccess: "node",  ffiFile: "xml_ffi.mjs", explicitCall: false },
  qjs_xml_doc_proto:  { category: "xml", label: "XMLDoc",     jsAccess: "doc",   ffiFile: "xml_ffi.mjs", explicitCall: false },
  qjs_xml_attr_proto: { category: "xml", label: "XMLAttr",    jsAccess: "attr",  ffiFile: "xml_ffi.mjs", explicitCall: false },

  // ── Zlib module ──
  qjs_zlib_export:    { category: "zlib", label: "zlib static",     jsAccess: "zlib", ffiFile: "zlib_ffi.mjs", explicitCall: false },
  qjs_zlib_constants: { category: "zlib", label: "zlib.constants",   jsAccess: "zlib", ffiFile: "zlib_ffi.mjs", explicitCall: false },

  // ── ngx global ──
  ngx_qjs_ext_ngx:     { category: "ngx",     label: "ngx",      jsAccess: "ngx",     ffiFile: "ngx_ffi.mjs", explicitCall: true },
  ngx_qjs_ext_console: { category: "console", label: "console",  jsAccess: "console", ffiFile: "console_ffi.mjs", explicitCall: false },
  // global group spans two FFI files: setTimeout/clearTimeout in timers_ffi,
  // process object in process_ffi
  ngx_qjs_ext_global:  { category: "global",  label: "global",   jsAccess: "global",  ffiFile: ["timers_ffi.mjs", "process_ffi.mjs"], explicitCall: true },

  // ── HTTP Request ──
  ngx_http_qjs_ext_request:  { category: "http", label: "r (HTTPRequest)", jsAccess: "r", ffiFile: "http_ffi.mjs", explicitCall: false },
  ngx_http_qjs_ext_periodic: { category: "http", label: "HTTP Periodic",   jsAccess: "r", ffiFile: "http_ffi.mjs", explicitCall: false },

  // ── Stream Session ──
  ngx_stream_qjs_ext_session:  { category: "stream", label: "s (StreamSession)", jsAccess: "s",     ffiFile: "stream_ffi.mjs", explicitCall: false },
  ngx_stream_qjs_ext_periodic: { category: "stream", label: "Stream Periodic",    jsAccess: "s",     ffiFile: "stream_ffi.mjs", explicitCall: false },
  ngx_stream_qjs_ext_flags:    { category: "stream", label: "Stream Flags",       jsAccess: "flags", ffiFile: "stream_ffi.mjs", explicitCall: false },

  // ── Shared Dict ──
  ngx_qjs_ext_shared_dict:       { category: "shared_dict", label: "SharedDict",       jsAccess: "ngx.shared", ffiFile: "shared_dict_ffi.mjs", explicitCall: false },
  ngx_qjs_ext_shared_dict_error: { category: "shared_dict", label: "SharedMemoryError", jsAccess: "err",        ffiFile: "shared_dict_ffi.mjs", explicitCall: false },

  // ── Fetch API ──
  ngx_qjs_ext_fetch_headers_proto:  { category: "fetch", label: "Headers",  jsAccess: "headers",  ffiFile: "ngx_ffi.mjs", explicitCall: false },
  ngx_qjs_ext_fetch_request_proto:  { category: "fetch", label: "Request",  jsAccess: "request",  ffiFile: "ngx_ffi.mjs", explicitCall: false },
  ngx_qjs_ext_fetch_response_proto: { category: "fetch", label: "Response", jsAccess: "response", ffiFile: "ngx_ffi.mjs", explicitCall: false },

  // ── Core intrinsics (qjs.c) ──
  qjs_text_decoder_proto: { category: "intrinsics", label: "TextDecoder", jsAccess: "decoder",  ffiFile: "text_decoder_ffi.mjs", explicitCall: false },
  qjs_text_encoder_proto: { category: "intrinsics", label: "TextEncoder", jsAccess: "encoder",  ffiFile: "text_encoder_ffi.mjs", explicitCall: false },
  qjs_njs_proto:          { category: "intrinsics", label: "njs",         jsAccess: "njs",      ffiFile: "ngx_ffi.mjs", explicitCall: true },
  qjs_process_proto:      { category: "intrinsics", label: "process",    jsAccess: "process",  ffiFile: "process_ffi.mjs", explicitCall: false },
};

function parseNjsCApis(): NjsApiGroup[] {
  const groupMap = new Map<string, NjsApiGroup>();

  const cFiles: string[] = [];
  function collect(dir: string) {
    if (!existsSync(dir)) return;
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) collect(full);
      else if (entry.name.endsWith(".c")) cFiles.push(full);
    }
  }
  collect(join(NJS_ROOT, "src"));
  collect(join(NJS_ROOT, "nginx"));
  collect(join(NJS_ROOT, "external"));

  const seen = new Set<string>();

  for (const file of cFiles) {
    if (file.includes("njs_shell.c") || file.includes("/test/") || file.includes("fuzzer")) continue;
    const content = readFileSync(file, "utf-8");
    const lines = content.split("\n");

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!line.match(/JS_CFUNC_DEF|JS_CFUNC_MAGIC_DEF|JS_CGETSET_DEF|JS_CGETSET_MAGIC_DEF|JS_PROP_STRING_DEF|JS_PROP_INT32_DEF|JS_OBJECT_DEF/)) continue;

      const entry = parseEntry(line);
      if (!entry) continue;

      let arrName = findArrayName(lines, i);
      if (arrName === "ngx_qjs_ext_ngx" && file.includes("ngx_js_shared_dict")) continue;

      const cfg = ARRAY_CONFIGS[arrName];
      if (!cfg) continue;

      if (!groupMap.has(arrName)) {
        groupMap.set(arrName, {
          arrayName: arrName,
          category: cfg.category,
          label: cfg.label,
          jsAccess: cfg.jsAccess,
          ffiFile: cfg.ffiFile,
          explicitCall: cfg.explicitCall,
          entries: [],
        });
      }

      const group = groupMap.get(arrName)!;
      const dedupKey = `${entry.name}:${entry.kind}`;
      if (!seen.has(`${arrName}:${dedupKey}`)) {
        seen.add(`${arrName}:${dedupKey}`);
        group.entries.push(entry);
      }
    }
  }

  return Array.from(groupMap.values());
}

// ─── Gleam Bindings ──────────────────────────────────────────────────

function parseGleamBindings(): GleamBinding[] {
  const bindings: GleamBinding[] = [];
  const gleamDir = join(SRC_ROOT, "njs");
  if (!existsSync(gleamDir)) return bindings;

  for (const entry of readdirSync(gleamDir, { withFileTypes: true })) {
    if (!entry.name.endsWith(".gleam")) continue;
    const content = readFileSync(join(gleamDir, entry.name), "utf-8");

    // Match both pub fn and private fn externals (private fns are used as
    // internal wrappers, e.g. do_add/do_set in shared_dict.gleam)
    const regex = /@external\(javascript,\s*"([^"]+)",\s*"([^"]+)"\)\s*\n\s*(?:pub\s+)?fn\s+(\w+)/g;
    let m;
    while ((m = regex.exec(content)) !== null) {
      bindings.push({
        gleamFile: entry.name,
        gleamFunc: m[3],
        ffiFile: m[1].replace(/^\.\.\//, ""),
        ffiFunc: m[2],
      });
    }
  }
  return bindings;
}

// ─── FFI Call Detection ──────────────────────────────────────────────

function extractFunctionBodies(content: string): { name: string; body: string }[] {
  const results: { name: string; body: string }[] = [];
  const regex = /export\s+(?:async\s+)?function\s+(\w+)\s*\([^)]*\)\s*\{/g;
  let m;
  while ((m = regex.exec(content)) !== null) {
    const startIdx = m.index + m[0].length;
    let depth = 1;
    let endIdx = startIdx;
    for (let i = startIdx; i < content.length; i++) {
      if (content[i] === '{') depth++;
      else if (content[i] === '}') { depth--; if (depth === 0) { endIdx = i; break; } }
    }
    results.push({ name: m[1], body: content.slice(startIdx, endIdx) });
  }
  return results;
}

function detectNjsCalls(body: string): string[] {
  const calls: string[] = [];
  for (const m of body.matchAll(/Buffer\.(\w+)\s*\(/g)) calls.push(`Buffer.${m[1]}`);
  for (const m of body.matchAll(/ngx\.(\w+)\b/g)) calls.push(`ngx.${m[1]}`);
  for (const m of body.matchAll(/crypto\.subtle\.(\w+)\s*\(/g)) calls.push(`crypto.subtle.${m[1]}`);
  for (const m of body.matchAll(/(?<!\.)crypto\.(\w+)\s*\(/g)) {
    if (m[1] !== "subtle") calls.push(`crypto.${m[1]}`);
  }
  for (const m of body.matchAll(/require\s*\(\s*['"]([^'"]+)['"]\s*\)\.(\w+)\s*\(/g)) {
    calls.push(`require('${m[1]}').${m[2]}`);
  }
  for (const m of body.matchAll(/njs\.(\w+)\b/g)) calls.push(`njs.${m[1]}`);
  if (/\bsetTimeout\b/.test(body)) calls.push("setTimeout");
  if (/\bsetImmediate\b/.test(body)) calls.push("setImmediate");
  if (/\bclearTimeout\b/.test(body)) calls.push("clearTimeout");
  // Accessing any process.* property implies the process global is reachable
  if (/\bprocess\./.test(body)) calls.push("global.process");
  return [...new Set(calls)];
}

function parseFFICalls(): FFICall[] {
  const calls: FFICall[] = [];
  for (const entry of readdirSync(SRC_ROOT, { withFileTypes: true })) {
    if (!entry.name.endsWith("_ffi.mjs") || entry.name === "ngs_ffi.mjs") continue;
    const content = readFileSync(join(SRC_ROOT, entry.name), "utf-8");
    for (const func of extractFunctionBodies(content)) {
      for (const njsCall of detectNjsCalls(func.body)) {
        calls.push({ ffiFile: entry.name, exportName: func.name, njsCall });
      }
    }
  }
  return calls;
}

// ─── Coverage Logic ──────────────────────────────────────────────────

function snakeToCamel(s: string): string {
  return s
    .replace(/_([a-z])/g, (_, c) => c.toUpperCase())
    .replace(/Uint(\d|$|L|B)/g, "UInt$1")
    .replace(/Json$/g, "JSON")
    .replace(/Uuid$/g, "UUID")
    .replace(/Bom$/g, "BOM")
    .replace(/Fifo$/g, "FIFO");   // isFIFO (named-pipe type in fs APIs)
}

/**
 * Semantic aliases for ffiFunc names that cannot be derived algorithmically.
 * Key: ffiFunc (second @external string), Value: list of njs API names it covers.
 */
const SEMANTIC_ALIASES: Record<string, string[]> = {
  // Buffer.from — multiple typed Gleam wrappers all call Buffer.from
  "from_array_buffer":        ["from"],
  "from_bytes":                ["from"],
  "from_buffer":               ["from"],
  "from_string":               ["from"],
  "constants_max_length":       ["MAX_LENGTH"],
  "constants_max_string_length":["MAX_STRING_LENGTH"],

  // Fetch Response — Gleam uses descriptive names; njs uses short property names
  "response_is_ok":            ["ok"],
  "response_is_redirected":    ["redirected"],
  "response_has_body":         ["bodyUsed"],
  "response_body_json":        ["json"],
  "response_body_text":        ["text"],
  "response_body_array_buffer":["arrayBuffer"],

  // Fetch Request
  "request_has_body":          ["bodyUsed"],
  "request_body_json":         ["json"],
  "request_body_text":         ["text"],
  "request_body_array_buffer": ["arrayBuffer"],

  // HTTP send — Gleam splits into typed variants; njs has one send()
  "http_send_text":            ["send"],
  "http_send_buffer":          ["send"],

  // Stream on — on_callback reads option.from_upstream and option.last and
  // surfaces them as fields on StreamData, covering all three njs entries
  "on_callback":               ["on", "from_upstream", "last"],

  // XML — node_set_attr covers setAttribute (attr ≠ attribute expansion)
  "node_set_attr":             ["setAttribute"],

  // FS — njs concatenates these words; Gleam uses underscores
  "read_dir_sync":             ["readdirSync"],
  "read_dir_async":            ["readdir"],
  "read_link_sync":            ["readlinkSync"],
  "read_link_async":           ["readlink"],
  "real_path_sync":            ["realpathSync"],
  "real_path_async":           ["realpath"],

  // FS constants — Gleam exposes them as typed accessor functions
  "constants_f_ok":            ["F_OK"],
  "constants_r_ok":            ["R_OK"],
  "constants_w_ok":            ["W_OK"],
  "constants_x_ok":            ["X_OK"],

  // Crypto — Gleam uses async Web Crypto; semantically covers the sync chain
  "compute_hash":              ["createHash"],
  "compute_hmac":              ["createHmac"],
  "crypto_key_algorithm":       ["algorithm"],
  "crypto_key_extractable":     ["extractable"],
  "crypto_key_type":            ["type"],
  "crypto_key_usages":          ["usages"],
  "hash_update":                ["update"],
  "hash_copy":                  ["copy"],
  "hash_constructor":           ["constructor"],
  "hmac_update":                ["update"],
  "hmac_constructor":           ["constructor"],

  // SharedMemoryError prototype properties.
  "shared_memory_error_name":    ["name"],
  "shared_memory_error_message": ["message"],

  // Zlib constants — exposed as legal lowercase Gleam function names.
  "z_no_compression":           ["Z_NO_COMPRESSION"],
  "z_best_speed":               ["Z_BEST_SPEED"],
  "z_default_compression":      ["Z_DEFAULT_COMPRESSION"],
  "z_best_compression":         ["Z_BEST_COMPRESSION"],
  "z_filtered":                 ["Z_FILTERED"],
  "z_huffman_only":             ["Z_HUFFMAN_ONLY"],
  "z_rle":                      ["Z_RLE"],
  "z_fixed":                    ["Z_FIXED"],
  "z_default_strategy":         ["Z_DEFAULT_STRATEGY"],

  // ngx/njs constants and getters with names that avoid existing helpers.
  "level_err":                  ["ERR"],
  "level_info":                 ["INFO"],
  "level_warn":                 ["WARN"],
  "ngx_log":                    ["log"],
  "nginx_version":              ["version"],
  "ngx_version_number":         ["version_number"],
  "njs_version":                ["version"],
  "njs_version_number":         ["version_number"],
  "njs_engine":                 ["engine"],
  "njs_on":                     ["on"],
};

/**
 * Ordered list of prefixes to try stripping, longest first to avoid
 * over-stripping (e.g. file_handle_ before handle_).
 */
const STRIP_PREFIXES = [
  "file_handle_", "shared_dict_", "http_", "stream_",
  "response_", "request_", "headers_", "node_", "dirent_",
  "stats_", "doc_", "attr_", "dict_", "get_", "set_", "is_", "body_", "raw_",
];

/**
 * Convert a Gleam ffiFunc name to the set of njs JS API names it may cover.
 *
 * Strategy:
 *   1. Exact match + camelCase (handles Buffer proto, most simple names)
 *   2. BE/LE suffix normalisation (readInt16Be → readInt16BE)
 *   3. Each prefix stripped independently, then camelCase (avoids the chained-
 *      stripping bug where http_headers_in → headers_in → in instead of headersIn)
 *   4. Double-prefix strip (http_ then get_) for http_get_headers_out → headersOut
 *   5. _async/_sync suffix stripping so async Gleam fns match bare njs names
 *   6. Explicit semantic aliases for names that can't be derived algorithmically
 */
function gleamToNjsNames(ffiFunc: string): string[] {
  const out = new Set<string>();

  const addWithVariants = (s: string) => {
    out.add(s);
    const c = snakeToCamel(s);
    out.add(c);
    // normalise BE/LE suffix (readInt16Be → readInt16BE)
    const cbe = c.replace(/Be$/, "BE").replace(/Le$/, "LE");
    out.add(cbe);
  };

  // 1 & 2: base name
  addWithVariants(ffiFunc);

  // 3 & 4: single + double prefix strip
  for (const p1 of STRIP_PREFIXES) {
    if (!ffiFunc.startsWith(p1)) continue;
    const s1 = ffiFunc.slice(p1.length);
    addWithVariants(s1);
    // second level strip (e.g. http_ → get_ → headers_out → headersOut)
    for (const p2 of STRIP_PREFIXES) {
      if (s1.startsWith(p2)) {
        addWithVariants(s1.slice(p2.length));
      }
    }
  }

  // 5: strip _async / _sync suffix, then camelCase the remainder
  // This matches e.g. access_async → access, write_file_async → writeFile
  for (const suf of ["_async", "_sync"]) {
    if (ffiFunc.endsWith(suf)) {
      addWithVariants(ffiFunc.slice(0, -suf.length));
    }
  }

  // 6: explicit semantic aliases
  for (const alias of SEMANTIC_ALIASES[ffiFunc] ?? []) {
    out.add(alias);
  }

  return [...out];
}

/**
 * Check if a Gleam binding covers an njs API entry.
 */
function bindingMatchesEntry(binding: GleamBinding, entry: NjsApiEntry, group: NjsApiGroup): boolean {
  const groupFiles = Array.isArray(group.ffiFile) ? group.ffiFile : [group.ffiFile];
  if (!groupFiles.includes(binding.ffiFile)) return false;
  const names = gleamToNjsNames(binding.ffiFunc);
  return names.includes(entry.name);
}

function generateReport(
  groups: NjsApiGroup[],
  gleamBindings: GleamBinding[],
  ffiCalls: FFICall[],
): string {
  const lines: string[] = [];

  // Index gleam bindings by ffiFile
  const gleamByFFI = new Map<string, GleamBinding[]>();
  for (const b of gleamBindings) {
    if (!gleamByFFI.has(b.ffiFile)) gleamByFFI.set(b.ffiFile, []);
    gleamByFFI.get(b.ffiFile)!.push(b);
  }

  // Index FFI calls by key
  const ffiCallMap = new Map<string, FFICall[]>();
  for (const c of ffiCalls) {
    if (!ffiCallMap.has(c.njsCall)) ffiCallMap.set(c.njsCall, []);
    ffiCallMap.get(c.njsCall)!.push(c);
  }

  // Sort groups by category
  const catOrder = ["buffer", "fs", "querystring", "crypto", "crypto_module",
    "ngx", "console", "global", "intrinsics",
    "http", "stream", "shared_dict", "fetch", "xml", "zlib"];
  groups.sort((a, b) => {
    const ai = catOrder.indexOf(a.category);
    const bi = catOrder.indexOf(b.category);
    if (ai !== bi) return ai - bi;
    return a.label.localeCompare(b.label);
  });

  lines.push("=".repeat(80));
  lines.push("  NJS API Coverage Audit Report");
  lines.push(`  Generated: ${new Date().toISOString()}`);
  lines.push("=".repeat(80));
  lines.push("");
  lines.push("  Legend:");
  lines.push("    ✓  = Covered (FFI + Gleam binding)");
  lines.push("    ◐  = FFI exists but no Gleam wrapper");
  lines.push("    ✗  = Missing (no FFI binding at all)");
  lines.push("");

  let totalNjs = 0, totalCovered = 0, totalFFIOnly = 0, totalMissing = 0;

  for (const group of groups) {
    if (group.entries.length === 0) continue;

    lines.push(`── ${group.label} (${group.category}) ──`);
    let cov = 0, ffi = 0, mis = 0;

    for (const entry of group.entries) {
      totalNjs++;

      // Check if any Gleam binding covers this entry
      const groupFiles = Array.isArray(group.ffiFile) ? group.ffiFile : [group.ffiFile];
      const bindings = groupFiles.flatMap(f => gleamByFFI.get(f) ?? []);
      const hasGleam = bindings.some(b => bindingMatchesEntry(b, entry, group));

      // For explicit-call groups, also check if FFI actually calls the API
      let hasFFI = false;
      if (group.explicitCall) {
        const njsKey = `${group.jsAccess}.${entry.name}`;
        hasFFI = ffiCallMap.has(njsKey);
      } else {
        // For implicit groups, FFI coverage is implied by Gleam binding
        hasFFI = hasGleam;
      }

      let status: string;
      if (hasGleam) {
        status = "✓"; cov++; totalCovered++;
      } else if (hasFFI && group.explicitCall) {
        status = "◐"; ffi++; totalFFIOnly++;
      } else {
        status = "✗"; mis++; totalMissing++;
      }

      const kindStr = entry.kind === "method"
        ? `method(${entry.argc ?? "?"})`
        : entry.kind;
      const displayKey = group.explicitCall ? `${group.jsAccess}.${entry.name}` : entry.name;
      lines.push(`  ${status} ${entry.name.padEnd(32)} ${kindStr.padEnd(14)} → ${displayKey}`);
    }

    const pct = group.entries.length > 0 ? ((cov / group.entries.length) * 100).toFixed(0) : "0";
    lines.push(`  ── ${cov}/${group.entries.length} covered (${pct}%) ──`);
    lines.push("");
  }

  // Summary
  const total = totalCovered + totalFFIOnly + totalMissing;
  const pct = total > 0 ? ((totalCovered / total) * 100).toFixed(1) : "0.0";

  lines.push("=".repeat(80));
  lines.push("  SUMMARY");
  lines.push("=".repeat(80));
  lines.push(`  Total njs APIs:            ${totalNjs}`);
  lines.push(`  Covered (FFI+Gleam):       ${totalCovered}`);
  lines.push(`  FFI only (no Gleam):       ${totalFFIOnly}`);
  lines.push(`  Missing (no FFI):          ${totalMissing}`);
  lines.push(`  ──────────────────────────`);
  lines.push(`  Coverage rate:             ${pct}%`);
  lines.push("");

  // Missing APIs detail
  lines.push("=".repeat(80));
  lines.push("  MISSING APIs");
  lines.push("=".repeat(80));
  lines.push("");

  let missingCount = 0;
  for (const group of groups) {
    const groupFiles2 = Array.isArray(group.ffiFile) ? group.ffiFile : [group.ffiFile];
    const bindings = groupFiles2.flatMap(f => gleamByFFI.get(f) ?? []);
    const missing = group.entries.filter(e => {
      if (bindings.some(b => bindingMatchesEntry(b, e, group))) return false;
      if (group.explicitCall) {
        const key = `${group.jsAccess}.${e.name}`;
        if (ffiCallMap.has(key)) return false; // has FFI
      }
      return true;
    });

    if (missing.length === 0) continue;
    missingCount += missing.length;
    lines.push(`  ${group.label}:`);
    for (const e of missing) {
      lines.push(`    - ${e.name} (${e.kind})`);
    }
    lines.push("");
  }

  if (missingCount === 0) {
    lines.push("  🎉 All njs APIs are covered!");
    lines.push("");
  }

  return lines.join("\n");
}

// ─── Main ────────────────────────────────────────────────────────────

function main() {
  const verbose = Bun.argv.includes("--verbose");
  const jsonOut = Bun.argv.includes("--json");

  console.error("Scanning njs C source...");
  const groups = parseNjsCApis();
  console.error(`  ${groups.length} API groups, ${groups.reduce((s,g)=>s+g.entries.length,0)} entries`);

  console.error("Parsing Gleam bindings...");
  const gleam = parseGleamBindings();
  console.error(`  ${gleam.length} @external bindings`);

  console.error("Parsing FFI calls...");
  const ffiCalls = parseFFICalls();
  console.error(`  ${ffiCalls.length} FFI→njs call mappings`);

  if (verbose) {
    console.error("\nFFI calls:");
    for (const c of ffiCalls) console.error(`  ${c.ffiFile}:${c.exportName} → ${c.njsCall}`);
  }

  console.error("");
  const report = generateReport(groups, gleam, ffiCalls);
  console.log(report);

  const rpath = "/tmp/api_audit_report.txt";
  Bun.write(rpath, report);
  console.error(`Report: ${rpath}`);
}

main();
