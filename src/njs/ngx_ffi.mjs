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
  return r.arrayBuffer();
}

export function request_body_json(r) {
  return r.json();
}

export function request_body_text(r) {
  return r.text();
}

function option(o) {
  return {
    status: o.status,
    headers: o.headers,
    statusText: o.status_text,
  };
}

export function to_response(b, o) {
  return new Response(b, option(o));
}

export function empty_response(o) {
  return new Response(null, option(o));
}

export function response_has_body(r) {
  return r.bodyUsed;
}

export function response_headers(r) {
  return r.headers;
}

export function response_status(r) {
  return r.status;
}

export function response_status_text(r) {
  return r.statusText;
}

export function response_url(r) {
  return r.url;
}

export function response_is_ok(r) {
  return r.ok;
}

export function response_is_redirected(r) {
  return r.redirected;
}

export function response_body_array_buffer(r) {
  return r.arrayBuffer();
}

export function response_body_json(r) {
  return r.json();
}

export function response_body_text(r) {
  return r.text();
}

export function fetch(r, o) {
  return o ? ngx.fetch(r, o) : ngx.fetch(r);
}

