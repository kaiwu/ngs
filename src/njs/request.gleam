import gleam/javascript/promise.{type Promise}
import gleam/json.{type Json}
import njs/buffer.{type ArrayBuffer}
import njs/headers.{type Headers}

pub type Request

pub type RequestOption {
  RequestOption(body: BitArray, headers: Headers, method: String)
}

@external(javascript, "./ngx_ffi.mjs", "to_request")
pub fn from_url(url u: String, option o: RequestOption) -> Request

@external(javascript, "./ngx_ffi.mjs", "to_request")
pub fn from_request(request r: Request, option o: RequestOption) -> Request

@external(javascript, "./ngx_ffi.mjs", "request_has_body")
pub fn has_body(request r: Request) -> Bool

@external(javascript, "./ngx_ffi.mjs", "request_headers")
pub fn headers(request r: Request) -> Headers

@external(javascript, "./ngx_ffi.mjs", "request_method")
pub fn method(request r: Request) -> String

@external(javascript, "./ngx_ffi.mjs", "request_url")
pub fn url(request r: Request) -> String

@external(javascript, "./ngx_ffi.mjs", "request_body_array_buffer")
pub fn array_buffer(request r: Request) -> Promise(ArrayBuffer)

@external(javascript, "./ngx_ffi.mjs", "request_body_json")
pub fn json(request r: Request) -> Promise(Json)

@external(javascript, "./ngx_ffi.mjs", "request_body_text")
pub fn text(request r: Request) -> Promise(String)
