//// the module implements a few njs exmpales found at
//// https://github.com/nginx/njs-examples
////

import njs/http.{type HTTPRequest}
import njs/ngx.{type JsObject}

fn version(r: HTTPRequest) -> Nil {
  r
  |> http.return_text(200, ngx.version())
}

fn hello(r: HTTPRequest) -> Nil {
  r
  |> http.return_text(200, "Hello World!\n")
}

pub fn exports() -> JsObject {
  ngx.object()
  |> ngx.merge("version", version)
  |> ngx.merge("hello", hello)
}
