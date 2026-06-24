//// Buffer is a view of ArrayBuffer
////

import gleam/javascript/array.{type Array}
import gleam/json.{type Json}

/// Byte is size(8) unit(1) bitarray
pub type Byte =
  BitArray

pub type ArrayBuffer

pub type TypedArray

pub type TypedArrayType {
  Int8
  UInt8
  Int16
  UInt16
  Int32
  UInt32
}

pub type Buffer

pub type BufferConstants

/// Valid byte lengths for Buffer readInt/readUInt/writeInt/writeUInt methods.
///
/// njs 1.0.0 rejects zero-length reads and writes. Use the `_sized` helpers
/// below when the width is known statically.
pub type ByteLength {
  One
  Two
  Three
  Four
  Five
  Six
}

pub type Encoding {
  Utf8
  Hex
  Base64
  Base64Url
}

pub fn byte_length_to_int(length: ByteLength) -> Int {
  case length {
    One -> 1
    Two -> 2
    Three -> 3
    Four -> 4
    Five -> 5
    Six -> 6
  }
}

@external(javascript, "../buffer_ffi.mjs", "byte_length")
pub fn byte_length(value v: v, encoding e: Encoding) -> Int

@external(javascript, "../buffer_ffi.mjs", "constants")
pub fn constants() -> BufferConstants

@external(javascript, "../buffer_ffi.mjs", "constants_max_length")
pub fn constants_max_length() -> Int

@external(javascript, "../buffer_ffi.mjs", "constants_max_string_length")
pub fn constants_max_string_length() -> Int

@external(javascript, "../buffer_ffi.mjs", "array_buffer_byte_length")
pub fn array_buffer_byte_length(ab: ArrayBuffer) -> Int

@external(javascript, "../buffer_ffi.mjs", "new_array_buffer")
pub fn new_array_buffer(size s: Int) -> ArrayBuffer

@external(javascript, "../buffer_ffi.mjs", "new_typed_array")
pub fn new_typed_array(t: TypedArrayType, size s: Int) -> TypedArray

@external(javascript, "../buffer_ffi.mjs", "alloc")
pub fn alloc(size s: Int) -> Buffer

@external(javascript, "../buffer_ffi.mjs", "alloc_unsafe")
pub fn alloc_unsafe(size s: Int) -> Buffer

@external(javascript, "../buffer_ffi.mjs", "compare")
pub fn compare(buffer1 b1: Buffer, buffer2 b2: Buffer) -> Int

@external(javascript, "../buffer_ffi.mjs", "concat")
pub fn concat(buffers bs: Array(Buffer), length t: t) -> Buffer

@external(javascript, "../buffer_ffi.mjs", "from_bytes")
pub fn from_bytes(array ab: Array(Byte)) -> Buffer

@external(javascript, "../buffer_ffi.mjs", "from_array_buffer")
pub fn from(
  array_buffer ab: ArrayBuffer,
  offset o: Int,
  length l: Int,
) -> Buffer

@external(javascript, "../buffer_ffi.mjs", "from_buffer")
pub fn from_buffer(buffer bf: Buffer) -> Buffer

@external(javascript, "../buffer_ffi.mjs", "from_string")
pub fn from_string(string ba: String, encoding e: Encoding) -> Buffer

@external(javascript, "../buffer_ffi.mjs", "is_buffer")
pub fn is_buffer(obj: a) -> Bool

@external(javascript, "../buffer_ffi.mjs", "is_encoding")
pub fn is_encoding(encoding e: Encoding) -> Bool

@external(javascript, "../buffer_ffi.mjs", "get_buffer")
pub fn get_buffer(buffer bf: Buffer) -> ArrayBuffer

@external(javascript, "../buffer_ffi.mjs", "get_buffer_offset")
pub fn get_buffer_offset(buffer b: Buffer) -> Int

@external(javascript, "../buffer_ffi.mjs", "get_byte")
pub fn get_byte(buffer bf: Buffer, offset o: Int) -> Byte

