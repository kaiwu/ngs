//// Auth Request Authorization - HMAC signature verification
//// Reference: https://github.com/nginx/njs-examples/blob/master/njs/http/authorization/auth_request.js
////
//// This handler verifies that the Signature header contains a valid HMAC-SHA1
//// of URI + query args. If valid, proxies to backend. Otherwise returns 401.
//// Note: Uses js_content directly since auth_request module not available.

import gleam/javascript/promise.{type Promise}
import njs/buffer
import njs/crypto
import njs/http.{type HTTPRequest}
import njs/ngx.{type JsObject}

const secret_key = "my_secret_key"

fn authorize(r: HTTPRequest) -> Promise(Nil) {
  case http.get_header_in(r, "Signature") {
    Error(_) -> {
      let _ = http.error(r, "No signature")
      http.return_code(r, 401)
      |> promise.resolve
    }
    Ok(signature) -> {
      case http.method(r) {
        "GET" -> verify_get_signature(r, signature)
        method -> {
          let _ = http.error(r, "Unsupported method: " <> method)
          http.return_code(r, 401)
          |> promise.resolve
        }
      }
    }
  }
}

fn verify_get_signature(r: HTTPRequest, signature: String) -> Promise(Nil) {
  let data = case http.get_variables(r) |> ngx.get("args") {
    Ok(o) -> http.uri(r) <> ngx.to_string(o)
    Error(_) -> http.uri(r)
  }

  use computed_sig <- promise.await(crypto.compute_hmac(
    "sha1",
    buffer.from_string(secret_key, buffer.Utf8),
    buffer.from_string(data, buffer.Utf8),
    buffer.Base64,
  ))

  case computed_sig == signature {
    True -> http.internal_redirect(r, "@app-backend") |> promise.resolve
    False -> {
      let _ = http.error(r, "Invalid signature: " <> computed_sig)
      http.return_code(r, 401)
      |> promise.resolve
    }
  }
}

pub fn exports() -> JsObject {
  ngx.object()
  |> ngx.merge("authorize", authorize)
}
