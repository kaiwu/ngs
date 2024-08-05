//// the module implements a few njs exmpales found at
//// https://github.com/nginx/njs-examples
////

import gleam/dynamic
import gleam/javascript/array
import gleam/javascript/promise.{type Promise}
import gleam/json
import gleam/result
import gleam/string
import njs/http.{type HTTPRequest}
import njs/ngx

pub fn version(r: HTTPRequest) -> Nil {
  r
  |> http.return_text(200, ngx.version())
}

pub fn hello(r: HTTPRequest) -> Nil {
  let l =
    [True, False, False]
    |> ngx.make_array
    |> array.map(fn(x) {
      case x {
        True -> "1"
        False -> "0"
      }
    })
    |> array.to_list
    |> string.concat
  r
  |> http.return_text(200, l)
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
