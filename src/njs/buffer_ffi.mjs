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
} from "./buffer.mjs";

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

export function write(b, ba, e, o, l) {
  b.write(ba, o, l, encoding(e));
  return b;
}

