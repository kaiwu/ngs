import gleam/javascript/promise
import gleam/string
import njs/http.{type HTTPRequest}
import njs/ngx.{type JsObject}

fn choose_header_value(r: HTTPRequest) -> promise.Promise(String) {
  let uri = http.uri(r)
  let value = case string.contains(uri, "upper") {
    True -> "X-UPPER"
    False -> "x-lower"
  }

  promise.resolve(value)
}

fn header_filter(r: HTTPRequest) -> promise.Promise(Nil) {
  use header_value <- promise.await(choose_header_value(r))
  http.set_headers_out(r, "X-Async-Header", header_value)
  |> http.return_text(200, "OK")
  |> promise.resolve
}

pub fn exports() -> JsObject {
  ngx.object()
  |> ngx.merge("header_filter", header_filter)
  |> ngx.merge("choose_header_value", choose_header_value)
}
