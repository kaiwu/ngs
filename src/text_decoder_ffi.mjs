export function new(enc, o) {
  return o ? new TextDecoder(enc, o) : new TextDecoder(enc);
}

export function encoding(d) {
  return d.encoding;
}

export function fatal(d) {
  return d.fatal;
}

export function ignore_bom(d) {
  return d.ignoreBOM;
}

export function decode(d, b, o) {
  return o ? d.decode(b, o) : d.decode(b);
}
