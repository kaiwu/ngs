import njs/http.{type HTTPRequest}
import njs/ngx.{type JsObject}

fn inject_header(r: HTTPRequest) -> Nil {
  // TODO: implement
  r
  |> http.return_text(200, "TODO")
}

pub fn exports() -> JsObject {
  ngx.object()
  |> ngx.merge("inject_header", inject_header)
}
