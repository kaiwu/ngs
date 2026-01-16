# ngs

**Write functional, type-safe nginx scripts (njs) with Gleam**

[![Package Version](https://img.shields.io/hexpm/v/ngs)](https://hex.pm/packages/ngs)
[![Hex Docs](https://img.shields.io/badge/hex-docs-ffaff3)](https://hexdocs.pm/ngs/)

> **ngs** is a Gleam library that provides type-safe bindings to Nginx JavaScript (njs) runtime, allowing you to write functional, type-safe nginx handlers in Gleam instead of plain JavaScript.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Installation](#installation)
- [Requirements](#requirements)
- [Quick Start](#quick-start)
- [API Documentation](#api-documentation)
- [Examples](#examples)
- [Testing](#testing)
- [Development](#development)
- [Project Structure](#project-structure)

## Overview

**ngs** bridges the gap between Gleam's type-safe functional programming and Nginx's powerful JavaScript scripting capabilities (njs). It enables you to:

- Write nginx handlers using Gleam's expressive type system
- Leverage njs's extensive API with compile-time safety
- Offload HTTP server logic to nginx for better performance
- Use Gleam's pattern matching and functional composition for request handling

The compiled JavaScript conforms to the `es2020` standard and requires NJS with QuickJS engine support.

## Features

- **Type-safe njs bindings** - Full coverage of njs HTTP, Stream, and utility APIs
- **Functional programming** - Use Gleam's pattern matching and functional composition
- **Build system integration** - Automated compilation and bundling with esbuild
- **Watch mode** - Live reloading during development
- **Comprehensive examples** - 25+ [real-world nginx handler implementations](https://github.com/nginx/njs-examples.git) (to be finished by AI)
- **Integration testing** - Bun-based tests with real nginx instances
- **Mock infrastructure** - Built-in mock servers for Redis, Postgres, Consul, OIDC, ACME, and HTTP

## Installation

### Add ngs to your Gleam project

```bash
gleam add ngs
```

### Set up npm dependencies

```bash
npm install
```

## Requirements

- **Gleam** >= 1.14.0
- **NJS** with QuickJS engine (ES2020 support)
- **Node.js** (for esbuild bundling)
- **Bun** (for running tests)

## Quick Start

### 1. Create a simple nginx handler

Create a Gleam module for your handler:

```gleam
// src/my_handler.gleam
import njs/http.{type HTTPRequest}
import njs/ngx.{type JsObject}

fn hello(r: HTTPRequest) -> Nil {
  r
  |> http.return_text(200, "Hello from Gleam!\n")
}

pub fn exports() -> JsObject {
  ngx.object()
  |> ngx.merge("hello", hello)
}
```

### 2. Build the application

```bash
npm run build
```

This compiles your Gleam code to JavaScript and bundles it with esbuild.

### 3. Configure nginx

Create an nginx configuration that loads your handler:

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
            js_content main.hello;
        }
    }
}
```

### 4. Run nginx

```bash
nginx -c path/to/nginx.conf -p path/to/runtime
```

Your handler is now running at `http://localhost:8888/`!

## API Documentation

ngs provides comprehensive bindings to njs APIs organized by module:

### Core HTTP Module (`njs/http`)

Type-safe bindings for HTTP request handling:

```gleam
import njs/http

// Request information
http.headers_in(request)
http.method(request)
http.uri(request)
http.remote_address(request)

// Response handling
http.return_text(request, 200, "Hello")
http.return_code(request, 200)
http.set_status(request, 201)
http.set_headers_out(request, "Content-Type", "application/json")

// Async operations
http.subrequest(request, "/api", options)
```

**Key types:**
- `HTTPRequest` - Incoming HTTP request
- `HTTPResponse` - HTTP response (alias of HTTPRequest)
- `HTTPHandler` - Handler function type

### Stream Module (`njs/stream`)

Handle TCP/UDP streams in nginx:

```gleam
import njs/stream

// Session control
stream.allow(session)
stream.decline(session)
stream.deny(session)

// Event handling
stream.on(session, "data", callback)

// Logging
stream.log(session, "Connection established")
```

### Crypto Module (`njs/crypto`)

Modern cryptographic operations:

```gleam
import njs/crypto

// Hashing
let hash = crypto.create_hash("sha256")
  |> crypto.hash_update("data")
  |> crypto.hash_digest(Hex)

// HMAC
let hmac = crypto.create_hmac("sha256", "secret")
  |> crypto.hmac_update("data")
  |> crypto.hmac_digest(Base64)

// AES encryption
crypto.encrypt(AesGcm(...), key, plaintext)
crypto.decrypt(AesGcm(...), key, ciphertext)
```

**Supports:**
- SHA-256, SHA-384, SHA-512
- HMAC with various algorithms
- AES-CTR, AES-CBC, AES-GCM encryption
- RSA-OAEP
- Key generation, import/export
- Key derivation

### Buffer Module (`njs/buffer`)

Efficient binary data handling:

```gleam
import njs/buffer

// Create buffers
let buf = buffer.alloc(1024)

// Read/write operations
buffer.write_int32_be(buf, 42, 0)
let value = buffer.read_uint32_be(buf, 0)

// String encoding/decoding
buffer.from_string("hello", Utf8)
buffer.to_string(buf, Utf8, 0, 5)
```

### File System Module (`njs/fs`)

Synchronous and asynchronous file operations:

```gleam
import njs/fs

// Sync operations
fs.stat_sync("file.txt")
fs.read_file_sync("data.json", Utf8)
fs.write_file_sync("output.txt", "data", Utf8)

// Async operations
use handle <- promise.await(fs.promises_open("file.txt", "r", 0o644))
use result <- promise.await(fs.file_handle_read(handle, buf, 0, 1024, None))
```

### Utility Modules

- **`njs/ngx`** - Core nginx utilities, logging, shared dictionary
- **`njs/headers`** - HTTP header manipulation
- **`njs/console`** - Console logging
- **`njs/timers`** - Timer operations
- **`njs/querystring`** - URL query parsing/formatting
- **`njs/xml`** - XML parsing
- **`njs/zlib`** - Compression
- **`njs/process`** - Process information
- **`njs/text_encoder`** - Text encoding
- **`njs/text_decoder`** - Text decoding
- **`njs/shared_dict`** - Shared memory dictionaries

See [hexdocs.pm/ngs](https://hexdocs.pm/ngs/) for complete API documentation.

## Examples

The project includes 25+ example nginx handlers organized by category:

### HTTP Handlers

| Example | Description |
|---------|-------------|
| `http_hello` | Basic "Hello World" handler |
| `http_decode_uri` | URI decoding with query parameters |
| `http_complex_redirects` | Complex redirect logic |
| `http_join_subrequests` | Join multiple subrequests |
| `http_subrequests_chaining` | Chain subrequests sequentially |

### Authorization

| Example | Description |
|---------|-------------|
| `http_authorization_jwt` | JWT verification |
| `http_authorization_gen_hs_jwt` | Generate HS256 JWT tokens |
| `http_authorization_auth_request` | Auth request pattern |
| `http_authorization_request_body` | Validate request body |
| `http_authorization_secure_link_hash` | Secure link with hash |

### Certificate Handling

| Example | Description |
|---------|-------------|
| `http_certs_dynamic` | Dynamic certificate loading |
| `http_certs_fetch_https` | Fetch certificates via HTTPS |
| `http_certs_subject_alternative` | X.509 subject alternative name parsing |

### Response Modification

| Example | Description |
|---------|-------------|
| `http_response_to_lower_case` | Convert response to lowercase |
| `http_response_modify_set_cookie` | Modify Set-Cookie headers |

### Async Operations

| Example | Description |
|---------|-------------|
| `http_async_var_auth_request` | Async auth request |
| `http_async_var_js_header_filter` | Async header filter |

### Utilities

| Example | Description |
|---------|-------------|
| `http_logging_num_requests` | Request counting |
| `http_rate_limit_simple` | Simple rate limiting |
| `http_api_set_keyval` | Key-value API |
| `misc_file_io` | File I/O operations |
| `misc_aes_gcm` | AES-GCM encryption |

### Stream Handlers

| Example | Description |
|---------|-------------|
| `stream_auth_request` | Stream authentication |
| `stream_detect_http` | HTTP detection in streams |
| `stream_inject_header` | Inject headers into streams |

Each example includes:
- Gleam handler implementation in `src/app/<name>/`
- Nginx configuration in `src/app/<name>/nginx.conf`
- Integration tests in `tests/<name>/`

## Testing

ngs uses Bun for integration testing with real nginx instances.

### Run all tests

```bash
bun test
```

### Run specific test suite

```bash
bun test tests/hello/do.test.js
```

### Test infrastructure

The test harness (`tests/harness.js`) provides:

- **nginx process management** - Start/stop nginx with custom configs
- **Isolated runtime directories** - Clean runtime environment for each test
- **Mock servers** - Pre-configured mock servers for external dependencies:
  - Redis (port 16379)
  - PostgreSQL (port 15432)
  - Consul (port 18500)
  - OIDC (port 19000)
  - ACME (port 14000)
  - HTTP backends (ports 19001-19003)

### Test structure

```javascript
import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { startNginx, stopNginx, cleanupRuntime, TEST_URL } from "../harness.js";

const MODULE = "http_hello";

describe("http hello", () => {
  beforeAll(async () => {
    await startNginx(`dist/${MODULE}/nginx.conf`, MODULE);
  });

  afterAll(async () => {
    await stopNginx();
    cleanupRuntime(MODULE);
  });

  test("outputs 'hello' text", async () => {
    const res = await fetch(`${TEST_URL}/hello`);
    expect(res.status).toBe(200);
    const body = await res.text();
    expect(body).toBe("Hello World!\n");
  });
});
```

## Development

### Build system

ngs uses a custom build system (`src/ngs.gleam`) that:

1. Compiles Gleam code to JavaScript
2. Bundles applications with esbuild
3. Copies nginx configurations to dist directory

### Available npm scripts

```bash
# Build all applications
npm run build

# Watch mode with live reloading
npm run watch

# Clean dist directory (keeps Gleam cache)
npm run clean

# Full clean including Gleam build cache
npm run purge
```

### Adding a new example

1. **Create the handler module**

```bash
mkdir -p src/app/my_example
```

```gleam
// src/app/my_example/my_example.gleam
import njs/http.{type HTTPRequest}
import njs/ngx.{type JsObject}

fn handler(r: HTTPRequest) -> Nil {
  r |> http.return_text(200, "OK")
}

pub fn exports() -> JsObject {
  ngx.object() |> ngx.merge("handler", handler)
}
```

2. **Create nginx configuration**

```nginx
# src/app/my_example/nginx.conf
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

3. **Register in build system**

Add your app to the `apps()` list in `src/ngs.gleam`:

```gleam
App(
  "my_example",
  "./build/dev/javascript/ngs/app/my_example/my_example.mjs",
),
```

4. **Build and test**

```bash
npm run build
```

5. **Create tests (optional)**

```bash
mkdir -p tests/my_example
```

```javascript
// tests/my_example/do.test.js
import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { startNginx, stopNginx, cleanupRuntime, TEST_URL } from "../harness.js";

const MODULE = "my_example";

describe("my example", () => {
  beforeAll(async () => {
    await startNginx(`dist/${MODULE}/nginx.conf`, MODULE);
  });

  afterAll(async () => {
    await stopNginx();
    cleanupRuntime(MODULE);
  });

  test("works correctly", async () => {
    const res = await fetch(`${TEST_URL}/`);
    expect(res.status).toBe(200);
  });
});
```

## Project Structure

```
ngs/
├── src/
│   ├── njs/                 # njs API bindings (19 modules)
│   │   ├── http.gleam       # HTTP request handling
│   │   ├── stream.gleam     # TCP/UDP stream handling
│   │   ├── crypto.gleam     # Cryptographic operations
│   │   ├── buffer.gleam     # Binary data manipulation
│   │   ├── fs.gleam         # File system operations
│   │   ├── ngx.gleam        # Core nginx utilities
│   │   ├── headers.gleam    # HTTP headers
│   │   ├── console.gleam    # Console logging
│   │   ├── timers.gleam     # Timer operations
│   │   ├── querystring.gleam # URL query parsing
│   │   ├── xml.gleam        # XML parsing
│   │   ├── zlib.gleam       # Compression
│   │   ├── process.gleam     # Process information
│   │   ├── text_encoder.gleam # Text encoding
│   │   ├── text_decoder.gleam # Text decoding
│   │   └── shared_dict.gleam # Shared memory
│   ├── app/                 # Example handlers (25+)
│   │   ├── http_hello/
│   │   │   ├── http_hello.gleam
│   │   │   └── nginx.conf
│   │   ├── http_authorization_jwt/
│   │   ├── http_rate_limit_simple/
│   │   └── ...
│   └── ngs.gleam           # Build system
├── tests/
│   ├── harness.js          # Test infrastructure
│   ├── preload.js          # Test preloader (builds apps)
│   ├── mocks/              # Mock servers
│   │   ├── redis.js
│   │   ├── postgres.js
│   │   ├── consul.js
│   │   ├── oidc.js
│   │   ├── acme.js
│   │   └── http.js
│   ├── hello/
│   │   └── do.test.js
│   └── ...
├── dist/                   # Build output (generated)
├── build/                  # Gleam build artifacts (generated)
├── gleam.toml             # Gleam project configuration
├── package.json           # npm scripts and dependencies
└── README.md              # This file
```

## Further Documentation

Complete API documentation is available at [hexdocs.pm/ngs](https://hexdocs.pm/ngs/).

For njs documentation, see [nginx.org/en/docs/njs/](http://nginx.org/en/docs/njs/).

## License

Apache-2.0 - see [LICENSE](LICENSE) for details.
