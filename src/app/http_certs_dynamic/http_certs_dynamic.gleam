import njs/http.{type HTTPRequest}
import njs/ngx.{type JsObject}

fn js_key(r: HTTPRequest) -> Nil {
  // TODO: implement
  // Reference: submodules/njs-examples/njs/http/certs/js/dynamic.js
  // This example relies on multipart parsing, filesystem IO, and ssl_certificate
  // data: variables with shared_dict caching. The current Gleam bindings do not
  // expose multipart parsing or the required JS helpers to implement this
  // safely without adding new FFI.
  r
  |> http.return_text(200, "TODO")
}

pub fn exports() -> JsObject {
  ngx.object()
  |> ngx.merge("js_key", js_key)
}
