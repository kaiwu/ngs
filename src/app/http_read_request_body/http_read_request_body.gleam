import gleam/javascript/promise.{type Promise}
import njs/buffer
import njs/http.{type HTTPRequest}
import njs/ngx.{type JsObject}

fn store_text(r: HTTPRequest) -> Promise(Nil) {
  use text <- promise.await(http.read_request_text(r))
  http.set_variables(r, "body_echo", text)
  promise.resolve(Nil)
}

fn store_buffer(r: HTTPRequest) -> Promise(Nil) {
  use ab <- promise.await(http.read_request_array_buffer(r))
  let len = buffer.array_buffer_byte_length(ab)
  let buf = buffer.from(ab, 0, len)
  let text = buffer.to_string(buf, buffer.Utf8, 0, len)
  http.set_variables(r, "body_echo", text)
  promise.resolve(Nil)
}

fn store_json(r: HTTPRequest) -> Promise(Nil) {
  use obj <- promise.await(http.read_request_json(r))
  let value = case ngx.get(obj, "msg") {
    Ok(v) -> ngx.to_string(v)
    Error(_) -> ""
  }
  http.set_variables(r, "body_echo", value)
  promise.resolve(Nil)
}

fn echo_body(r: HTTPRequest) -> Nil {
  case http.get_variable(r, "body_echo") {
    Ok(v) -> http.return_text(r, 200, v)
    Error(_) -> http.return_text(r, 500, "")
  }
}

fn just_decline(r: HTTPRequest) -> Nil {
  http.decline(r)
}

pub fn exports() -> JsObject {
  ngx.object()
  |> ngx.merge("store_text", store_text)
  |> ngx.merge("store_buffer", store_buffer)
  |> ngx.merge("store_json", store_json)
  |> ngx.merge("echo_body", echo_body)
  |> ngx.merge("just_decline", just_decline)
}
