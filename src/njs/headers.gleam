import gleam/javascript/array.{type Array}

pub type Headers

@external(javascript, "../ngx_ffi.mjs", "to_headers")
pub fn from_string(h: String) -> Headers

@external(javascript, "../ngx_ffi.mjs", "to_headers")
pub fn from_headers(h: Headers) -> Headers

@external(javascript, "../ngx_ffi.mjs", "to_headers")
pub fn from_array(h: Array(#(String, String))) -> Headers
