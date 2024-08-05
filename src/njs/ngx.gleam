import gleam/javascript/array.{type Array}
import gleam/javascript/promise.{type Promise}
import gleam/json.{type Json}
import gleam/list
import njs/request.{type Request}
import njs/response.{type Response}

pub type JsObject {
  JsObject
}

pub type SharedDict

@external(javascript, "../ngx_ffi.mjs", "object")
pub fn object() -> JsObject

@external(javascript, "../ngx_ffi.mjs", "merge")
pub fn merge(o: JsObject, k: k, v: v) -> JsObject

pub fn export(o: JsObject, f: f) -> JsObject {
  merge(o, name(f), f)
}

@external(javascript, "../ngx_ffi.mjs", "append")
pub fn append(ar: Array(a), a: a) -> Array(a)

@external(javascript, "../ngx_ffi.mjs", "id")
pub fn to_json(a: a) -> Json

pub fn make_array(ls: List(a)) -> Array(a) {
  ls
  |> list.fold(array.from_list([]), fn(a, x) { append(a, x) })
}

@external(javascript, "../ngx_ffi.mjs", "get")
pub fn get(o: JsObject, k: k) -> Result(JsObject, Nil)

@external(javascript, "../ngx_ffi.mjs", "name")
pub fn name(a: a) -> String

@external(javascript, "../ngx_ffi.mjs", "fetch")
pub fn fetch_url(resource r: String, options o: o) -> Promise(Response)

@external(javascript, "../ngx_ffi.mjs", "fetch")
pub fn fetch_request(resource r: Request, options o: o) -> Promise(Response)

@external(javascript, "../ngx_ffi.mjs", "gatob")
pub fn atob(data d: BitArray) -> BitArray

@external(javascript, "../ngx_ffi.mjs", "gbtoa")
pub fn btoa(data d: BitArray) -> BitArray

@external(javascript, "../ngx_ffi.mjs", "version")
pub fn version() -> String

@external(javascript, "../ngx_ffi.mjs", "dump")
pub fn pretty(a: a) -> String

@external(javascript, "../ngx_ffi.mjs", "parse_query_string")
pub fn parse_query_string(q: String) -> Json

@external(javascript, "../ngx_ffi.mjs", "make_query_string")
pub fn make_query_string(q: Json) -> String

@external(javascript, "../ngx_ffi.mjs", "shared_dict_add")
pub fn shared_dict_add(
  key k: BitArray,
  value v: v,
  timeout t: Int,
) -> Result(Bool, Nil)

@external(javascript, "../ngx_ffi.mjs", "shared_dict_set")
pub fn shared_dict_set(key k: BitArray, value v: v, timeout t: Int) -> Nil

@external(javascript, "../ngx_ffi.mjs", "shared_dict_replace")
pub fn shared_dict_replace(key k: BitArray, value v: v) -> Result(Bool, Nil)

@external(javascript, "../ngx_ffi.mjs", "shared_dict_clear")
pub fn shared_dict_clear() -> Nil

@external(javascript, "../ngx_ffi.mjs", "shared_dict_name")
pub fn shared_dict_name() -> String

@external(javascript, "../ngx_ffi.mjs", "shared_dict_delete")
pub fn shared_dict_delete(key k: BitArray) -> Bool

@external(javascript, "../ngx_ffi.mjs", "shared_dict_get")
pub fn shared_dict_get(key k: BitArray) -> Result(BitArray, Nil)

@external(javascript, "../ngx_ffi.mjs", "shared_dict_has")
pub fn shared_dict_has(key k: BitArray) -> Bool

@external(javascript, "../ngx_ffi.mjs", "shared_dict_items")
pub fn shared_dict_items(max m: Int) -> Array(#(BitArray, BitArray))

@external(javascript, "../ngx_ffi.mjs", "shared_dict_keys")
pub fn shared_dict_keys(max m: Int) -> Array(BitArray)

@external(javascript, "../ngx_ffi.mjs", "shared_dict_pop")
pub fn shared_dict_pop(key k: BitArray) -> Result(BitArray, Nil)

@external(javascript, "../ngx_ffi.mjs", "shared_dict_size")
pub fn shared_dict_size() -> Int
