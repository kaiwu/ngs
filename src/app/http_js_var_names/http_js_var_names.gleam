import gleam/javascript/array
import gleam/list
import gleam/string
import njs/http.{type HTTPRequest}
import njs/ngx.{type JsObject}
import njs/stream.{type StreamSession}

fn all(r: HTTPRequest) -> Nil {
  let names =
    http.js_var_names(r)
    |> array.to_list
    |> list.sort(string.compare)
    |> string.join(",")
  http.return_text(r, 200, names)
}

fn by_prefix(r: HTTPRequest) -> Nil {
  let names =
    http.js_var_names_with_prefix(r, "meta_")
    |> array.to_list
    |> list.sort(string.compare)
    |> string.join(",")
  http.return_text(r, 200, names)
}

fn no_match(r: HTTPRequest) -> Nil {
  let count =
    http.js_var_names_with_prefix(r, "none_")
    |> array.to_list
    |> list.length
  http.return_text(r, 200, ngx.to_string(count))
}

fn stream_all(s: StreamSession) -> String {
  stream.js_var_names(s)
  |> array.to_list
  |> list.sort(string.compare)
  |> string.join(",")
}

fn stream_prefix(s: StreamSession) -> String {
  stream.js_var_names_with_prefix(s, "s_")
  |> array.to_list
  |> list.sort(string.compare)
  |> string.join(",")
}

pub fn exports() -> JsObject {
  ngx.object()
  |> ngx.merge("all", all)
  |> ngx.merge("by_prefix", by_prefix)
  |> ngx.merge("no_match", no_match)
  |> ngx.merge("stream_all", stream_all)
  |> ngx.merge("stream_prefix", stream_prefix)
}
