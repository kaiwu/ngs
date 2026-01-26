import gleam/string
import njs/ngx.{type JsObject}
import njs/shared_dict
import njs/stream.{
  type StreamData, type StreamSession, SendOption, StreamString, UpStringEvent,
}

const dict_name = "stream_inject_header"

fn buffer_key(s: StreamSession) -> String {
  stream.remote_address(s)
}

fn get_buffer(s: StreamSession) -> String {
  case shared_dict.get_shared_dict(dict_name) {
    Ok(dict) ->
      case shared_dict.get(dict, buffer_key(s)) {
        shared_dict.ItemString(value) -> value
        _ -> ""
      }
    Error(_) -> ""
  }
}

fn set_buffer(s: StreamSession, value: String) -> Nil {
  case shared_dict.get_shared_dict(dict_name) {
    Ok(dict) -> {
      let _ =
        shared_dict.set(
          dict,
          buffer_key(s),
          shared_dict.ItemString(value),
          1000,
        )
      Nil
    }
    Error(_) -> Nil
  }
}

fn clear_buffer(s: StreamSession) -> Nil {
  case shared_dict.get_shared_dict(dict_name) {
    Ok(dict) -> {
      let _ = shared_dict.delete(dict, buffer_key(s))
      Nil
    }
    Error(_) -> Nil
  }
}

fn inject_foo_header(s: StreamSession) -> Nil {
  inject_header(s, "Foo: my_foo")
}

fn inject_header(s: StreamSession, header: String) -> Nil {
  stream.on(s, UpStringEvent, fn(d: StreamData) {
    case d {
      StreamString(data, last) -> {
        let req = get_buffer(s) <> data
        case string.split_once(req, "\n") {
          Ok(#(first_line, rest)) -> {
            let header_block = first_line <> "\n" <> header <> "\r\n" <> rest
            let _ = clear_buffer(s)
            stream.send(s, header_block, SendOption(last: last, flush: False))
            stream.off(s, UpStringEvent)
          }
          Error(_) -> set_buffer(s, req)
        }
      }
      _ -> Nil
    }
  })
}

pub fn exports() -> JsObject {
  ngx.object()
  |> ngx.merge("inject_foo_header", inject_foo_header)
}
