import gleam/javascript/promise.{type Promise}
import njs/buffer.{type Buffer}
import njs/ngx.{type JsObject}

pub type StreamSession

pub type StreamData {
  StreamString(s: String, last: Bool)
  StreamBuffer(b: Buffer, last: Bool)
}

pub type SendOption {
  SendOption(last: Bool, flush: Bool)
}

pub type StreamEvent {
  UpStringEvent
  DownStringEvent
  UpBufferEvent
  DownBufferEvent
}

@external(javascript, "../stream_ffi.mjs", "allow")
pub fn allow(session: StreamSession) -> Nil

@external(javascript, "../stream_ffi.mjs", "decline")
pub fn decline(session: StreamSession) -> Nil

@external(javascript, "../stream_ffi.mjs", "deny")
pub fn deny(session: StreamSession) -> Nil

@external(javascript, "../stream_ffi.mjs", "done")
pub fn done(session: StreamSession) -> Nil

@external(javascript, "../stream_ffi.mjs", "done_code")
pub fn done_code(session: StreamSession, code: Int) -> Nil

@external(javascript, "../stream_ffi.mjs", "error")
pub fn error(session: StreamSession, message: String) -> Nil

@external(javascript, "../stream_ffi.mjs", "warn")
pub fn warn(session: StreamSession, message: String) -> Nil

@external(javascript, "../stream_ffi.mjs", "log")
pub fn log(session: StreamSession, message: String) -> Nil

@external(javascript, "../stream_ffi.mjs", "off")
pub fn off(session: StreamSession, event: StreamEvent) -> Nil

@external(javascript, "../stream_ffi.mjs", "on_callback")
pub fn on(
  session: StreamSession,
  event: StreamEvent,
  callback cb: fn(StreamData) -> Nil,
) -> Nil

@external(javascript, "../stream_ffi.mjs", "remote_address")
pub fn remote_address(session: StreamSession) -> String

@external(javascript, "../stream_ffi.mjs", "send")
pub fn send(session s: StreamSession, data d: a, option o: SendOption) -> Nil

@external(javascript, "../stream_ffi.mjs", "send_downstream")
pub fn send_downstream(
  session s: StreamSession,
  data d: a,
  option o: SendOption,
) -> Nil

@external(javascript, "../stream_ffi.mjs", "send_upstream")
pub fn send_upstream(
  session s: StreamSession,
  data d: a,
  option o: SendOption,
) -> Nil

@external(javascript, "../stream_ffi.mjs", "status")
pub fn status(session: StreamSession) -> Int

@external(javascript, "../stream_ffi.mjs", "set_return_value")
pub fn set_return_value(
  session: StreamSession,
  return_value: Promise(a),
) -> Promise(Nil)

@external(javascript, "../stream_ffi.mjs", "variables")
pub fn variables(session: StreamSession) -> JsObject

@external(javascript, "../stream_ffi.mjs", "raw_variables")
pub fn raw_variables(session: StreamSession) -> JsObject
