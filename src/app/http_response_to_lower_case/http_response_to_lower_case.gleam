import gleam/string
import njs/buffer
import njs/http.{type HTTPRequest}
import njs/ngx.{type JsObject}

fn to_lower_case(r: HTTPRequest, data: String, flags: JsObject) -> Nil {
  let lower = string.lowercase(data)
  let buf = buffer.from_string(lower, buffer.Utf8)
  let _ = http.send_buffer(r, buf, flags)
  Nil
}

pub fn exports() -> JsObject {
  ngx.object()
  |> ngx.merge("to_lower_case", to_lower_case)
}
