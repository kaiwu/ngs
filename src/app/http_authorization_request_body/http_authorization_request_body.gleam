//// Request Body Authorization - Validate request body content before proxying
//// Reference: njs-examples authorization patterns
////
//// This handler validates that the request body contains valid JSON with
//// a required "token" field. If validation passes, the request is proxied
//// to the backend via internal redirect.

import gleam/dynamic/decode
import gleam/json
import gleam/string

import njs/http.{type HTTPRequest}
import njs/ngx.{type JsObject}

/// Validate that request body contains required token field
fn validate_body(body: String) -> Result(String, String) {
  // Body must not be empty
  case string.is_empty(string.trim(body)) {
    True -> Error("Empty request body")
    False -> {
      // Parse JSON and extract token
      let decoder = {
        use token <- decode.field("token", decode.string)
        decode.success(token)
      }

      case json.parse(body, decoder) {
        Ok(token) -> {
          case string.is_empty(token) {
            True -> Error("Token is empty")
            False -> Ok(token)
          }
        }
        Error(_) -> Error("Invalid JSON or missing token field")
      }
    }
  }
}

/// Authorization handler - validates request body and proxies to backend
fn authorize(r: HTTPRequest) -> Nil {
  let body = http.request_text(r)

  case validate_body(body) {
    Ok(_token) -> {
      // Valid token found - proxy to backend via internal redirect
      http.internal_redirect(r, "@app-backend")
    }
    Error(reason) -> {
      let _ = http.log(r, "Authorization failed: " <> reason)
      http.return_text(r, 403, "Forbidden: " <> reason <> "\n")
    }
  }
}

pub fn exports() -> JsObject {
  ngx.object()
  |> ngx.merge("authorize", authorize)
}
