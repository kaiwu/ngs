import njs/http.{type HTTPRequest}
import njs/ngx.{type JsObject}

fn num_requests(r: HTTPRequest) -> Nil {
  // TODO: implement
  r
  |> http.return_text(200, "TODO")
}

pub fn exports() -> JsObject {
  ngx.object()
  |> ngx.merge("num_requests", num_requests)
}
