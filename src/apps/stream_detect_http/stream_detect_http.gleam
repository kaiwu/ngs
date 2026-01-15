import njs/http.{type HTTPRequest}
import njs/ngx.{type JsObject}

fn detect_http(r: HTTPRequest) -> Nil {
  // TODO: implement
  r
  |> http.return_text(200, "TODO")
}

pub fn exports() -> JsObject {
  ngx.object()
  |> ngx.merge("detect_http", detect_http)
}
