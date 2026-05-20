import { Ok, Error } from "./gleam.mjs"

import {
  Utf8,
  Hex,
  Base64,
  Base64Url,
  Int8,
  UInt8,
  Int16,
  UInt16,
  Int32,
  UInt32,
} from "./njs/buffer.mjs";

function encoding(e) {
  if (e instanceof Hex) {
    return 'hex';
  }
  else if (e instanceof Base64) {
    return 'base64';
  }
  else if (e instanceof Base64Url) {
    return 'base64url';
  }
  return 'utf8';
}

export function byte_length(v, e) {
  return Buffer.byteLength(v, encoding(e))
}

export function array_buffer_byte_length(ab) {
  return ab.byteLength;
}

export function new_array_buffer(s) {
  return new ArrayBuffer(s);
}

export function new_typed_array(t, s) {
  let b = new ArrayBuffer(s);
  if (t instanceof UInt8) {
    return new UInt8Array(b);
  }
  else if (t instanceof Int16) {
    return new Int16Array(b);
  }
  else if (t instanceof UInt16) {
    return new UInt16Array(b);
  }
  else if (t instanceof Int32) {
    return new Int32Array(b);
  }
  else if (t instanceof UInt32) {
    return new UInt32Array(b);
  }
  return new Int8Array(b);
}

export function alloc(s) {
  return Buffer.alloc(s);
}

export function alloc_unsafe(s) {
  return Buffer.allocUnsafe(s);
}

export function compare(b1, b2) {
  return Buffer.compare(b1, b2);
}

export function concat(ls, l) {
  return l ? Buffer.concat(ls, l) : Buffer.concat(ls);
}

export function from_bytes(bs) {
  return Buffer.from(bs);
}

export function from_array_buffer(ab, o, l) {
  return Buffer.from(ab, o, l);
}

export function from_buffer(b) {
  return Buffer.from(b);
}

export function from_string(s, e) {
  return Buffer.from(s, encoding(e));
}

export function is_buffer(obj) {
  return Buffer.isBuffer(obj);
}

export function is_encoding(e) {
  if (e instanceof Utf8) {
    return Buffer.isEncoding('utf8');
  } else if (e instanceof Hex) {
    return Buffer.isEncoding('hex');
  } else if (e instanceof Base64) {
    return Buffer.isEncoding('base64');
  } else if (e instanceof Base64Url) {
    return Buffer.isEncoding('base64url');
  }
  return false;
}

export function get_buffer(b) {
  return b.buffer;
}

export function get_buffer_offset(b) {
  return b.byteOffset;
}

export function get_byte(b, o) {
  return b[o];
}

export function set_byte(b, o, v) {
  b[o] = v;
  return b;
}

export function copy(bd, bs, f, t) {
  bs.copy(bd, 0, f, t)
  return bd;
}

export function equals(b1, b2) {
  return b1.equals(b2);
}

export function length(b) {
  return b.length;
}

export function fill(b, v, f, t) {
  return b.fill(v, f, t);
}

export function index_of(b, v, o) {
  return b.indexOf(v, o);
}

export function index_of_string(b, v, o, e) {
  return b.indexOf(v, o, encoding(e));
}

export function last_index_of(b, v, o) {
  return b.lastIndexOf(v, o);
}

export function last_index_of_string(b, v, o, e) {
  return b.lastIndexOf(v, o, encoding(e));
}

export function includes(b, v, o) {
  return b.includes(v, o);
}

export function includes_string(b, v, o, e) {
  return b.includes(v, o, encoding(e));
}

export function slice(b, o, e) {
  return b.slice(o, e);
}

export function to_string(b, e, f, t) {
  return b.toString(encoding(e), f, t);
}

export function to_json(b) {
  return b.toJSON();
}

export function subarray(b, s, e) {
  return b.subarray(s, e);
}

export function swap16(b) {
  b.swap16();
  return b;
}

export function swap32(b) {
  b.swap32();
  return b;
}

export function swap64(b) {
  b.swap64();
  return b;
}

export function read_int8(b, o) {
  return b.readInt8(o);
}

export function read_int16_be(b, o) {
  return b.readInt16BE(o);
}

export function read_int16_le(b, o) {
  return b.readInt16LE(o);
}

export function read_int32_be(b, o) {
  return b.readInt32BE(o);
}

export function read_int32_le(b, o) {
  return b.readInt32LE(o);
}

export function read_int_be(b, o, l) {
  return b.readIntBE(o, l);
}

export function read_int_le(b, o, l) {
  return b.readIntLE(o, l);
}

export function read_uint8(b, o) {
  return b.readUInt8(o);
}

export function read_uint16_be(b, o) {
  return b.readUInt16BE(o);
}

export function read_uint16_le(b, o) {
  return b.readUInt16LE(o);
}

export function read_uint32_be(b, o) {
  return b.readUInt32BE(o);
}

export function read_uint32_le(b, o) {
  return b.readUInt32LE(o);
}

export function read_uint_be(b, o, l) {
  return b.readUIntBE(o, l);
}

export function read_uint_le(b, o, l) {
  return b.readUIntLE(o, l);
}

export function read_float_be(b, o) {
  return b.readFloatBE(o);
}

export function read_float_le(b, o) {
  return b.readFloatLE(o);
}

export function read_double_be(b, o) {
  return b.readDoubleBE(o);
}

export function read_double_le(b, o) {
  return b.readDoubleLE(o);
}

export function write_int8(b, v, o) {
  b.writeInt8(v, o);
  return b;
}

export function write_int16_be(b, v, o) {
  b.writeInt16BE(v, o);
  return b;
}

export function write_int16_le(b, v, o) {
  b.writeInt16LE(v, o);
  return b;
}

export function write_int32_be(b, v, o) {
  b.writeInt32BE(v, o);
  return b;
}

export function write_int32_le(b, v, o) {
  b.writeInt32LE(v, o);
  return b;
}

export function write_int_be(b, v, o, l) {
  b.writeIntBE(v, o, l);
  return b;
}

export function write_int_le(b, v, o, l) {
  b.writeIntLE(v, o, l);
  return b;
}

export function write_uint8(b, v, o) {
  b.writeUInt8(v, o);
  return b;
}

export function write_uint16_be(b, v, o) {
  b.writeUInt16BE(v, o);
  return b;
}

export function write_uint16_le(b, v, o) {
  b.writeUInt16LE(v, o);
  return b;
}

export function write_uint32_be(b, v, o) {
  b.writeUInt32BE(v, o);
  return b;
}

export function write_uint32_le(b, v, o) {
  b.writeUInt32LE(v, o);
  return b;
}

export function write_uint_be(b, v, o, l) {
  b.writeUIntBE(v, o, l);
  return b;
}

export function write_uint_le(b, v, o, l) {
  b.writeUIntLE(v, o, l);
  return b;
}

export function write_float_be(b, v, o) {
  b.writeFloatBE(v, o);
  return b;
}

export function write_float_le(b, v, o) {
  b.writeFloatLE(v, o);
  return b;
}

export function write_double_be(b, v, o) {
  b.writeDoubleBE(v, o);
  return b;
}

export function write_double_le(b, v, o) {
  b.writeDoubleLE(v, o);
  return b;
}

export function write(b, ba, e, o, l) {
  b.write(ba, o, l, encoding(e));
  return b;
}

