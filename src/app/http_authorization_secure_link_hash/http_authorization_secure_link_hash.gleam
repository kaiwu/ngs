//// Secure Link Hash - MD5 hash verification for protected resources
//// Reference: https://github.com/nginx/njs-examples/blob/master/njs/http/authorization/secure_link_hash.js
////
//// Creates secure links using MD5(uri + secret) and verifies them via cookie.
//// Note: Uses pure njs since secure_link module not available.

import gleam/javascript/promise.{type Promise}
import gleam/list
import gleam/string
import njs/buffer
import njs/crypto
import njs/http.{type HTTPRequest}
import njs/ngx.{type JsObject}

const secret_key = "my_secure_secret"

fn create_secure_link(r: HTTPRequest) -> Promise(String) {
  let uri = http.uri(r)
  let data = uri <> secret_key
  crypto.compute_hash(
    "sha256",
    buffer.from_string(data, buffer.Utf8),
    buffer.Base64Url,
  )
}

fn verify_and_proxy(r: HTTPRequest) -> Promise(Nil) {
  case http.get_header_in(r, "Cookie") {
    Error(_) -> redirect_with_cookie(r)
    Ok(cookie_header) -> {
      case extract_cookie(cookie_header, "secure_link") {
        Error(_) -> redirect_with_cookie(r)
        Ok(cookie_hash) -> {
          use expected_hash <- promise.await(create_secure_link(r))
          case cookie_hash == expected_hash {
            True -> http.internal_redirect(r, "@backend") |> promise.resolve
            False -> redirect_with_cookie(r)
          }
        }
      }
    }
  }
}

fn redirect_with_cookie(r: HTTPRequest) -> Promise(Nil) {
  use hash <- promise.await(create_secure_link(r))
  let cookie = "secure_link=" <> hash <> "; Max-Age=60; Path=/"
  let _ = http.set_headers_out(r, "Set-Cookie", cookie)
  http.return_text(r, 302, http.uri(r))
  |> promise.resolve
}

fn extract_cookie(header: String, name: String) -> Result(String, Nil) {
  let prefix = name <> "="
  header
  |> string.split(";")
  |> list.map(string.trim)
  |> list.find(fn(cookie) { string.starts_with(cookie, prefix) })
  |> result_map(fn(cookie) { string.drop_start(cookie, string.length(prefix)) })
}

fn result_map(result: Result(a, e), f: fn(a) -> b) -> Result(b, e) {
  case result {
    Ok(value) -> Ok(f(value))
    Error(e) -> Error(e)
  }
}

pub fn exports() -> JsObject {
  ngx.object()
  |> ngx.merge("verify_and_proxy", verify_and_proxy)
}
