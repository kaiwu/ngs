import njs/http.{type HTTPRequest}
import njs/ngx.{type JsObject}

fn dec_foo(r: HTTPRequest) -> Nil {
  // TODO: implement decode_uri logic
  r
  |> http.return_text(200, "TODO")
}

pub fn exports() -> JsObject {
  ngx.object()
  |> ngx.merge("dec_foo", dec_foo)
}
