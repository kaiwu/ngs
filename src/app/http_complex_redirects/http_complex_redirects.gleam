import gleam/string
import njs/http.{type HTTPRequest}
import njs/ngx.{type JsObject}

fn redirect(r: HTTPRequest) -> Nil {
  let uri = http.uri(r)
  let location = case string.contains(uri, "to_a") {
    True -> "/a"
    False -> "/b"
  }

  http.return_code(http.set_headers_out(r, "Location", location), 302)
  Nil
}

fn a(r: HTTPRequest) -> Nil {
  http.return_text(r, 200, "A")
}

fn b(r: HTTPRequest) -> Nil {
  http.return_text(r, 200, "B")
}

pub fn exports() -> JsObject {
  ngx.object()
  |> ngx.merge("redirect", redirect)
  |> ngx.merge("a", a)
  |> ngx.merge("b", b)
}
