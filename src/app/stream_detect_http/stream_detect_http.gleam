import gleam/string
import njs/ngx.{type JsObject, merge, object, pretty, to_string}
import njs/shared_dict
import njs/stream.{type StreamSession}

const dict_name = "stream_detect_http"

fn dict_key(s: StreamSession) -> String {
  stream.remote_address(s)
}

fn set_upstream(s: StreamSession, value: String) -> Nil {
  case shared_dict.get_shared_dict(dict_name) {
    Ok(dict) -> {
      let _ =
        shared_dict.set(dict, dict_key(s), shared_dict.ItemString(value), 1000)
      Nil
    }
    Error(_) -> Nil
  }
}

fn detect_http(s: StreamSession) -> Nil {
  stream.on(s, "upload", fn(data) {
    let text = to_string(data)
    stream.log(s, "stream_detect_http raw=" <> text)
    stream.log(s, "stream_detect_http pretty=" <> pretty(data))
    let first_line = case string.split(text, "\r\n") {
      [head, ..] -> head
      _ -> text
    }

    case string.contains(first_line, " HTTP/1.") {
      True -> set_upstream(s, "httpback")
      False -> set_upstream(s, "tcpback")
    }

    stream.off(s, "upload")
    stream.done(s)
  })
}

fn upstream_type(s: StreamSession) -> String {
  case shared_dict.get_shared_dict(dict_name) {
    Ok(dict) ->
      case shared_dict.get(dict, dict_key(s)) {
        shared_dict.ItemString(value) -> value
        _ -> "tcpback"
      }
    Error(_) -> "tcpback"
  }
}

pub fn exports() -> JsObject {
  object()
  |> merge("detect_http", detect_http)
  |> merge("upstream_type", upstream_type)
}
