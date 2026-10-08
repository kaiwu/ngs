# NGS Implementation Roadmap

## Status Legend
- ✅ Completed
- 🔄 In Progress
- ⬚ Pending

## Completed Implementations (with tests)

- ✅ `http_hello` - Basic "Hello World" handler
- ✅ `http_decode_uri` - JSON parsing from query args
- ✅ `http_join_subrequests` - Parallel subrequests with Promise.all
- ✅ `http_authorization_jwt` - JWT parsing and sub claim extraction

## High Priority

- ✅ `http_authorization_gen_hs_jwt` - Generate HS256 JWT tokens using HMAC crypto
- ✅ `http_authorization_request_body` - Validate request body content
- ✅ `http_authorization_auth_request` - Auth request pattern for subrequest-based auth
- ✅ `http_authorization_secure_link_hash` - Secure link with MD5 hash verification

## Medium Priority

### Certificates
- ⬚ `http_certs_subject_alternative` - X.509 SAN (Subject Alternative Name) parsing
- ⬚ `http_certs_dynamic` - Dynamic certificate loading
- ⬚ `http_certs_fetch_https` - Fetch certificates via HTTPS
- ⬚ `http_certs_x509_test` - X.509 certificate testing (empty directory, needs creation)

### Logging & Rate Limiting
- ✅ `http_logging_num_requests` - Request counting with shared dict
- ✅ `http_rate_limit_simple` - Simple rate limiting with shared dict

### Response Modification
- ✅ `http_response_to_lower_case` - Convert response body to lowercase
- ✅ `http_response_modify_set_cookie` - Modify Set-Cookie headers

### API & Async
- ✅ `http_api_set_keyval` - Key-value API with shared dict
- ✅ `http_async_var_auth_request` - Async auth request variable
- ✅ `http_async_var_js_header_filter` - Async header filter
     
### Subrequests & Redirects
- ✅ `http_complex_redirects` - Complex redirect logic
- ✅ `http_subrequests_chaining` - Chain subrequests sequentially

### Stream Handlers
- ✅ `stream_auth_request` - Stream authentication
- ✅ `stream_detect_http` - HTTP detection in TCP streams
- ✅ `stream_inject_header` - Inject headers into streams

## Low Priority

- ✅ `misc_file_io` - File I/O operations (read/write files)
- ✅ `misc_aes_gcm` - AES-GCM encryption/decryption example

## Technical Notes

### Bitarray
Some bindings are wrong, specificly with gleam BitArray, fixing is on the way
as we are building apps, do stop and question if a binding requires BitArray type

### FFI Fix Applied
Added `get_header_in(r, name)` function to `http_ffi.mjs` and `http.gleam` because:
- `http.headers_in(r)` returns njs's `HeadersIn` proxy object, not a Gleam Dict
- Gleam's `dict.get()` expects Gleam Dict structure (with `.data` property)
- Direct header access via `r.headersIn[name]` works correctly

### nginx Plus Limitations
Some njs-examples require nginx Plus features not available in open-source nginx:
- `js_periodic` directive
- Advanced key-value stores
- Some certificate management features

Implementations should focus on proving Gleam bindings work, using open-source alternatives where needed.

### Test Pattern
Each app needs:
1. `src/app/<name>/<name>.gleam` - Handler implementation
2. `src/app/<name>/nginx.conf` - nginx configuration (port 8888)
3. `tests/<name>/do.test.js` - Bun integration tests

### Commands
```bash
npm run build                        # Build all apps
bun test tests/<name>/do.test.js     # Run specific test
KEEP_LOGS=1 bun test ...             # Keep runtime logs for debugging
```

---

## API Binding Audit

`scripts/audit_njs_apis.ts` scans the njs C source against Gleam `@external` declarations and reports coverage. Run with:

```bash
bun run scripts/audit_njs_apis.ts > /tmp/api_audit_report.txt
```

**Coverage: 87.5%** (293/335 njs APIs covered as of last audit pass).

The script was overhauled to fix systematic false negatives: it now scans private `fn` externals, applies independent prefix stripping (avoiding the chained-stripping bug), strips `_async`/`_sync` suffixes, and maintains a semantic-alias table for names that can't be derived algorithmically.

### Fixed (this iteration)

