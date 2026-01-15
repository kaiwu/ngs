import gleam/json.{type Json}

pub type ParseOptions {
  ParseOptions(decode_uri_component: fn(String) -> String, max_keys: Int)
}

pub type StringifyOptions {
  StringifyOptions(encode_uri_component: fn(String) -> String)
}

@external(javascript, "../querystring_ffi.mjs", "decode")
pub fn decode(string: String) -> Json

@external(javascript, "../querystring_ffi.mjs", "encode")
pub fn encode(obj: Json) -> String

@external(javascript, "../querystring_ffi.mjs", "escape")
pub fn escape(string: String) -> String

@external(javascript, "../querystring_ffi.mjs", "parse")
pub fn parse(
  string: String,
  separator: String,
  equal: String,
  options: o,
) -> Json

@external(javascript, "../querystring_ffi.mjs", "stringify")
pub fn stringify(
  obj: Json,
  separator: String,
  equal: String,
  options: o,
) -> String

@external(javascript, "../querystring_ffi.mjs", "unescape")
pub fn unescape(string: String) -> String
