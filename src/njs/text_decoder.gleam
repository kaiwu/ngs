import njs/buffer.{type ArrayBuffer}

pub type TextDecoder

pub type TextDecoderOptions {
  TextDecoderOptions(fatal: Bool)
}

pub type TextDecodeOptions {
  TextDecodeOptions(stream: Bool)
}

@external(javascript, "../text_decoder_ffi.mjs", "text_decoder_new")
pub fn new(encoding: String, options: o) -> TextDecoder

@external(javascript, "../text_decoder_ffi.mjs", "encoding")
pub fn encoding(decoder: TextDecoder) -> String

@external(javascript, "../text_decoder_ffi.mjs", "fatal")
pub fn fatal(decoder: TextDecoder) -> Bool

@external(javascript, "../text_decoder_ffi.mjs", "ignore_bom")
pub fn ignore_bom(decoder: TextDecoder) -> Bool

@external(javascript, "../text_decoder_ffi.mjs", "decode")
pub fn decode(decoder: TextDecoder, buffer: ArrayBuffer, options: o) -> String
