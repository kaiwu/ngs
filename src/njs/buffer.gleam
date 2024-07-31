import gleam/javascript/array.{type Array}

/// Byte is size(8) unit(1) bitarray
pub type Byte =
  BitArray

pub type ArrayBuffer

pub type Uint8Array

pub type Buffer

pub type Encoding {
  Utf8
  Hex
  Base64
  Base64Url
}

@external(javascript, "./buffer_ffi.mjs", "new")
pub fn new(size s: Int) -> ArrayBuffer

@external(javascript, "./buffer_ffi.mjs", "array_buffer_bytes")
pub fn array_buffer_bytes(
  array_buffer ab: ArrayBuffer,
  offset o: Int,
  length l: Int,
) -> Array(Byte)

@external(javascript, "./buffer_ffi.mjs", "alloc")
pub fn alloc(size s: Int) -> Buffer

@external(javascript, "./buffer_ffi.mjs", "compare")
pub fn compare(buffer1 b1: Buffer, buffer2 b2: Buffer) -> Int

@external(javascript, "./buffer_ffi.mjs", "concat")
pub fn concat(buffers bs: Array(Buffer), length l: Int) -> Buffer

@external(javascript, "./buffer_ffi.mjs", "from_bytes")
pub fn from_bytes(array ab: Array(Byte)) -> Buffer

@external(javascript, "./buffer_ffi.mjs", "from_array_buffer")
pub fn from(
  array_buffer ab: ArrayBuffer,
  offset o: Int,
  length l: Int,
) -> Buffer

@external(javascript, "./buffer_ffi.mjs", "from_buffer")
pub fn from_buffer(buffer bf: Buffer) -> Buffer

@external(javascript, "./buffer_ffi.mjs", "from_string")
pub fn from_string(bitarray ba: BitArray, encoding e: Encoding) -> Buffer

@external(javascript, "./buffer_ffi.mjs", "get_buffer")
pub fn get_buffer(buffer bf: Buffer) -> ArrayBuffer

@external(javascript, "./buffer_ffi.mjs", "get_buffer_offset")
pub fn get_buffer_offset(buffer b: Buffer) -> Int

@external(javascript, "./buffer_ffi.mjs", "get_byte")
pub fn get_byte(buffer bf: Buffer, offset o: Int) -> Byte

@external(javascript, "./buffer_ffi.mjs", "set_byte")
pub fn set_byte(buffer bf: Buffer, offset o: Int, byte b: Byte) -> Buffer

@external(javascript, "./buffer_ffi.mjs", "copy")
pub fn copy(dst bd: Buffer, src bs: Buffer, from s: Int, to e: Int) -> Buffer

@external(javascript, "./buffer_ffi.mjs", "equals")
pub fn equals(buffer1 b1: Buffer, buffer2 b2: Buffer) -> Bool

@external(javascript, "./buffer_ffi.mjs", "length")
pub fn length(buffer bf: Buffer) -> Int

@external(javascript, "./buffer_ffi.mjs", "fill")
pub fn fill(
  buffer bf: Buffer,
  with v: BitArray,
  from o: Int,
  to e: Int,
) -> Buffer

@external(javascript, "./buffer_ffi.mjs", "index_of")
pub fn index_of(buffer bf: Buffer, value v: v, offset o: Int, encoding e: Encoding) -> Int

@external(javascript, "./buffer_ffi.mjs", "last_index_of")
pub fn last_index_of(buffer bf: Buffer, value v: v, offset o: Int, encoding e: Encoding) -> Int

@external(javascript, "./buffer_ffi.mjs", "includes")
pub fn includes(buffer bf: Buffer, value v: v, offset o: Int, encoding e: Encoding) -> Bool





