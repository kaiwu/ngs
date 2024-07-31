import gleam/javascript/array.{type Array}

pub type Headers

@external(javascript, "./ngx_ffi.mjs", "to_headers")
pub fn from_string(h: String) -> Headers

@external(javascript, "./ngx_ffi.mjs", "to_headers")
pub fn from_headres(h: Headers) -> Headers

@external(javascript, "./ngx_ffi.mjs", "to_headers")
pub fn from_array(h: Array(#(String, String))) -> Headers

@external(javascript, "./ngx_ffi.mjs", "headers_has")
pub fn has(h: Headers, header n: String) -> Bool
