import gleam/javascript/array.{type Array}

pub type Headers

@external(javascript, "../ngx_ffi.mjs", "to_headers")
pub fn from_string(h: String) -> Headers

@external(javascript, "../ngx_ffi.mjs", "to_headers")
pub fn from_headers(h: Headers) -> Headers

@external(javascript, "../ngx_ffi.mjs", "to_headers")
pub fn from_array(h: Array(#(String, String))) -> Headers

@external(javascript, "../ngx_ffi.mjs", "headers_append")
pub fn append(headers: Headers, name: String, value: String) -> Nil

@external(javascript, "../ngx_ffi.mjs", "headers_delete")
pub fn delete(headers: Headers, name: String) -> Nil

@external(javascript, "../ngx_ffi.mjs", "headers_get")
pub fn get(headers: Headers, name: String) -> String

@external(javascript, "../ngx_ffi.mjs", "headers_get_all")
pub fn get_all(headers: Headers, name: String) -> Array(String)

@external(javascript, "../ngx_ffi.mjs", "headers_for_each")
pub fn for_each(headers: Headers, callback: fn(String, String) -> Nil) -> Nil

@external(javascript, "../ngx_ffi.mjs", "headers_has")
pub fn has(headers: Headers, name: String) -> Bool

@external(javascript, "../ngx_ffi.mjs", "headers_set")
pub fn set(headers: Headers, name: String, value: String) -> Nil
