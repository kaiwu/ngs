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

`scripts/audit_njs_apis.ts` scans configured QuickJS C API tables against Gleam
`@external` declarations and FFI names. Run it with:

```bash
bun run scripts/audit_njs_apis.ts
```

**njs 1.0.2 coverage: 344/344 scanned entries (100.0%, 38 groups).** Before this
upgrade's binding fixes it was 342/344 (99.4%); the two missing entries were
`XMLNode.getAttributeNS` and `XMLNode.getChildNS`. The old 293/335 (87.5%) figure
predated other binding work already present in revision `53e4b64`.

This is a name-based audit of configured C tables, not proof of complete types or
runtime behavior. Dynamic XML properties are not enumerated by these tables;
optional values, method-name collisions, and valid call shapes need runtime tests.
For example, request `variables` bindings also match the periodic-context entries
without supplying a dedicated Gleam periodic-context type. Constructors and
unconfigured API groups are outside this metric.

### Existing gaps outside the release changes

- Dedicated HTTP and stream periodic-context types/accessors remain unimplemented.
  The earlier claim that `js_periodic` required nginx Plus was incorrect: its
  directive and implementation are present in the vendored open-source module.
  Request/session accessors do not establish a typed periodic-context contract.
- Node-style synchronous crypto is already exposed (`create_hash`, `create_hmac`,
  update/digest/copy functions) and covered by `tests/misc_crypto`; it is no longer
  an intentional omission.
- Several older APIs use polymorphic arguments (for example XML parsing and
  canonicalization, and fetch options). The audit does not validate these shapes.

---

## njs 1.0.2 gap analysis — completed

Reviewed parent revision `53e4b64` against `submodules/njs` at release tag `1.0.2`,
commit `72e6a980b9bf2a28ae2d568bbc3b6830a5d7c39e` (2026-10-14), using the complete
`1.0.1..1.0.2` source/declaration diff and release `CHANGES`. QuickJS is the supported
runtime (`js_engine qjs`). The existing nginx checkout was preserved and rebuilt;
no upstream source modifications were needed.

The earlier preview stopped at `e5728cba`. The final release additionally frees the
XML parser context after parsing (`77f8e260`) and returns complete entity-containing
attribute values (`aaf322c9`). The latter affects signed XML: attribute reads must
agree with canonicalization. All three binding access paths are tested against
nested entity references.

### XML bindings — ✅

- Added `node_get_attribute_ns` and `node_get_child_ns`, returning
  `Result(value, Nil)`. Their namespace argument is a `String`; `""` selects no
  namespace, equivalent to native `null`. Unprefixed attributes do not inherit
  the default namespace. Missing values are `Error(Nil)`; empty values are `Ok("")`.
- Fixed `doc_tag`, `node_tag_name`, `node_tag`, `node_attr`, `node_attrs`, `node_ns`,
  `node_parent`, and `attr_value` to return `Result` instead of leaking `undefined`
  through non-optional Gleam types. This is a breaking signature correction.
- `node_tag_name` now uses `$tag$name`, so a child named after an XMLNode method
  is returned as a node. `doc_tag` compares the root's local name directly.
- Removed `node_set_tag` and `node_set_tags_name`: QuickJS rejects those assignments.
  Added `node_remove_tag` using `delete node.$tag$name`, `node_add_child_doc` to copy
  an XMLDoc root, and `node_remove_all_children` for the no-argument removal call.
- Child collection getters consistently return arrays, including empty arrays.
  `node_add_child` and `node_set_tags` copy namespace-free source trees. Namespaced
  descendants are also rejected, before changing the destination.
- Replaced the `require('xml')`/silent mock fallback with a static built-in ESM
  import. Keep `xml` external in bundles. Replaced the Node export-only smoke test
  with real QuickJS tests of the compiled Gleam API; Node has no built-in XML module.

Runtime coverage includes namespace identity, missing/empty values, method-name
collisions, complete attribute values, Buffer parsing, canonicalization and
exclusion, in-place wrapper updates, copied sources, detached node/descendant reads,
undefined detached parents, and rejection of invalid mutations and exclusions.
`setText`/`setAttribute` require strings; use the removal functions for deletion.

Canonicalization forwards the native arguments. One existing upstream limitation
remains: when an excluding node is supplied, QuickJS constructs a comment-free
node set even with `with_comments = True`. Comment inclusion without an excluding
node and exclusion without comments are covered separately; ngs does not alter the
upstream canonicalizer.

### Fetch and Buffer behavior — ✅

No new fetch or Buffer binding signatures are required. Fetch options are already
forwarded unchanged. Regression coverage verifies:

- Conflicting `Content-Length` fields, simultaneous chunked transfer encoding and
  content length, and informational statuses reject the fetch promise.
- Decoded chunked bytes obey `max_response_body_size`, including the exact boundary.
  Negative limits reject before connecting. The configured default remains 1 MiB;
  applications fetching larger bodies must explicitly increase the limit.
- 204/304 responses have no body; their advertised content length is not a body cap.
- Close-delimited bodies complete at EOF, and a peer that stays open reaches the
  configured fetch timeout. Both `fetch_url` and `fetch_request` are exercised.
- Fixed-length responses return only the declared body. Extra bytes cause the
  connection to be discarded, rather than a guaranteed `http trailing data` error
  as the preview notes suggested. Dirty fixed-length, chunked, and bodyless
  connections are not reused; a clean fixed-length connection is reused.
- Oversized `Buffer.alloc` and explicit `Buffer.concat` lengths throw `RangeError`
  before allocation instead of wrapping to a small length. `constants_max_length`
  remains the relevant QuickJS limit.

### Other release changes

WebCrypto HMAC comparison/cleanup, checked zlib lengths and dictionary lifetimes,
and checked fs modes retain their existing binding signatures. Existing crypto,
AES-GCM, and file-I/O integration suites pass. The `js_periodic` option-order fix
requires no signature changes; a typed periodic-context regression remains part
of the pre-existing gap above. Date setters, `Promise.any`, language correctness,
and module-compilation fixes specific to the deprecated njs engine need no
QuickJS-specific FFI work.

The C `njs_opaque_value_t` alignment is now 8 (size remains 16), and
`njs_number_to_length()` was added. All C consumers must be rebuilt with the new
header. The nginx build used for validation was rebuilt from the current sources.

### Validation

```bash
make -f nginx.makefile nginx
gleam test
npm run build                 # also run by the Bun preload
bun test
bun run scripts/audit_njs_apis.ts
```

Results: **17 Gleam tests passed; 112 integration tests passed across 29 files**,
including **18 njs 1.0.2 regressions**. The release suite asserts runtime version
`0x010002` and engine `QuickJS`, and bundles the compiled Gleam bindings into its
isolated nginx fixture. The API audit reports **344/344** configured entries.
