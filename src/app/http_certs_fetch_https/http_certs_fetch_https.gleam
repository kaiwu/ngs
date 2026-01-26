import gleam/int
import gleam/javascript/promise
import gleam/string
import njs/http.{type HTTPRequest}
import njs/ngx.{type JsObject}
import njs/response

fn fetch(r: HTTPRequest) -> promise.Promise(Nil) {
  use reply <- promise.await(ngx.fetch_url("https://nginx.org/", Nil))
  use text <- promise.await(response.text(reply))
  let prefix = string.slice(text, 0, 200)
  let rest = string.length(text) - 200
  http.return_text(
    r,
    200,
    "----------NGINX.ORG-----------\n"
      <> prefix
      <> " ..."
      <> int.to_string(rest)
      <> " left...\n"
      <> "----------NGINX.ORG-----------",
  )
  |> promise.resolve
}

pub fn exports() -> JsObject {
  ngx.object()
  |> ngx.merge("fetch", fetch)
}
