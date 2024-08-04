import { Ok, Error } from "./gleam.mjs"

export function http_args(r) {
  return r.args;
}

export function http_get_variables(r) {
  return r.variables;
}

export function http_set_variables(r, k, v) {
  r.variables[k] = v;
  return r;
}

export function http_get_raw_variables(r) {
  return r.rawVariables;
}

export function http_done(r) {
  r.done();
}

export function http_finish(r) {
  r.finish();
}

export function http_error(r, m) {
  r.error(m);
  return r;
}

export function http_headers_in(r) {
  return r.headersIn;
}

export function http_raw_headers_in(r) {
  return r.rawHeadersIn;
}

export function http_get_headers_out(r) {
  return r.headersOut;
}

export function http_get_raw_headers_out(r) {
  return r.rawHeadersOut;
}

export function http_set_headers_out(r, k, v) {
  r.headersOut[k] = v;
  return r;
}

export function http_version(r) {
  return r.httpVersion;
}

export function http_internal(r) {
  return r.internal;
}

export function http_internal_redirect(r, uri) {
  r.internalRedirect(uri);
}

export function http_log(r, m) {
  r.log(m);
  return r;
}

export function http_method(r) {
  return r.method;
}

export function http_parent(r) {
  return r.parent;
}

export function http_remote_address(r) {
  return r.remoteAddress;
}

export function http_request_buffer(r) {
  return r.requestBuffer;
}

export function http_request_text(r) {
  return r.requestText;
}

export function http_response_buffer(r) {
  return r.responseBuffer;
}

export function http_response_text(r) {
  return r.responseText;
}

export function http_return(r, c, b) {
  r.return(c, b);
}

export function http_return_code(r, c) {
  r.return(c);
}

export function http_send_text(r, d) {
  r.send(d);
  return r;
}

export function http_send_buffer(r, d, o) {
  o ? r.send(d, o) : r.send(d);
  return r;
}

export function http_send_header(r) {
  r.sendHeader();
  return r;
}

export function http_status(r) {
  return r.status;
}

export function http_set_status(r, s) {
  r.status = s;
  return r;
}

export function http_subrequest(r, uri, o) {
  return new Promise(resolve => {
    r.subrequest(uri, o, function(res) {
      resolve(res);
    })
  })
}

export function http_uri(r) {
  return r.uri;
}

export function http_warn(r, m) {
  r.warn(m);
  return r;
}


