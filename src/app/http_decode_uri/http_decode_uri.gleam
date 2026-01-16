import gleam/dynamic/decode
import gleam/json
import gleam/result

import njs/http.{type HTTPRequest}
import njs/ngx.{type JsObject}

fn dec_foo(r: HTTPRequest) -> String {
  let decoder = {
    use value <- decode.field("foo", decode.string)
    decode.success(value)
  }
  r
  |> http.args
  |> ngx.to_string
  |> json.parse(decoder)
  |> result.unwrap("")
}

pub fn exports() -> JsObject {
  ngx.object()
  |> ngx.merge("dec_foo", dec_foo)
}
