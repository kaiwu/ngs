import gleam/javascript/array
import gleam/javascript/promise
import gleam/string
import njs/buffer
import njs/headers
import njs/http.{type HTTPRequest}
import njs/ngx.{type JsObject}
import njs/request
import njs/response
import njs/stream.{
  type StreamData, type StreamSession, StreamString, UpStringEvent,
}

fn preread_verify(s: StreamSession) -> Nil {
  stream.on(s, UpStringEvent, fn(d: StreamData) {
    let _ = {
      case d {
        StreamString(data, _last) -> {
          let _ = stream.log(s, "auth_request data: " <> data)
          case string.length(data) == 0 {
            True -> promise.resolve(Nil)
            False ->
              case
                string.length(data) >= 5 && string.starts_with(data, "MAGiK")
              {
                True -> {
                  let _ = stream.off(s, UpStringEvent)
                  let data_buf = buffer.from_string(data, buffer.Utf8)
                  let body_buf = buffer.slice(data_buf, 5, 7)
                  let _ =
                    stream.log(
                      s,
                      "auth_request body: "
                        <> buffer.to_string(body_buf, buffer.Utf8, 0, 2),
                    )
                  let req_headers =
                    headers.from_array(array.from_list([#("Host", "aaa")]))
                  let req =
                    request.from_url(
                      "http://127.0.0.1:8080/validate",
                      request.RequestOption(
                        body: body_buf,
                        headers: req_headers,
                        method: "POST",
                      ),
                    )
                  use res <- promise.await(ngx.fetch_request(req, Nil))
                  case response.status(res) == 200 {
                    True -> stream.done(s)
                    False -> stream.deny(s)
                  }
                  |> promise.resolve
                }
                False -> stream.deny(s) |> promise.resolve
              }
          }
        }
        _ -> panic as "unreachable"
      }
    }
    Nil
  })
}

fn validate(r: HTTPRequest) -> Nil {
  case http.request_text(r) == "QZ" {
    True -> http.return_code(r, 200)
    False -> http.return_code(r, 403)
  }
}

pub fn exports() -> JsObject {
  ngx.object()
  |> ngx.merge("preread_verify", preread_verify)
  |> ngx.merge("validate", validate)
}
