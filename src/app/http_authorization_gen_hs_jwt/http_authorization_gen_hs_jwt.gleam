//// Generate HS256 JWT tokens
//// Reference: https://github.com/nginx/njs-examples/blob/master/njs/http/authorization/gen_hs_jwt.js

import gleam/javascript/promise.{type Promise}
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

fn sign_jwt(
  header_b64: String,
  payload_b64: String,
  secret: String,
) -> Promise(String) {
  let signing_input = header_b64 <> "." <> payload_b64
  crypto.compute_hmac(
    "sha256",
    buffer.from_string(secret, buffer.Utf8),
    buffer.from_string(signing_input, buffer.Utf8),
    buffer.Base64Url,
  )
}

fn generate_jwt(sub: String, iss: String) -> Promise(String) {
  let header_b64 = make_jwt_header()
  let payload_b64 = make_jwt_payload(sub, iss)
  use signature <- promise.await(sign_jwt(header_b64, payload_b64, jwt_secret))
  promise.resolve(header_b64 <> "." <> payload_b64 <> "." <> signature)
}

/// js_set variable function - generates a JWT for the request
fn jwt(r: HTTPRequest) -> Promise(String) {
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
