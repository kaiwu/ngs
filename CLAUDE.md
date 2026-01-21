# NGS Development Notes

## Project Overview

NGS provides Gleam bindings for nginx's njs (JavaScript) runtime. It enables writing type-safe, functional nginx handlers in Gleam.

## CRITICAL: njs Runtime (NOT Node.js!)

**njs uses the QuickJS engine, NOT Node.js.** While APIs look similar, they are NOT the same.

- **Official njs Reference**: https://nginx.org/en/docs/njs/reference.html
- **njs Compatibility**: https://nginx.org/en/docs/njs/compatibility.html

### Key Differences from Node.js

1. **No npm packages** - Only built-in njs modules available
2. **Built-in modules use `require()`**:
   - `require('crypto')` - Node-style crypto (createHash, createHmac)
   - `require('fs')` - File system operations
   - `require('querystring')` - Query string parsing
   - `require('buffer')` - Buffer operations
   - `require('xml')` - XML parsing (njs-specific)
   - `require('zlib')` - Compression

3. **Web Crypto API available**: `crypto.subtle.*` for modern crypto
4. **Global objects**: `ngx`, `njs`, `console`, `crypto`
5. **No event loop** - Promises work, but no `setImmediate`, limited `setTimeout`

### njs Crypto APIs

Two crypto APIs available (both work, choose based on need):

```javascript
// Node-style (synchronous, simpler)
const crypto = require('crypto');
crypto.createHmac('sha256', secret).update(data).digest('base64url');
crypto.createHash('sha256').update(data).digest('hex');

// Web Crypto API (async, more modern)
await crypto.subtle.digest('SHA-256', data);
await crypto.subtle.sign('HMAC', key, data);
```

### njs-specific Objects

```javascript
// ngx global object
ngx.log(ngx.INFO, "message");     // Log levels: ngx.INFO, ngx.WARN, ngx.ERR
ngx.fetch(url);                    // Fetch API
ngx.shared.SharedDict             // Shared memory dictionaries

// njs global object
njs.version                        // njs version string
njs.dump(obj)                      // Pretty-print object (debugging)
```

## Architecture

```
src/
├── njs/           # Core njs API bindings (18 modules)
│   ├── http.gleam      # HTTP request/response handling
│   ├── stream.gleam    # TCP/UDP stream handling  
│   ├── crypto.gleam    # WebCrypto + node crypto APIs
│   ├── buffer.gleam    # Binary data manipulation
│   ├── fs.gleam        # File system operations
│   ├── ngx.gleam       # Core nginx utilities, shared dict
│   └── ...
├── app/           # Example applications (25+)
│   └── <name>/
│       ├── <name>.gleam   # Handler implementation
│       └── nginx.conf     # nginx configuration
└── ngs.gleam      # Build system

tests/
├── harness.js     # Test infrastructure (nginx process management)
├── mocks/         # Mock servers (redis, postgres, consul, etc.)
└── <name>/
    └── do.test.js # Integration tests using bun:test
```

## Build System

- `npm run build` - Compiles Gleam → JS, bundles with esbuild
- `npm run watch` - Watch mode with live reload
- Apps are registered in `src/ngs.gleam` in the `apps()` function
- Output goes to `dist/<app_name>/` with `nginx.conf` and `njs/app.js`

## Test Harness

Tests use Bun and require the nginx binary at `./submodules/nginx/objs/nginx`.

```javascript
import { startNginx, stopNginx, cleanupRuntime, TEST_URL } from "../harness.js";

beforeAll(async () => {
  await startNginx(`dist/${MODULE}/nginx.conf`, MODULE);
});

afterAll(async () => {
  await stopNginx();
  cleanupRuntime(MODULE);
});
```

- Default test port: 8888
- Mock servers available on ports 16379 (Redis), 15432 (Postgres), etc.

## nginx.conf Template

```nginx
daemon off;
error_log logs/error.log debug;
pid logs/nginx.pid;

events {
    worker_connections 64;
}

http {
    js_engine qjs;
    js_path "njs/";
    js_import main from app.js;

    server {
        listen 8888;
        location / {
            js_content main.handler;
        }
    }
}
```

## Key njs APIs

### HTTP Handler Pattern
```gleam
import njs/http.{type HTTPRequest}
import njs/ngx.{type JsObject}

fn handler(r: HTTPRequest) -> Nil {
  r |> http.return_text(200, "Hello")
}

pub fn exports() -> JsObject {
  ngx.object()
  |> ngx.merge("handler", handler)
}
```

### Async Handler Pattern
```gleam
fn async_handler(r: HTTPRequest) -> Promise(Nil) {
  use response <- promise.await(http.subrequest(r, "/backend", ""))
  http.return_text(r, 200, http.response_text(response))
  |> promise.resolve
}
```

### js_set Variable Pattern
```gleam
fn get_value(r: HTTPRequest) -> String {
  // Return value used as nginx variable
  "some_value"
}
```

```nginx
js_set $my_var main.get_value;
location / { return 200 "$my_var"; }
```

## Reference Implementation

Based on https://github.com/nginx/njs-examples

**Important**: Some njs-examples use nginx Plus modules (e.g., `js_periodic`, advanced key-value stores). These are NOT available in open-source nginx. Implementations should:

1. Focus on proving the Gleam bindings work correctly
2. Use equivalent open-source nginx features where possible
3. Simplify examples when nginx Plus features are required

## Implementation Status

### Complete (with tests)
- `http_hello` - Basic handler
- `http_decode_uri` - JSON parsing from query args
- `http_join_subrequests` - Parallel subrequests with Promise.all

### Stub (TODO)
All other apps in `src/app/` are stubs with `// TODO: implement`

## FFI Notes

### Buffer Encoding
The buffer FFI maps Gleam encoding types to JS strings:
- `buffer.Utf8` → `'utf8'`
- `buffer.Hex` → `'hex'`
- `buffer.Base64` → `'base64'`
- `buffer.Base64Url` → `'base64url'`

### BitArray Handling
Gleam BitArrays are passed to JS FFI. When working with strings:
- Use `<<string:utf8>>` to create BitArray from string literal
- Buffer FFI expects BitArray for `from_string`

### Headers Access

**IMPORTANT**: `http.headers_in(r)` returns njs's native HeadersIn object, NOT a Gleam Dict.
Use `http.get_header_in(r, "Header-Name")` to access individual headers:

```gleam
case http.get_header_in(r, "Authorization") {
  Ok(value) -> // header exists
  Error(_) -> // header missing
}
```

Note: Header names in njs are case-insensitive but typically use proper case (e.g., "Authorization" not "authorization").

## Common Patterns

### JWT Parsing (without verification)
```gleam
fn jwt_parse(token: String) -> Result(#(String, String), Nil) {
  case string.split(token, ".") {
    [header, payload, _sig] -> Ok(#(header, payload))
    _ -> Error(Nil)
  }
}
```

### Shared Dict (request counting, rate limiting)
```gleam
ngx.shared_dict_set("key", value, timeout_ms)
ngx.shared_dict_get("key")
```

### Crypto HMAC
```gleam
crypto.create_hmac("sha256", secret)
|> crypto.hmac_update(<<data:utf8>>)
|> crypto.hmac_digest(buffer.Base64)
```

## Debugging

1. Check nginx error logs: `dist/<app>/runtime/logs/error.log`
2. Set `KEEP_LOGS=1` to preserve runtime dir after test failure
3. Use `http.log(r, "message")` for request-scoped logging
4. Use `ngx.ngx_log(ngx.Info, "message")` for global logging
