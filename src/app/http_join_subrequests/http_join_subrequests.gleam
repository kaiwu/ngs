import gleam/javascript/array
import gleam/javascript/promise.{type Promise}
import gleam/json

import njs/http.{type HTTPRequest}
import njs/ngx.{type JsObject}

fn join(r: HTTPRequest) -> Promise(Nil) {
  let fs =
    ["/foo", "/bar"]
    |> ngx.make_array
    |> array.map(http.subrequest(r, _, ""))
    |> promise.await_array

  use rs <- promise.await(fs)
  rs
  |> array.map(fn(re) {
    ngx.object()
    |> ngx.merge("uri", re |> http.uri)
    |> ngx.merge("code", re |> http.status)
    |> ngx.merge("body", re |> http.response_text)
    // [
    //   #("uri", re |> http.uri |> json.string),
    //   #("code", re |> http.status |> json.int),
    //   #("body", re |> http.response_text |> json.string),
    // ]
    // |> json.object
  })
  |> ngx.to_json
  |> fn(b) {
    http.set_headers_out(r, "Content-Type", "application/json")
    b
  }
  |> json.to_string
  |> http.return_text(r, 200, _)
  |> promise.resolve
}

pub fn exports() -> JsObject {
  ngx.object()
  |> ngx.merge("join", join)
}
