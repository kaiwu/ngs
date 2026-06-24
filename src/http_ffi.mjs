import { Ok, Error } from "./gleam.mjs"
import { FormText, FormFile } from "./njs/http.mjs"

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

export function http_get_variable(r, name) {
  const v = r.variables[name];
  return v === undefined ? new Error(undefined) : new Ok(v);
}

export function http_get_raw_variable(r, name) {
  const v = r.rawVariables[name];
  return v === undefined ? new Error(undefined) : new Ok(v);
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

export function http_get_header_in(r, name) {
  let v = r.headersIn[name];
  if (v !== undefined) {
    return new Ok(v);
  } else {
    return new Error(undefined);
  }
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

export function http_request_line(r) {
  return r.requestLine;
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
  o ? r.sendBuffer(d, o) : r.sendBuffer(d);
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

export function http_set_return_value(r, v) {
  r.setReturnValue(v);
}

export function http_js_var_names(r) {
  return r.jsVarNames();
}

export function http_js_var_names_prefix(r, prefix) {
  return r.jsVarNames(prefix);
}

export function http_decline(r) {
  r.decline();
}

export async function http_read_request_text(r) {
  return await r.readRequestText();
}

export async function http_read_request_array_buffer(r) {
  return await r.readRequestArrayBuffer();
}

export async function http_read_request_json(r) {
  return await r.readRequestJSON();
}

export async function http_read_request_form(r) {
  return await r.readRequestForm();
}

export async function http_read_request_form_max_keys(r, maxKeys) {
  return await r.readRequestForm({ maxKeys });
}

function to_form_value(v) {
  return typeof v === "string" ? new FormText(v) : new FormFile(v.name);
}

export function http_form_get(form, name) {
  const v = form.get(name);
  return v === null || v === undefined ? new Error(undefined) : new Ok(to_form_value(v));
}

export function http_form_get_all(form, name) {
  return form.getAll(name).map(to_form_value);
}

export function http_form_has(form, name) {
  return form.has(name);
}

export function http_form_has_files(form) {
  return form.hasFiles();
}
