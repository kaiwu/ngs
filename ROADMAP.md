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
- ⬚ `http_authorization_auth_request` - Auth request pattern for subrequest-based auth
- ⬚ `http_authorization_secure_link_hash` - Secure link with HMAC hash verification

## Medium Priority

### Certificates
- ⬚ `http_certs_subject_alternative` - X.509 SAN (Subject Alternative Name) parsing
- ⬚ `http_certs_dynamic` - Dynamic certificate loading
- ⬚ `http_certs_fetch_https` - Fetch certificates via HTTPS
- ⬚ `http_certs_x509_test` - X.509 certificate testing (empty directory, needs creation)

### Logging & Rate Limiting
- ⬚ `http_logging_num_requests` - Request counting with shared dict
- ⬚ `http_rate_limit_simple` - Simple rate limiting with shared dict

### Response Modification
- ⬚ `http_response_to_lower_case` - Convert response body to lowercase
- ⬚ `http_response_modify_set_cookie` - Modify Set-Cookie headers

### API & Async
- ⬚ `http_api_set_keyval` - Key-value API with shared dict
- ⬚ `http_async_var_auth_request` - Async auth request variable
- ⬚ `http_async_var_js_header_filter` - Async header filter

### Subrequests & Redirects
- ⬚ `http_complex_redirects` - Complex redirect logic
- ⬚ `http_subrequests_chaining` - Chain subrequests sequentially

### Stream Handlers
- ⬚ `stream_auth_request` - Stream authentication
- ⬚ `stream_detect_http` - HTTP detection in TCP streams
- ⬚ `stream_inject_header` - Inject headers into streams

## Low Priority

- ⬚ `misc_file_io` - File I/O operations (read/write files)
- ⬚ `misc_aes_gcm` - AES-GCM encryption/decryption example

## Technical Notes

### Bitarray
Some bindings are wrong, specifially with gleam Bitarray, fixing is on the way
as we are building apps, do stop and question if a binding requires Bitarray type

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
