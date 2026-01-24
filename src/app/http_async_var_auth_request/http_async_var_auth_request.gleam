import gleam/string
import njs/http.{type HTTPRequest}
import njs/ngx.{type JsObject}

fn backend_var(r: HTTPRequest) -> String {
  let uri = http.uri(r)
  case string.contains(uri, "/a") {
    True -> "127.0.0.1:8081"
    False -> "127.0.0.1:8082"
  }
}

pub fn exports() -> JsObject {
  ngx.object()
  |> ngx.merge("backend_var", backend_var)
}
