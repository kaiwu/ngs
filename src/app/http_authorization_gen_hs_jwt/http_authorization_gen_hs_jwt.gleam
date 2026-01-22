//// Generate HS256 JWT tokens
//// Reference: https://github.com/nginx/njs-examples/blob/master/njs/http/authorization/gen_hs_jwt.js

import gleam/json

import njs/buffer
import njs/crypto
import njs/http.{type HTTPRequest}
import njs/ngx.{type JsObject}

/// Default secret key for JWT signing (in production, use env variable)
const jwt_secret = "secret_key"

fn make_jwt_header() -> String {
  json.object([#("typ", json.string("JWT")), #("alg", json.string("HS256"))])
  |> json.to_string
  |> ngx.base64url_encode
}

fn make_jwt_payload(sub: String, iss: String) -> String {
  json.object([#("sub", json.string(sub)), #("iss", json.string(iss))])
  |> json.to_string
  |> ngx.base64url_encode
}

fn sign_jwt(header_b64: String, payload_b64: String, secret: String) -> String {
  let signing_input =
    { header_b64 <> "." <> payload_b64 } |> buffer.from_string(buffer.Utf8)

  crypto.create_hmac("sha256", secret)
  |> crypto.hmac_update(signing_input)
  |> crypto.hmac_digest(buffer.Base64Url)
}

fn generate_jwt(sub: String, iss: String) -> String {
  let header_b64 = make_jwt_header()
  let payload_b64 = make_jwt_payload(sub, iss)
  let signature = sign_jwt(header_b64, payload_b64, jwt_secret)

  header_b64 <> "." <> payload_b64 <> "." <> signature
}

/// js_set variable function - generates a JWT for the request
fn jwt(r: HTTPRequest) -> String {
  // Get sub from query param or use default
  let sub = case http.get_header_in(r, "X-Subject") {
    Ok(s) -> s
    Error(_) -> "user"
  }

  let iss = case http.get_header_in(r, "X-Issuer") {
    Ok(i) -> i
    Error(_) -> "nginx"
  }

  generate_jwt(sub, iss)
}

pub fn exports() -> JsObject {
  ngx.object()
  |> ngx.merge("jwt", jwt)
}
