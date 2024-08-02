import { Ok, Error } from "./gleam.mjs"

export function to_headers(h) {
  return new Headers(h);
}

export function to_request(u, o) {
  return new Request(u, o);
}

export function request_has_body(r) {
  return r.bodyUsed;
}

export function request_headers(r) {
  return r.headers;
}

export function request_method(r) {
  return r.method;
}

export function request_url(r) {
  return r.url;
}

export function request_body_array_buffer(r) {
  return r.arrayBuffer()
}

export function request_body_json(r) {
  return r.json()
}

export function request_body_text(r) {
  return r.text()
}
