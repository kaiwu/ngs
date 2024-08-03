//// the module implements a few njs exmpales found at
//// https://github.com/nginx/njs-examples
////

import gleam/dynamic
import gleam/javascript/promise.{type Promise}
import gleam/json
import gleam/list
import gleam/result
import njs/http.{type HTTPRequest}
import njs/ngx

pub fn version(r: HTTPRequest) -> Nil {
  r
  |> http.return_text(200, ngx.version())
}

pub fn hello(r: HTTPRequest) -> Nil {
  r
  |> http.return_text(200, "hello world")
}

pub fn decode_uri(r: HTTPRequest) -> String {
  r
  |> http.args
  |> dynamic.from
  |> dynamic.field("foo", dynamic.string)
  |> result.unwrap("")
}

pub fn join(r: HTTPRequest) -> Promise(Nil) {
  let fs =
    ["/foo", "/bar"]
    |> list.map(http.subrequest(r, _, ""))
    |> promise.await_list

  use rs <- promise.await(fs)
  rs
  |> json.array(fn(re) {
    [
      #("uri", re |> http.uri |> json.string),
      #("code", re |> http.status |> json.int),
      #("body", re |> http.response_text |> json.string),
    ]
    |> json.object
  })
  |> json.to_string
  |> http.return_text(r, 200, _)
  |> promise.resolve
}
