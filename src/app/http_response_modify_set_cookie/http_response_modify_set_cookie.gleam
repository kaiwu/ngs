import njs/http.{type HTTPRequest}
import njs/ngx.{type JsObject}

fn cookies_filter(r: HTTPRequest) -> Nil {
  // TODO: implement
  r
  |> http.return_text(200, "TODO")
}

pub fn exports() -> JsObject {
  ngx.object()
  |> ngx.merge("cookies_filter", cookies_filter)
}
