# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NGS provides Gleam bindings for nginx's njs (JavaScript) runtime. It enables writing type-safe, functional nginx handlers in Gleam. The compiled JavaScript targets ES2020 and requires the QuickJS engine (`js_engine qjs` in nginx.conf).

## Commands

```bash
gleam test                          # Unit tests — run before bun test; fix failures before continuing
npm run build                       # Compile Gleam → JS, bundle with esbuild into dist/
npm run watch                       # Watch mode with live reload
bun test                            # All integration tests (starts real nginx per suite)
bun test tests/<name>/do.test.js    # Single integration test suite
KEEP_LOGS=1 bun test ...            # Preserve dist/<app>/runtime/logs/ after failure
npm run clean                       # Remove dist/ (keeps Gleam build cache)
npm run purge                       # Full clean including Gleam build cache
bun run scripts/audit_njs_apis.ts  # API coverage audit against njs C source
```

## Architecture

```
src/
├── njs/            # Gleam bindings — one .gleam file + one _ffi.mjs file per API domain
├── app/<name>/     # Example nginx handlers
│   ├── <name>.gleam    # Handler implementation (only uses src/njs/* bindings)
│   └── nginx.conf      # nginx configuration for this app
├── *_ffi.mjs       # FFI shims (JS files that call njs APIs directly)
└── ngs.gleam       # Build system: registers every app in apps()

tests/
├── harness.js      # Spawns nginx, manages runtime dirs, exposes TEST_URL
├── preload.js      # Runs npm run build once before the whole test run
├── mocks/          # Long-lived mock servers started by harness (Redis 16379, Postgres 15432,
│                   #   Consul 18500, OIDC 19000, ACME 14000, HTTP 19001-19003)
└── <name>/do.test.js
```

The build pipeline (`src/ngs.gleam` → `src/ngs_ffi.mjs`) runs Gleam compilation then esbuild, writing `dist/<app>/njs/app.js` + `dist/<app>/nginx.conf` for each registered app.

## CRITICAL: njs Runtime

**njs uses QuickJS, not Node.js.** While APIs look similar they are not the same.

- No npm packages — only built-in njs modules
- Globals: `ngx`, `njs`, `console`, `crypto` (Web Crypto)
- Promises work; no event loop, no `setImmediate`, limited `setTimeout`
- Log levels in njs C source are `ngx.ERR`, `ngx.WARN`, `ngx.INFO` (not `ERROR`)

Official references: [njs reference](https://nginx.org/en/docs/njs/reference.html) · [compatibility](https://nginx.org/en/docs/njs/compatibility.html) · [QuickJS engine notes](https://nginx.org/en/docs/njs/engine.html)

## FFI Rules

**Never add or modify `*_ffi.mjs` files when implementing apps.** Apps must be built entirely from the existing `src/njs/*.gleam` bindings. Creating new FFI is a last resort for binding gaps, not for app logic — it defeats the purpose of verifying the Gleam binding layer.

## Key Binding Conventions

### Logging
```gleam
import njs/ngx
ngx.log(ngx.info, "message")   // ngx.info = 0, ngx.warn = 1, ngx.error = 2
```

### HTTP handler exports
Every app must export a `JsObject` that maps string names to handler functions:
```gleam
pub fn exports() -> JsObject {
  ngx.object()
  |> ngx.merge("handler", handler)
}
```

### Async handlers
```gleam
fn async_handler(r: HTTPRequest) -> Promise(Nil) {
  use response <- promise.await(http.subrequest(r, "/backend", ""))
  http.return_text(r, 200, http.response_text(response))
  |> promise.resolve
}
```

### js_set variable handlers (sync only — cannot return Promise)
```gleam
fn get_value(r: HTTPRequest) -> String { "some_value" }
```
```nginx
js_set $my_var main.get_value;
```

### Headers access
`http.headers_in(r)` returns the njs native `HeadersIn` proxy, not a Gleam Dict. Always use:
```gleam
case http.get_header_in(r, "Authorization") {
  Ok(value) -> ...
  Error(_) -> ...
}
```
Header names are case-insensitive in njs but use canonical casing (e.g. `"Authorization"`).

### Crypto (async Web Crypto — the Gleam API)
```gleam
// Hash
let hash_str <- promise.await(crypto.compute_hash("sha256", data_buf, buffer.Hex))

// HMAC
let hmac_str <- promise.await(crypto.compute_hmac("sha256", key_buf, data_buf, buffer.Base64))
```
The node-style synchronous `createHash`/`createHmac` chain is intentionally not exposed — the async Web Crypto path covers all practical handler use cases. The only unsupported case is computing a hash inside a `js_set` handler (which cannot return a Promise).

### Shared Dict
```gleam
import njs/shared_dict
case shared_dict.get_shared_dict("dict_name") {
  Ok(dict) -> shared_dict.get(dict, "key")
  Error(_) -> ...
}
```

### Buffer encodings
```gleam
buffer.Utf8 | buffer.Hex | buffer.Base64 | buffer.Base64Url
```

### Stream callbacks
`StreamData` carries three fields — both flags from the njs `option` object are exposed:
```gleam
case event {
  StreamString(data, last, from_upstream) -> ...
  StreamBuffer(buf,  last, from_upstream) -> ...
}
```

## Adding a New App

1. Create `src/app/<name>/<name>.gleam` and `src/app/<name>/nginx.conf`
2. Register in `src/ngs.gleam` inside `apps()`:
   ```gleam
   App("<name>", "./build/dev/javascript/ngs/app/<name>/<name>.mjs"),
   ```
3. Create `tests/<name>/do.test.js` using the harness pattern below
4. Run `gleam test && npm run build && bun test tests/<name>/do.test.js`

### Test file template
```javascript
import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { startNginx, stopNginx, cleanupRuntime, TEST_URL } from "../harness.js";

const MODULE = "<name>";

describe("<name>", () => {
  beforeAll(async () => { await startNginx(`dist/${MODULE}/nginx.conf`, MODULE); });
  afterAll(async () => { await stopNginx(); cleanupRuntime(MODULE); });

  test("...", async () => {
    const res = await fetch(`${TEST_URL}/`);
    expect(res.status).toBe(200);
  });
});
```

## nginx.conf Minimum Template

```nginx
daemon off;
error_log logs/error.log debug;
pid logs/nginx.pid;
events { worker_connections 64; }

http {
    js_engine qjs;
    js_path "njs/";
    js_import main from app.js;
    server {
        listen 8888;
        location / { js_content main.handler; }
    }
}
```

## Debugging

- nginx error logs: `dist/<app>/runtime/logs/error.log`
- Request-scoped: `http.log(r, "message")` or `http.warn(r, "message")`
- Global: `ngx.log(ngx.info, "message")`
- `KEEP_LOGS=1 bun test ...` prevents the runtime directory from being cleaned up on failure

## nginx Plus Limitations

Some njs-examples reference nginx Plus features unavailable in open-source nginx: `js_periodic`, advanced key-value stores, some certificate management directives. Implementations use open-source equivalents where possible; see ROADMAP.md for deferred items.