@external(javascript, "../buffer_ffi.mjs", "set_byte")
pub fn set_byte(buffer bf: Buffer, offset o: Int, byte b: Byte) -> Buffer

@external(javascript, "../buffer_ffi.mjs", "copy")
pub fn copy(dst bd: Buffer, src bs: Buffer, from f: Int, to t: Int) -> Buffer

@external(javascript, "../buffer_ffi.mjs", "equals")
pub fn equals(buffer1 b1: Buffer, buffer2 b2: Buffer) -> Bool

@external(javascript, "../buffer_ffi.mjs", "length")
pub fn length(buffer bf: Buffer) -> Int

@external(javascript, "../buffer_ffi.mjs", "fill")
pub fn fill(buffer bf: Buffer, with v: Byte, from f: Int, to t: Int) -> Buffer

@external(javascript, "../buffer_ffi.mjs", "index_of")
pub fn index_of(buffer bf: Buffer, value v: v, offset o: Int) -> Int

@external(javascript, "../buffer_ffi.mjs", "index_of_string")
pub fn index_of_string(
  buffer bf: Buffer,
  value v: String,
  offset o: Int,
  encoding e: Encoding,
) -> Int

@external(javascript, "../buffer_ffi.mjs", "last_index_of")
pub fn last_index_of(
  buffer bf: Buffer,
  value v: v,
  offset o: Int,
  encoding e: Encoding,
) -> Int

@external(javascript, "../buffer_ffi.mjs", "last_index_of_string")
pub fn last_index_of_string(
  buffer bf: Buffer,
  value v: String,
  offset o: Int,
  encoding e: Encoding,
) -> Int

@external(javascript, "../buffer_ffi.mjs", "includes")
pub fn includes(buffer bf: Buffer, value v: v, offset o: Int) -> Bool

@external(javascript, "../buffer_ffi.mjs", "includes_string")
pub fn includes_string(
  buffer bf: Buffer,
  value v: String,
  offset o: Int,
  encoding e: Encoding,
) -> Bool

@external(javascript, "../buffer_ffi.mjs", "slice")
pub fn slice(buffer bf: Buffer, from f: Int, to t: Int) -> Buffer

@external(javascript, "../buffer_ffi.mjs", "to_string")
pub fn to_string(
  buffer bf: Buffer,
  encoding e: Encoding,
  from f: Int,
  to t: Int,
) -> String

@external(javascript, "../buffer_ffi.mjs", "to_json")
pub fn to_json(buffer bf: Buffer) -> Json

@external(javascript, "../buffer_ffi.mjs", "subarray")
pub fn subarray(buffer bf: Buffer, start s: Int, end e: Int) -> Buffer

@external(javascript, "../buffer_ffi.mjs", "swap16")
pub fn swap16(buffer bf: Buffer) -> Buffer

@external(javascript, "../buffer_ffi.mjs", "swap32")
pub fn swap32(buffer bf: Buffer) -> Buffer

@external(javascript, "../buffer_ffi.mjs", "swap64")
pub fn swap64(buffer bf: Buffer) -> Buffer

@external(javascript, "../buffer_ffi.mjs", "read_int8")
pub fn read_int8(buffer bf: Buffer, offset o: Int) -> Int

@external(javascript, "../buffer_ffi.mjs", "read_int16_be")
pub fn read_int16_be(buffer bf: Buffer, offset o: Int) -> Int

@external(javascript, "../buffer_ffi.mjs", "read_int16_le")
pub fn read_int16_le(buffer bf: Buffer, offset o: Int) -> Int

@external(javascript, "../buffer_ffi.mjs", "read_int32_be")
pub fn read_int32_be(buffer bf: Buffer, offset o: Int) -> Int

@external(javascript, "../buffer_ffi.mjs", "read_int32_le")
pub fn read_int32_le(buffer bf: Buffer, offset o: Int) -> Int

