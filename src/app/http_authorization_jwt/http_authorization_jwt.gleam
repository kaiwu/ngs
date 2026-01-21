//// JWT Authorization - Parse and extract JWT payload 'sub' claim
//// Reference: https://github.com/nginx/njs-examples/blob/master/njs/http/authorization/jwt.js

import gleam/dynamic/decode
import gleam/json
import gleam/result
import gleam/string

import njs/http.{type HTTPRequest}
import njs/ngx.{type JsObject}

fn jwt_parse(token: String) -> Result(#(String, String), Nil) {
  case string.split(token, ".") {
    [header, payload, _signature] -> Ok(#(header, payload))
    _ -> Error(Nil)
  }
}

fn get_sub_claim(payload_b64: String) -> String {
  let decoder = {
    use sub <- decode.field("sub", decode.string)
    decode.success(sub)
  }

  payload_b64
  |> ngx.base64url_decode
  |> json.parse(decoder)
  |> result.unwrap("")
}

fn jwt_payload_sub(r: HTTPRequest) -> String {
  case http.get_header_in(r, "Authorization") {
    Ok(auth_header) -> {
      let token = string.drop_start(auth_header, 7)
      case jwt_parse(token) {
        Ok(#(_header, payload)) -> get_sub_claim(payload)
        Error(_) -> ""
      }
    }
    Error(_) -> ""
  }
}

pub fn exports() -> JsObject {
  ngx.object()
  |> ngx.merge("jwt_payload_sub", jwt_payload_sub)
}
