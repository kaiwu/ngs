import njs/http.{type HTTPRequest}
import njs/ngx.{type JsObject}

fn complex_redirects(r: HTTPRequest) -> Nil {
  // TODO: implement
  r
  |> http.return_text(200, "TODO")
}

pub fn exports() -> JsObject {
  ngx.object()
  |> ngx.merge("complex_redirects", complex_redirects)
}
