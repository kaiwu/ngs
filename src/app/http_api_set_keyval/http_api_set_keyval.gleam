import njs/http.{type HTTPRequest}
import njs/ngx.{type JsObject}

fn set_keyval(r: HTTPRequest) -> Nil {
  // TODO: implement
  r
  |> http.return_text(200, "TODO")
}

pub fn exports() -> JsObject {
  ngx.object()
  |> ngx.merge("set_keyval", set_keyval)
}