- ✅ **`ngx.ERR` bug** — `ngx_ffi.mjs` was using `ngx.ERROR` (undefined); corrected to `ngx.ERR`. Error-level logging was silently broken.
- ✅ **`r.requestLine`** — HTTP request first line added to `http.gleam` / `http_ffi.mjs`.
- ✅ **`ngx.engine_id`** — Engine identifier getter added to `ngx.gleam` / `ngx_ffi.mjs`.
- ✅ **`njs.version_number`** — Integer version constant exposed via `ngx.njs_version_number()`.
- ✅ **`njs.engine`** — Engine name string (`"QuickJS"`) exposed via `ngx.njs_engine()`.
- ✅ **`njs.on`** — Lifecycle event hook (e.g. `"exit"`) exposed via `ngx.njs_on(event, callback)`.
- ✅ **`TextEncoder.encoding`** — Property getter added to `text_encoder.gleam`.
- ✅ **Stream `from_upstream` flag** — `StreamData` variants now carry `from_upstream: Bool` alongside `last: Bool`; existing stream apps updated accordingly.

### Remaining Known Gaps

**HTTP Periodic context** (`src/njs/http.gleam`)
The `js_periodic` directive provides a periodic handler context with `rawVariables` and `variables`. No Gleam bindings exist. Deferred — `js_periodic` is nginx Plus only and cannot be tested with open-source nginx.

**Node-style synchronous crypto chain** (intentional design choice)
`createHash`/`createHmac` (sync) are still in the njs C source but deliberately not exposed. The `compute_hash`/`compute_hmac` functions via `crypto.subtle` are the preferred async equivalent and cover all practical handler use cases. The only scenario where sync is required is a `js_set` variable handler that cannot return a Promise — add if that use case arises.

---

## Preparing for njs 1.0.2

Reviewed `/home/kaiwu/Documents/cgit/njs` at `e5728cba` (`1.0.1-91-ge5728cba`, 2026-10-08). The public version macro is already `"1.0.2"` / `0x010002`. There is no `CHANGES` section and no tag yet. ngs vendors the `1.0.1` tag (`submodules/njs`, `NJS_VERSION` `"1.0.1"`). The notes below are what to absorb when that next release is tagged. ngs runs QuickJS (`js_engine qjs`); engine-only njs-VM fixes are called out as such.

`scripts/audit_njs_apis.ts` reads `submodules/njs`, so the 87.5% figure is the 1.0.1 surface. After the submodule bump, `getAttributeNS` and `getChildNS` (`JS_CFUNC_DEF` in `external/qjs_xml_module.c`) show up as new gaps until they are bound.

### Do before bumping the submodule

#### XML namespace accessors — ⬚

`XMLNode.getAttributeNS(namespaceURI, localName)` and `XMLNode.getChildNS(namespaceURI, localName)` landed for both engines (`96501ae3`). `namespaceURI` of `""` or `null` matches an element or attribute with no namespace. An unprefixed attribute is never in the default namespace. A missing match is `undefined`. A non-string namespace URI or local name throws `TypeError`.

`$attr$name` and `$tag$name` still compare local names only, so `x:ID` and `ID` stay ambiguous. Anything that reads signed XML (SAML, exclusive C14N) needs the new methods. Add `node_get_attribute_ns` and `node_get_child_ns` next to the existing accessors in `src/njs/xml.gleam` / `src/xml_ffi.mjs`. Return `Result` when the lookup misses, since Gleam callers cannot see `undefined`.

`xml.parse` accepts a `Buffer` as well as a string. `parse` is already polymorphic, so no signature change.

#### XML mutation semantics — ⬚ retest and adjust FFI

`3b4d715e` mutates the receiver's libxml2 node in place. Wrappers and later lookups keep referring to that same node. Removed child lists stay readable until the QuickJS document or the VM goes away. A node is live only when walking `$parent` reaches its `xmlDoc`.

Observable rules to encode in the bindings and in a QuickJS integration test:

- A removed child's `$parent` is `undefined`. Its descendants keep their internal parent links. `node_parent` is typed as `XMLNode` and will receive `undefined` for a document root or a detached node. Same hole for `node_ns` (`$ns` is `undefined` with no namespace) and `node_attrs` (`$attrs` is `undefined` when the node has no attributes). Make those three return `Result`.
- Mutating or canonicalizing a removed node throws `TypeError`.
- `c14n` / `serialize` / `serializeToString` reject an excluding node from another document or a detached list: `TypeError: "excluding" is not in XMLNode tree`. The FFI already forwards the excluding node.
- `addChild` and `$tags = [...]` copy namespace-free nodes only. A namespaced source throws before the tree changes (`TypeError: XMLNode has namespaces`, `TypeError: setval[N] has namespaces`). `addChild` also accepts an `XMLDoc` and copies its root. The same namespace-free node can be added twice; each call copies. In-place `setText` / `setAttribute` on a node that was parsed with a namespace still works. You cannot assemble a namespaced tree by copying namespaced nodes.
- Text and attribute values must be primitive strings. `null` and `undefined` still delete (`setAttribute`, `setText`, `$attr$…`, `$text`).
- Assigning `node.$tag$name` throws `TypeError` (`XMLNode.$tag$xxx is not assignable, use addChild() or node.$tags = [node1, node2, ..] syntax`). `delete node.$tag$name` removes matching children. On QuickJS 1.0.1 a non-null assignment already threw, so `node_set_tag` has no success path on our engine. Retire it. Add a remover that `delete`s `$tag$name`.
- Assigning or deleting `node.$tags$name` throws `TypeError` and leaves the tree unchanged. Retire `node_set_tags_name`.

#### QuickJS child names that match methods — ⬚

`c08eafae`: on QuickJS a child element is an own property, so a child whose local name matches an `XMLNode` method used to hide that method. Methods now win, matching the njs engine. The child stays available as `$tag$name`. Deleting the bare name must not delete the child.

`doc_tag` and `node_tag_name` read `doc[name]` / `node[name]`. For these local names they return the function, and the element is at `node_tag`:

`addChild`, `getAttributeNS`, `getChildNS`, `removeChildren`, `setAttribute`, `removeAttribute`, `removeAllAttributes`, `setText`, `removeText`.

Document that, and prefer `node_tag` whenever the local name is not a known-safe identifier.

#### `ngx.fetch` response framing — ⬚ add tests

Shared client in `nginx/ngx_js_http.c`, so QuickJS `ngx.fetch` (our `ngx.fetch_url` / `ngx.fetch_request`, options passed through) changes behavior with no signature change. Failures reject the fetch promise via `ngx_js_http_error`.

- Conflicting `Content-Length` values: `conflicting http content length`.
- `Transfer-Encoding: chunked` together with `Content-Length`: `conflicting http response framing`.
- Status 100–199: `unsupported http response status`.
- 204 and 304 are bodyless. Their `Content-Length` is not applied as a body limit.
- Close-delimited bodies (no `Content-Length`, not chunked) complete at EOF. 1.0.1 could finish them early from a content-length inference and return a short body. A peer that never closes now waits until `js_fetch_timeout`.
- `max_response_body_size < 0` throws `TypeError: max_response_body_size must be non-negative` while parsing arguments. 1.0.1 could turn that into a successful empty close-delimited body.
- Decoded chunked bodies count against `max_response_body_size`. 1.0.1 allowed decoded chunked data up to ten times that limit. Default is 1 MiB (`js_fetch_max_response_buffer_size`, merge value `1048576` in `nginx/ngx_js.c`). Over the limit: `http response body is too large`.
- Bytes after a declared fixed-length body: `http trailing data`. That connection is not returned to the fetch keepalive pool. Bodyless and chunked responses with unconsumed trailing bytes also skip the pool.

`http_certs_fetch_https` and any later fetch handler that reads a chunked body over 1 MiB needs a higher `js_fetch_max_response_buffer_size` or per-call `max_response_body_size`. Add an integration test for a conflicting frame and for a chunked body over the limit.

QuickJS fetch numeric fields are converted with the checked helper (`2658a79d`), so an ILP32 build cannot store an `int64_t` through an `ngx_int_t`. No Gleam change on 64-bit.

#### Buffer sizes on QuickJS — ⬚ document, cover in `misc_crypto` or a buffer test

