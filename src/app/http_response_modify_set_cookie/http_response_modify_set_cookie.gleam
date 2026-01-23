import gleam/int
import gleam/javascript/array
import gleam/list
import gleam/string
import njs/http.{type HTTPRequest}
import njs/ngx.{type JsObject}

fn cookies_filter(r: HTTPRequest) -> Nil {
  let args = http.args(r)
  let min_len = case ngx.get(args, "len") {
    Error(_) -> 0
    Ok(val) -> {
      case int.parse(ngx.trim(ngx.to_string(val))) {
        Error(_) -> 0
        Ok(n) -> n
      }
    }
  }

  let raw_headers = http.get_raw_headers_out(r)
  let headers_list = array.to_list(raw_headers)

  let filtered_cookies =
    headers_list
    |> list.filter_map(fn(header) {
      let #(name, value) = header
      case name {
        "Set-Cookie" | "set-cookie" ->
          case string.length(value) > min_len {
            True -> Ok(value)
            False -> Error(Nil)
          }
        _ -> Error(Nil)
      }
    })

  let _ =
    http.set_headers_out(r, "Set-Cookie", array.from_list(filtered_cookies))
  Nil
}

pub fn exports() -> JsObject {
  ngx.object()
  |> ngx.merge("cookies_filter", cookies_filter)
}
