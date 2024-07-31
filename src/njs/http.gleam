import gleam/javascript/array.{type Array}
import gleam/javascript/promise.{type Promise}
import gleam/json.{type Json}
import njs/buffer.{type Buffer}

pub type HTTPRequest

pub type HTTPResponse =
  HTTPRequest

@external(javascript, "./http_ffi.mjs", "http_args")
pub fn args(request r: HTTPRequest) -> Json

@external(javascript, "./http_ffi.mjs", "http_get_variables")
pub fn get_variables(request r: HTTPRequest) -> Json

@external(javascript, "./http_ffi.mjs", "http_get_raw_variables")
pub fn get_raw_variables(request r: HTTPRequest) -> Buffer

@external(javascript, "./http_ffi.mjs", "http_set_variables")
pub fn set_variables(
  request r: HTTPRequest,
  key k: k,
  value v: v,
) -> HTTPRequest

@external(javascript, "./http_ffi.mjs", "http_done")
pub fn done(request r: HTTPRequest) -> Nil

@external(javascript, "./http_ffi.mjs", "http_error")
pub fn error(request r: HTTPRequest, message m: String) -> HTTPRequest

@external(javascript, "./http_ffi.mjs", "http_finish")
pub fn finish(request r: HTTPRequest) -> Nil

@external(javascript, "./http_ffi.mjs", "http_headers_in")
pub fn headers_in(request r: HTTPRequest) -> Json

@external(javascript, "./http_ffi.mjs", "http_raw_headers_in")
pub fn raw_headers_in(request r: HTTPRequest) -> Array(#(String, String))

@external(javascript, "./http_ffi.mjs", "http_get_headers_out")
pub fn get_headers_out(request r: HTTPRequest) -> Json

@external(javascript, "./http_ffi.mjs", "http_get_raw_headers_out")
pub fn get_raw_headers_out(request r: HTTPRequest) -> Array(#(String, String))

@external(javascript, "./http_ffi.mjs", "http_set_headers_out")
pub fn set_headers_out(
  request r: HTTPRequest,
  key k: k,
  value v: v,
) -> HTTPRequest

@external(javascript, "./http_ffi.mjs", "http_version")
pub fn version(request r: HTTPRequest) -> String

@external(javascript, "./http_ffi.mjs", "http_internal")
pub fn is_internal(request r: HTTPRequest) -> Bool

@external(javascript, "./http_ffi.mjs", "http_internal_redirect")
pub fn internal_redirect(request r: HTTPRequest, uri u: String) -> Nil

@external(javascript, "./http_ffi.mjs", "http_log")
pub fn log(request r: HTTPRequest, message m: String) -> HTTPRequest

@external(javascript, "./http_ffi.mjs", "http_method")
pub fn method(request r: HTTPRequest) -> String

@external(javascript, "./http_ffi.mjs", "http_parent")
pub fn parent(request r: HTTPRequest) -> HTTPRequest

@external(javascript, "./http_ffi.mjs", "http_remote_address")
pub fn remote_address(request r: HTTPRequest) -> String

@external(javascript, "./http_ffi.mjs", "http_request_buffer")
pub fn request_buffer(request r: HTTPRequest) -> Buffer

@external(javascript, "./http_ffi.mjs", "http_request_text")
pub fn request_text(request r: HTTPRequest) -> String

@external(javascript, "./http_ffi.mjs", "http_response_buffer")
pub fn response_buffer(request r: HTTPRequest) -> Buffer

@external(javascript, "./http_ffi.mjs", "http_response_text")
pub fn response_text(request r: HTTPRequest) -> String

@external(javascript, "./http_ffi.mjs", "http_return")
pub fn return_text(
  request r: HTTPRequest,
  code c: Int,
  return t: String,
) -> HTTPRequest

@external(javascript, "./http_ffi.mjs", "http_return")
pub fn return_buffer(
  request r: HTTPRequest,
  code c: Int,
  return b: Buffer,
) -> HTTPRequest

@external(javascript, "./http_ffi.mjs", "http_send_text")
pub fn send_text(request r: HTTPRequest, data d: String) -> HTTPRequest

@external(javascript, "./http_ffi.mjs", "http_send_buffer")
pub fn send_buffer(
  request r: HTTPRequest,
  buffer d: Buffer,
  options o: o,
) -> HTTPRequest

@external(javascript, "./http_ffi.mjs", "http_send_header")
pub fn send_header(request r: HTTPRequest) -> HTTPRequest

@external(javascript, "./http_ffi.mjs", "http_status")
pub fn status(request r: HTTPRequest) -> Int

@external(javascript, "./http_ffi.mjs", "http_set_status")
pub fn set_status(request r: HTTPRequest, status s: Int) -> HTTPRequest

@external(javascript, "./http_ffi.mjs", "http_subrequest")
pub fn subrequest(
  request r: HTTPRequest,
  uri u: String,
  options o: o,
) -> Promise(HTTPResponse)

@external(javascript, "./http_ffi.mjs", "http_uri")
pub fn uri(request r: HTTPRequest) -> String

@external(javascript, "./http_ffi.mjs", "http_warn")
pub fn warn(request r: HTTPRequest, message m: String) -> HTTPRequest
