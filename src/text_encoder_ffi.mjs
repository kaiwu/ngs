export function new() {
  return new TextEncoder();
}

export function encode(e, s) {
  return e.encode(s);
}

export function encode_into(e, s, d) {
  return e.encodeInto(s, d);
}
