import njs/buffer.{type TypedArray}

pub type TextEncoder

pub type EncodeIntoResult {
  EncodeIntoResult(read: Int, written: Int)
}

@external(javascript, "../text_encoder_ffi.mjs", "new")
pub fn new() -> TextEncoder

@external(javascript, "../text_encoder_ffi.mjs", "encode")
pub fn encode(encoder: TextEncoder, string: String) -> TypedArray

@external(javascript, "../text_encoder_ffi.mjs", "encode_into")
pub fn encode_into(
  encoder: TextEncoder,
  string: String,
  destination: TypedArray,
) -> EncodeIntoResult