@external(javascript, "../buffer_ffi.mjs", "read_int_be")
pub fn read_int_be(buffer bf: Buffer, offset o: Int, byte_length l: Int) -> Int

pub fn read_int_be_sized(
  buffer bf: Buffer,
  offset o: Int,
  byte_length l: ByteLength,
) -> Int {
  read_int_be(bf, o, byte_length_to_int(l))
}

@external(javascript, "../buffer_ffi.mjs", "read_int_le")
pub fn read_int_le(buffer bf: Buffer, offset o: Int, byte_length l: Int) -> Int

pub fn read_int_le_sized(
  buffer bf: Buffer,
  offset o: Int,
  byte_length l: ByteLength,
) -> Int {
  read_int_le(bf, o, byte_length_to_int(l))
}

@external(javascript, "../buffer_ffi.mjs", "read_uint8")
pub fn read_uint8(buffer bf: Buffer, offset o: Int) -> Int

@external(javascript, "../buffer_ffi.mjs", "read_uint16_be")
pub fn read_uint16_be(buffer bf: Buffer, offset o: Int) -> Int

@external(javascript, "../buffer_ffi.mjs", "read_uint16_le")
pub fn read_uint16_le(buffer bf: Buffer, offset o: Int) -> Int

@external(javascript, "../buffer_ffi.mjs", "read_uint32_be")
pub fn read_uint32_be(buffer bf: Buffer, offset o: Int) -> Int

@external(javascript, "../buffer_ffi.mjs", "read_uint32_le")
pub fn read_uint32_le(buffer bf: Buffer, offset o: Int) -> Int

@external(javascript, "../buffer_ffi.mjs", "read_uint_be")
pub fn read_uint_be(buffer bf: Buffer, offset o: Int, byte_length l: Int) -> Int

pub fn read_uint_be_sized(
  buffer bf: Buffer,
  offset o: Int,
  byte_length l: ByteLength,
) -> Int {
  read_uint_be(bf, o, byte_length_to_int(l))
}

@external(javascript, "../buffer_ffi.mjs", "read_uint_le")
pub fn read_uint_le(buffer bf: Buffer, offset o: Int, byte_length l: Int) -> Int

pub fn read_uint_le_sized(
  buffer bf: Buffer,
  offset o: Int,
  byte_length l: ByteLength,
) -> Int {
  read_uint_le(bf, o, byte_length_to_int(l))
}

@external(javascript, "../buffer_ffi.mjs", "read_float_be")
pub fn read_float_be(buffer bf: Buffer, offset o: Int) -> Float

@external(javascript, "../buffer_ffi.mjs", "read_float_le")
pub fn read_float_le(buffer bf: Buffer, offset o: Int) -> Float

@external(javascript, "../buffer_ffi.mjs", "read_double_be")
pub fn read_double_be(buffer bf: Buffer, offset o: Int) -> Float

@external(javascript, "../buffer_ffi.mjs", "read_double_le")
pub fn read_double_le(buffer bf: Buffer, offset o: Int) -> Float

@external(javascript, "../buffer_ffi.mjs", "write_int8")
pub fn write_int8(buffer bf: Buffer, value v: Int, offset o: Int) -> Buffer

@external(javascript, "../buffer_ffi.mjs", "write_int16_be")
pub fn write_int16_be(buffer bf: Buffer, value v: Int, offset o: Int) -> Buffer

@external(javascript, "../buffer_ffi.mjs", "write_int16_le")
pub fn write_int16_le(buffer bf: Buffer, value v: Int, offset o: Int) -> Buffer

@external(javascript, "../buffer_ffi.mjs", "write_int32_be")
pub fn write_int32_be(buffer bf: Buffer, value v: Int, offset o: Int) -> Buffer

@external(javascript, "../buffer_ffi.mjs", "write_int32_le")
pub fn write_int32_le(buffer bf: Buffer, value v: Int, offset o: Int) -> Buffer

