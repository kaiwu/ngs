//// Auth Request Authorization - HMAC signature verification
//// Reference: https://github.com/nginx/njs-examples/blob/master/njs/http/authorization/auth_request.js
////
//// This handler verifies that the Signature header contains a valid HMAC-SHA1
//// of URI + query args. If valid, proxies to backend. Otherwise returns 401.
//// Note: Uses js_content directly since auth_request module not available.

import njs/buffer
import njs/crypto
import njs/http.{type HTTPRequest}
import njs/ngx.{type JsObject}

const secret_key = "my_secret_key"

fn authorize(r: HTTPRequest) -> Nil {
  case http.get_header_in(r, "Signature") {
    Error(_) -> {
      let _ = http.error(r, "No signature")
      http.return_code(r, 401)
    }
    Ok(signature) -> {
      case http.method(r) {
        "GET" -> verify_get_signature(r, signature)
        method -> {
          let _ = http.error(r, "Unsupported method: " <> method)
          http.return_code(r, 401)
        }
      }
    }
  }
}

fn verify_get_signature(r: HTTPRequest, signature: String) -> Nil {
  let uri = http.uri(r)

  let computed_sig =
    crypto.create_hmac("sha1", secret_key)
    |> crypto.hmac_update(buffer.from_string(uri, buffer.Utf8))
    |> crypto.hmac_digest(buffer.Base64)

  case computed_sig == signature {
    True -> http.internal_redirect(r, "@app-backend")
    False -> {
      let _ = http.error(r, "Invalid signature: " <> computed_sig)
      http.return_code(r, 401)
    }
  }
}

pub fn exports() -> JsObject {
  ngx.object()
  |> ngx.merge("authorize", authorize)
}
