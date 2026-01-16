import njs/http.{type HTTPRequest}
import njs/ngx.{type JsObject}

fn create_secure_link(r: HTTPRequest) -> Nil {
  // TODO: implement
  r
  |> http.return_text(200, "TODO")
}

pub fn exports() -> JsObject {
  ngx.object()
  |> ngx.merge("create_secure_link", create_secure_link)
}