@external(javascript, "../buffer_ffi.mjs", "write_int_be")
pub fn write_int_be(
  buffer bf: Buffer,
  value v: Int,
  offset o: Int,
  byte_length l: Int,
) -> Buffer

pub fn write_int_be_sized(
  buffer bf: Buffer,
  value v: Int,
  offset o: Int,
  byte_length l: ByteLength,
) -> Buffer {
  write_int_be(bf, v, o, byte_length_to_int(l))
}

@external(javascript, "../buffer_ffi.mjs", "write_int_le")
pub fn write_int_le(
  buffer bf: Buffer,
  value v: Int,
  offset o: Int,
  byte_length l: Int,
) -> Buffer

pub fn write_int_le_sized(
  buffer bf: Buffer,
  value v: Int,
  offset o: Int,
  byte_length l: ByteLength,
) -> Buffer {
  write_int_le(bf, v, o, byte_length_to_int(l))
}

@external(javascript, "../buffer_ffi.mjs", "write_uint8")
pub fn write_uint8(buffer bf: Buffer, value v: Int, offset o: Int) -> Buffer

@external(javascript, "../buffer_ffi.mjs", "write_uint16_be")
pub fn write_uint16_be(buffer bf: Buffer, value v: Int, offset o: Int) -> Buffer

@external(javascript, "../buffer_ffi.mjs", "write_uint16_le")
pub fn write_uint16_le(buffer bf: Buffer, value v: Int, offset o: Int) -> Buffer

@external(javascript, "../buffer_ffi.mjs", "write_uint32_be")
pub fn write_uint32_be(buffer bf: Buffer, value v: Int, offset o: Int) -> Buffer

@external(javascript, "../buffer_ffi.mjs", "write_uint32_le")
pub fn write_uint32_le(buffer bf: Buffer, value v: Int, offset o: Int) -> Buffer

@external(javascript, "../buffer_ffi.mjs", "write_uint_be")
pub fn write_uint_be(
  buffer bf: Buffer,
  value v: Int,
  offset o: Int,
  byte_length l: Int,
) -> Buffer

pub fn write_uint_be_sized(
  buffer bf: Buffer,
  value v: Int,
  offset o: Int,
  byte_length l: ByteLength,
) -> Buffer {
  write_uint_be(bf, v, o, byte_length_to_int(l))
}

@external(javascript, "../buffer_ffi.mjs", "write_uint_le")
pub fn write_uint_le(
  buffer bf: Buffer,
  value v: Int,
  offset o: Int,
  byte_length l: Int,
) -> Buffer

pub fn write_uint_le_sized(
  buffer bf: Buffer,
  value v: Int,
  offset o: Int,
  byte_length l: ByteLength,
) -> Buffer {
  write_uint_le(bf, v, o, byte_length_to_int(l))
}

@external(javascript, "../buffer_ffi.mjs", "write_float_be")
pub fn write_float_be(
  buffer bf: Buffer,
  value v: Float,
  offset o: Int,
) -> Buffer

@external(javascript, "../buffer_ffi.mjs", "write_float_le")
pub fn write_float_le(
  buffer bf: Buffer,
  value v: Float,
  offset o: Int,
) -> Buffer

@external(javascript, "../buffer_ffi.mjs", "write_double_be")
pub fn write_double_be(
  buffer bf: Buffer,
  value v: Float,
  offset o: Int,
) -> Buffer

@external(javascript, "../buffer_ffi.mjs", "write_double_le")
pub fn write_double_le(
  buffer bf: Buffer,
  value v: Float,
  offset o: Int,
) -> Buffer

/// write at offset of buffer for length number of bytes
@external(javascript, "../buffer_ffi.mjs", "write")
pub fn write(
  buffer bf: Buffer,
  string ba: String,
  encoding e: Encoding,
  offset o: Int,
  length l: Int,
) -> Buffer
