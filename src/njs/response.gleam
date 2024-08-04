import gleam/javascript/promise.{type Promise}
import gleam/json.{type Json}
import njs/buffer.{type ArrayBuffer, type Buffer}
import njs/headers.{type Headers}

pub type Response

pub type ResponseOption(h) {
  ResponseOption(status: Int, headers: h, status_text: String)
}

@external(javascript, "../ngx_ffi.mjs", "to_response")
pub fn from_string(body b: String, option o: o) -> Response

@external(javascript, "../ngx_ffi.mjs", "to_response")
pub fn from_buffer(body b: Buffer, option o: o) -> Response

@external(javascript, "../ngx_ffi.mjs", "empty_response")
pub fn empty(option o: o) -> Response

@external(javascript, "../ngx_ffi.mjs", "response_has_body")
pub fn has_body(response r: Response) -> Bool

@external(javascript, "../ngx_ffi.mjs", "response_headers")
pub fn headers(response r: Response) -> Headers

@external(javascript, "../ngx_ffi.mjs", "response_status")
pub fn status(response r: Response) -> Int

@external(javascript, "../ngx_ffi.mjs", "response_status_text")
pub fn status_text(response r: Response) -> String

@external(javascript, "../ngx_ffi.mjs", "response_url")
pub fn url(response r: Response) -> String

@external(javascript, "../ngx_ffi.mjs", "response_body_array_buffer")
pub fn array_buffer(response r: Response) -> Promise(ArrayBuffer)

@external(javascript, "../ngx_ffi.mjs", "response_body_json")
pub fn json(response r: Response) -> Promise(Json)

@external(javascript, "../ngx_ffi.mjs", "response_body_text")
pub fn text(response r: Response) -> Promise(String)

@external(javascript, "../ngx_ffi.mjs", "response_is_ok")
pub fn is_ok(response r: Response) -> Bool

@external(javascript, "../ngx_ffi.mjs", "response_is_redirected")
pub fn is_redirected(response r: Response) -> Bool