`Buffer.alloc` and `Buffer.concat` take sizes with `JS_ToIndex` and reject them above `QJS_BUFFER_MAX_LENGTH` (`INT32_MAX`, already exposed as `buffer.constants_max_length`). `Buffer.alloc(2 ** 32 + 16)` used to return a 16-byte buffer (uint32 wrap). It now throws `RangeError: invalid array buffer length`. A `concat` whose running total exceeds the max throws `RangeError: Total size of buffers is too large` (this used to be a `TypeError`). An explicit `concat` length uses `JS_ToIndex` and throws `RangeError` for a non-index.

Array-like lengths take the same checked 64-bit path, so an oversized length fails before allocation. Conversion failures free the new buffer. No new Gleam functions. Callers of `buffer.alloc` and `buffer.concat` should treat `RangeError` as the oversized-input error.

### Retest after the bump; no new bindings

- **Date.** UTC setters used to convert the result as local time. `setUTC*` now honors the UTC flag (`619c8203`). The timezone-offset helper range-checks before converting to `int64`. ngs does not wrap `Date` setters. Gleam `Date` use in a handler still needs a pass on the new engine.
- **WebCrypto.** Constant-time HMAC verification and cleanup of AES-CTR / ECDSA failures (`2a30daad`, `5b76ab8c`, `9da700ed`) keep the same calls. EC JWK `crv` must be a string on the njs engine or import throws `Invalid JWK EC key` (`92f17bda`). The QuickJS path already throws `JWK EC curve mismatch` when `crv` is missing or does not match the algorithm. Our handlers run on QuickJS.
- **zlib.** `chunkSize` is a checked length; values below 64 or above `UINT_MAX` throw `RangeError: chunkSize must be >= 64`. QuickJS copies the dictionary bytes before converting the rest of the options, so a later conversion cannot invalidate the dictionary buffer (`7922554d`).
- **fs.** QuickJS numeric `mode` arguments to `access` and `mkdir` go through a checked conversion and throw on a bad value (`e89ba0d5`). The `BytesRead` prototype typo fix (`f365b275`) is in the njs-engine `fs` module.
- **Promise rejection tracking.** A handled rejection is not appended when the rejected-promise list is null, and tracking stops while the final reason is formatted (`543995a0`, `353c2020`). Request teardown logs fewer false unhandled rejections. This continues the 1.0.1 QuickJS rejection fix.
- **`Promise.any`.** An input that contains no promises rejects with `AggregateError` (`0965ce1d`). ngs does not call `Promise.any`. Keep it in mind if a combinator is added.
- **Language correctness.** Sparse `Array.prototype.concat`, `sort` of huge sparse arrays, named-capture indexes, `for-in` `SyntaxError`s, and property-key to array-index conversion were fixed. Gleam's JS output uses `Array` methods. `gleam test` plus `bun test` is the check; do not special-case these in FFI.
- **`js_periodic` `worker_affinity`.** Parsing reused the directive option index and skipped options that followed `worker_affinity` in HTTP and stream (`c5e6b51c`). Still nginx Plus only, and still deferred. A Plus config that places options after `worker_affinity` will start applying those options.
- **Module compilation.** Dependency source survives a failed module compile, and importing a module removed after that failure is reported (`c3e86ead`, `e5728cba`). This matters for multi-file `js_import`. The esbuild bundle `dist/<app>/njs/app.js` is a single file.

### Submodule bump checklist

1. Move `submodules/njs` from tag `1.0.1` to the `1.0.2` tag once it exists. `ngx.njs_version_number()` then returns `0x010002`. Tests only touch the function; none compare against `0x010001`.
2. Land the XML bindings above (`getAttributeNS`, `getChildNS`, optional `$ns` / `$parent` / `$attrs`, retire `node_set_tag` and `node_set_tags_name`, add `$tag$` delete).
3. Add fetch framing and chunked-body-limit coverage.
4. Run `gleam test && npm run build && bun test`, then `bun run scripts/audit_njs_apis.ts`.
5. `njs_opaque_value_t` in `src/njs.h` is now a union with a `uint64_t align` member (`306f0e1a`). Size stays 16 bytes. Alignment becomes 8. Rebuild every C consumer of `njs.h` with the new header. Gleam FFI does not include that header. `njs_number_to_length()` was added to the public C API for the chunk-size checks.
