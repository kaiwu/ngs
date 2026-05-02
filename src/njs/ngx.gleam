import gleam/javascript/array.{type Array}
import gleam/javascript/promise.{type Promise}
import gleam/json.{type Json}
import njs/request.{type Request}
import njs/response.{type Response}

pub type JsObject {
  JsObject
}

@external(javascript, "../ngx_ffi.mjs", "object")
pub fn object() -> JsObject

@external(javascript, "../ngx_ffi.mjs", "merge")
pub fn merge(o: JsObject, k: k, v: v) -> JsObject

pub fn export(o: JsObject, f: f) -> JsObject {
  merge(o, name(f), f)
}

@external(javascript, "../ngx_ffi.mjs", "now")
pub fn now() -> Int

@external(javascript, "../ngx_ffi.mjs", "append")
pub fn append(ar: Array(a), a: a) -> Array(a)

@external(javascript, "../ngx_ffi.mjs", "id")
pub fn to_json(a: a) -> Json

@external(javascript, "../ngx_ffi.mjs", "make_string")
pub fn to_string(a: a) -> String

pub fn make_array(ls: List(a)) -> Array(a) {
  array.from_list(ls)
}

/// safe for normal JS objects, not for r.variables
@external(javascript, "../ngx_ffi.mjs", "get")
pub fn get(o: JsObject, k: k) -> Result(JsObject, Nil)

@external(javascript, "../ngx_ffi.mjs", "name")
pub fn name(a: a) -> String

@external(javascript, "../ngx_ffi.mjs", "fetch")
pub fn fetch_url(resource r: String, options o: o) -> Promise(Response)

@external(javascript, "../ngx_ffi.mjs", "fetch")
pub fn fetch_request(resource r: Request, options o: o) -> Promise(Response)

@external(javascript, "../ngx_ffi.mjs", "gatob")
pub fn atob(data d: String) -> String

@external(javascript, "../ngx_ffi.mjs", "gbtoa")
pub fn btoa(data d: String) -> String

@external(javascript, "../ngx_ffi.mjs", "base64url_decode")
pub fn base64url_decode(data d: String) -> String

@external(javascript, "../ngx_ffi.mjs", "base64url_encode")
pub fn base64url_encode(data d: String) -> String

pub const info = 0

pub const warn = 1

pub const error = 2

@external(javascript, "../ngx_ffi.mjs", "ngx_log")
pub fn log(level: Int, message: a) -> Nil

@external(javascript, "../ngx_ffi.mjs", "version")
pub fn version() -> String

@external(javascript, "../ngx_ffi.mjs", "parse_query_string")
pub fn parse_query_string(q: String) -> Json

@external(javascript, "../ngx_ffi.mjs", "make_query_string")
pub fn make_query_string(q: Json) -> String
