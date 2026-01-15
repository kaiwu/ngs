import qs from 'querystring';

export function decode(s) {
  return qs.parse(s);
}

export function encode(o) {
  return qs.stringify(o);
}

export function escape(s) {
  return qs.escape(s);
}

export function parse(s, sep, eq, o) {
  return o ? qs.parse(s, sep, eq, o) : qs.parse(s, sep, eq);
}

export function stringify(o, sep, eq, opt) {
  return opt ? qs.stringify(o, sep, eq, opt) : qs.stringify(o, sep, eq);
}

export function unescape(s) {
  return qs.unescape(s);
}
