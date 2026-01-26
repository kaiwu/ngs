import gleam/string
import njs/ngx.{type JsObject}
import njs/shared_dict
import njs/stream.{
  type StreamData, type StreamSession, StreamString, UpStringEvent,
}

const dict_name = "stream_detect_http"

const dict_key = "is_http"

fn set_upstream(value: String) -> Nil {
  case shared_dict.get_shared_dict(dict_name) {
    Ok(dict) -> {
      let _ =
        shared_dict.set(dict, dict_key, shared_dict.ItemString(value), 1000)
      Nil
    }
    Error(_) -> Nil
  }
}

fn is_http_request(data: String) -> Bool {
  // Check if data contains \r\n and the first line ends with " HTTP/1."
  case string.split_once(data, "\r\n") {
    Ok(#(first_line, _)) ->
      case string.split_once(first_line, " HTTP/1.") {
        Ok(#(_, suffix)) -> string.length(suffix) == 1
        Error(_) -> False
      }
    Error(_) -> False
  }
}

fn detect_http(s: StreamSession) -> Nil {
  stream.on(s, UpStringEvent, fn(d: StreamData) {
    case d {
      StreamString(data, last) -> {
        let _ = stream.log(s, "stream data is: " <> data)
        case is_http_request(data), string.length(data) > 0 || last {
          True, True -> {
            let _ = set_upstream("httpback")
            stream.done(s)
          }
          False, True -> {
            let _ = set_upstream("tcpback")
            stream.done(s)
          }
          _, _ -> Nil
        }
      }
      _ -> panic as "unreachable"
    }
  })
}

fn upstream_type(_: StreamSession) -> String {
  case shared_dict.get_shared_dict(dict_name) {
    Ok(dict) ->
      case shared_dict.get(dict, dict_key) {
        shared_dict.ItemString(value) -> value
        _ -> "tcpback"
      }
    Error(_) -> panic as "unreachable"
  }
}

pub fn exports() -> JsObject {
  ngx.object()
  |> ngx.merge("detect_http", detect_http)
  |> ngx.merge("upstream_type", upstream_type)
}
