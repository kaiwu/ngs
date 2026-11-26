# NGS Implementation Roadmap

## Status Legend
- ✅ Completed
- 🔄 In Progress
- ⬚ Pending

## Preparing for njs 1.0.3 (upstream preview)

Reviewed on 2026-11-26 from the pinned `1.0.2` tag (`72e6a980`) through
`../njs` master at `bfb44bbb` (2026-11-24, 109 commits). Upstream master
matched the sibling checkout. Its header reports `1.0.3` / `0x010003`, while
`1.0.2` is still the latest tag and `CHANGES` entry. The QuickJS API audit
returned the same **344/344 entries in 38 groups** at both revisions. The two
TypeScript declaration changes document null-prototype query objects.
[Upstream comparison](https://github.com/nginx/njs/compare/1.0.2...bfb44bbbe8b98e5d4bfb7e0f01404d7f2b0b0bee)

An isolated clean build with `nginx.makefile`, nginx 1.30.8 and the pinned
Bellard QuickJS (`3d5e064e`) served HTTP requests on the preview. The same
bundled Gleam bindings gave these results on the two binaries.

| Binding or operation | Pinned 1.0.2 | Preview `bfb44bbb` |
| --- | --- | --- |
| `http.args` reading `q=a%26b` | `q` was `"a"`, ordinary object | `q` was `"a&b"`, null prototype |
| `crypto.digest("SHA-256", data)` | Returned value had no `.then` | Returned a promise |
| `ngx.parse_query_string` | Dynamic `require` failed | Same failure. The `njs/querystring` binding succeeded on both |
| `shared_dict.get` on a miss, `replace` on a live string | `undefined` on miss, `TypeError` for `ItemString` replacement | Both binding mismatches persist |

### Binding fixes to prepare

- ⬚ **HTTP request and reply types** (`292556aa`, `76bf6406`). In
  `src/njs/http.gleam`, `parent` promises an `HTTPRequest` and `HTTPResponse`
  aliases `HTTPRequest`. Make parent lookup optional. Only a reply viewed by
  its executing parent exposes that parent. A subrequest handler sees
  `undefined`. Give replies access to status, response body, headers and
  variables, and reserve `read_request_*` and `set_return_value` for the
  executing request. Verify existing join/chaining handlers and an async
  `js_set` using a completed reply's variable.
- ⬚ **Shared dictionary values and expiry** (`9a074ab0`, `28977360`).
  In `src/shared_dict_ffi.mjs`, return a `Result(DictItem, Nil)` for `get` and
  convert the result of one native `pop` call the same way. Today a miss can
  escape as `undefined` and `pop` can wrap a raw value after a separate `has`.
  Unwrap `DictItem` for `replace`, change `items` from `Array(DictItem)` to
  `Array(#(String, DictItem))` with value conversion, and call `size()` and
  `freeSpace()` to obtain numbers.
  Migrate keyval, rate-limit and stream callers. Cover empty strings, zero
  and expiry. After expiry, `replace` and `delete` return false, `add` can
  create the key and `incr` starts at `init + delta`. A failed live update
  must preserve both the old value and its expiry.
- ⬚ **Query arguments and forwarding** (`437bfdbf`, `adbb9280`, `2786bd98`,
  `418184c2`). Route `ngx.parse_query_string` and `ngx.make_query_string`
  through the built-in ESM import already used in `src/querystring_ffi.mjs`.
  Test these helpers and `http.args` through a bundle. Parsed names are own
  properties on a null-prototype object. Cover duplicate and empty names,
  names such as `toString`, encoded separators, replacement of invalid UTF-8
  and the 1,000-segment limit on `r.args`. Encode decoded values when building
  query strings in subrequests or redirects. Invalid literal spaces/control
  characters reject the subrequest (`TypeError`) or fail the redirect (HTTP
  500). Valid percent-encoded arguments should pass through.
- ⬚ **WebCrypto types and error handling** (`23350925`, `c4a6f416`,
  `f97490a4`, `4e3c8782`). Exercise `crypto.digest` with a direct promise
  chain and verify early validation failures reject the promise. Existing
  `await`-based examples hide this change. In `src/njs/crypto.gleam` and
  `src/crypto_ffi.mjs`, distinguish generated secret keys from key pairs,
  support JWK object input and wrap the actual JWK/binary export result in
  the declared `KeyData` variant. Represent derivation parameters and the
  name-only `key.algorithm` for HKDF/PBKDF2. Map the Gleam AES-GCM fields to
  `additionalData` and `tagLength`. The example's empty AAD and default tag
  length hide the current mismatch. Verify a non-default tag and nonempty AAD.
- ⬚ **Optional arguments and return values.** Add a no-input flush to
  `njs/text_decoder` (`a574881b`, `c1fc7f03`) and expose `ignoreBOM` in its
  typed constructor options. Test a split leading BOM, a midstream BOM, and
  a new stream after flushing. In `njs/stream`, expose
  optionless `send_upstream` / `send_downstream`. The current `SendOption`
  has only `last` and `flush`. Document synchronous `send` inside the filter
  callback and use the directional methods for deferred writes (`1dc9fddb`,
  `196711b0`). In `njs/headers`, represent the native `null` from a missing
  Fetch header explicitly and distinguish it from an empty string.

### QuickJS runtime checks for the upgrade

- 🔄 **Object ownership across requests** (`8aeef510`, `0b036970`, `aaaf5712`).
  With `js_context_reuse 1`, verify that HTTP/stream variable views, HTTP
  headers, forms and subrequest replies expire with their host context. A
  reply remains readable until its parent is detached. Separately verify that
  Fetch `Headers`, `Request`, `Response` and copied body `ArrayBuffer` values
  survive cleanup. Check independent header copies, an unread network body
  consumed once, and that editing a returned buffer preserves the original
  request bytes. Upstream fixtures include `nginx/t/js_http_object_lifetime.t`,
  `stream_js_object_lifetime.t` and `js_fetch_ownership.t`.
- 🔄 **Initialization, timers and teardown** (`9d99e848`, `72774fc2`,
  `493cfbc7`, `dfbcbe90`, `548e5179`). Move any request-bound work started by
  a bundle initializer into a handler. Fetch and timers are rejected at import.
  Synchronous constructors and immediately settled promise jobs remain valid.
  Check that a rejected or unresolved top-level await fails context creation.
  Exercise repeated timer cancellation and self-cancellation. Correct the
  description of `ngx.njs_on("exit", ...)` in `src/njs/ngx.gleam` to cover
  request-context teardown and verify hooks are cleared before context reuse.
- 🔄 **Persistence and transport.** Exercise a multi-worker `state=` zone
  across reload and restart. Expect valid JSON with expired entries omitted,
  the zone TTL for a restored entry without an expiry, and graceful retirement
  of old workers while writes continue. Saves are rate-limited across the zone.
  A failed save should preserve the previous state file (`64f5c15e` through
  `aeef0bfe`).
  For HTTPS Fetch, cover a variable `js_fetch_proxy` that resolves to empty
  (direct TLS) and one that selects the proxy (CONNECT). Include a stream
  HTTPS fetch. These are nginx configuration and transport checks for the
  existing Fetch API (`bfb44bbb`, `d206219e`).
- 🔄 **Crypto and library behavior.** Check Ed25519, X25519 and AES-KW against
  the OpenSSL linked into nginx HTTP and stream. Distinguish an unavailable
  algorithm from a failing operation. Cover empty HMAC key rejection,
  wrong-length ECDSA signatures resolving to false, AES-CTR empty input and
  its 1–128-bit counter contract, derived-key length/type validation, and
  rejected export/wrap formats. Cover catchable host/library `Error` results
  (`0852c711`) and repeated fs, subrequest and Fetch body reads after upstream's
  memory-management fixes. Buffer and TextDecoder detach handling also changed
  upstream. QuickJS-NG allocation fixes and legacy njs VM/parser changes can
  be tracked upstream.

### Bun integration fixtures

The upstream nginx regression tests are in `../njs/nginx/t`. Engine-level
vectors are in `../njs/test`. The separate `njs-examples` checkout at
`d5de982` matches our submodule and supplies four access-phase handlers and
two X.509 test vectors. The Bun fixtures use the vendored copy.

| Upstream source | Assertions running in nginx with QuickJS |
| --- | --- |
| `nginx/t/js_args.t`, `test/querystring.t.mjs` | Compare HTTP args with the compiled querystring binding. Cover repeated, empty and case-sensitive names, encoded separators, invalid UTF-8 recovery, null prototypes and the 1,000-segment boundary. |
| `nginx/t/js_http_runtime_isolation.t`, `js_fetch_ownership.t`, `js_async.t` | Check parent identity on a completed reply, the child's encoded argument, independent Fetch header copies, body consumption and idempotent timer cancellation. |
| `nginx/t/js_shared_dict.t`, `js_shared_dict_state_timeout.t` | After observed expiry, check delete, add and increment. Wait for the state file to appear, restart nginx, then check the value and its original expiration. |
| `nginx/t/js_fetch_proxy_https.t`, `stream_js_fetch_https.t`, `stream_js_send_async.t` | A local TLS origin serves both direct and proxied requests. The fixture counts CONNECT requests, verifies the test certificate, and checks the bytes sent in both directions by a deferred stream filter. |
| `test/text_decoder.t.js`, `test/webcrypto/{digest,promise,import}.t.mjs` | Check BOM handling across chunks and flush, the SHA-256 digest bytes, promise rejection for an unknown digest, and empty versus valid HMAC key import. |
| `njs-examples/njs/http/access/` | Run all four reference handlers. Verify signed body forwarding, identity propagation and denial, independent bearer quotas with Retry-After, and form-based routing to two backends. |
| `njs-examples/njs/http/certs/js/x509_test.js` | Send the upstream DER vector and client PEM through nginx and assert the decoded values and SANs. These exercise the reference X.509 parser. The Gleam certificate handlers are still pending. |

Run the new suites on the pin or select a clean nginx binary built with the
reviewed preview. The harness checks the actual QuickJS engine and version.
The 11 preview-only cases also activate when the vendored header reaches
`0x010003`.

```sh
bun test tests/njs_1_0_3/do.test.js tests/njs_examples/do.test.js
NGS_NJS_PREVIEW_BIN=/absolute/path/to/objs/nginx bun test
```

Five executable `test.todo` cases specify the binding fixes for bundled
query helpers, dictionary values and collection metrics, AES-GCM AAD/tag
length, and optional Fetch headers. Run them with
`bun test --todo tests/njs_1_0_3/do.test.js` and promote each to `test` with
its corresponding fix. [Upgrade fixture](tests/njs_1_0_3/do.test.js) ·
[Example fixture](tests/njs_examples/do.test.js)

On 2026-11-26, the full Bun run on `1.0.2` had 122 passes, 11 preview skips
and five TODOs. The full run on `bfb44bbb` had 133 passes and the same five
TODOs. Running the TODO bodies separately on the preview confirmed all five
binding mismatches. All 17 Gleam unit tests passed.

The following cases remain for release qualification.

- ⬚ **HTTP, stream and Fetch lifetimes.** Add paired requests with context
  reuse to check the documented lifetime of headers, forms, variables and
  replies, alongside independently owned Fetch data. Exercise a redirect
  and a periodic callback. Use `js_http_lifetime_scopes.t`,
  `js_http_object_lifetime.t`, `stream_js_object_lifetime.t` and
  `js_fetch_headers_lifetime.t` as the upstream references.
- ⬚ **Initialization and teardown.** Extend the fixture with separate import
  modules for a settled and a rejected top-level await. Check context creation
  and callback cleanup across subsequent requests against `js_import2.t`,
  `stream_js_import2.t`, `js_teardown.t` and `js_exit.t`.
- ⬚ **State-file reload.** Add a multi-worker fixture that reloads during
  normal writes. Check old-worker exit, valid JSON, restored live values and
  the zone TTL for legacy records. The current restart test uses one process.
- ⬚ **WebCrypto and typed calls.** Use `js_webcrypto.t` and
  `stream_js_webcrypto.t` for algorithm availability in each module, then
  `test/webcrypto/{key_algorithm,key_format,derive_ecdh,wrap}.t.mjs` for
  key metadata and format results. Exercise an optional request parent,
  no-input decoder flush and optionless directional sends through Gleam once
  those signatures exist. Today's flush calls the native no-argument method.

### Before updating the dependency

- ⬚ **Verify the executable after an incremental build.** Upstream moved
  module archives and the generated header to nginx's `objs/njs/` and isolated
  them from the CLI build (`0518cdd4` through `b59abf30`). In the isolated
  static build, changing only `njs/src/qjs.c` and running
  `make -C submodules/nginx -j6` rebuilt `qjs.o` and `libqjs.a` but left the
  executable serving the old code. A second invocation relinked nginx. A
  temporary change to the engine label confirmed both outcomes over HTTP.
  Qualify the release from a clean build and check that a single incremental
  make relinks nginx after a QuickJS source edit before relying on that path.
- ⬚ Reconcile `bfb44bbb..<release tag>` and the final `CHANGES` before moving
  the gitlink. Update and rebuild native callers of
  `njs_vm_value_array_buffer_set` for its new `shared` argument and check
  callers of the renamed QuickJS buffer helpers.
- ⬚ Run `make -f nginx.makefile nginx`, `gleam test`, `npm run build`, the
  full `bun test` suite and `bun run scripts/audit_njs_apis.ts` against the
  final pin. The 1.0.2 fixture now checks the exact selected version alongside
  its QuickJS, XML, Buffer and Fetch assertions. CI currently runs Gleam tests
  and formatting. Add the nginx integration checks so the compiled bindings
  execute on the release binary.

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
