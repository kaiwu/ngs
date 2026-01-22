import { Ok, Error } from "./gleam.mjs"

export function extract_cookie_value(header, prefix) {
  const cookies = header.split(';').map(c => c.trim());
  for (const cookie of cookies) {
    if (cookie.startsWith(prefix)) {
      return new Ok(cookie.slice(prefix.length));
    }
  }
  return new Error(undefined);
}

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

export function http_get_header_in(r, name) {
  let v = r.headersIn[name];
  if (v) {
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

export function http_set_return_value(r, v) {
  r.setReturnValue(v);
}

export function get_variable(r, name) {
  return r.variables[name] || "";
}

export function get_variable_or(r, name, def) {
  return r.variables[name] || def;
}

export function get_variable_int(r, name, def) {
  const val = r.variables[name];
  if (val === undefined) return def;
  const n = Number(val);
  return isNaN(n) ? def : n;
}

export function now_ms() {
  return Date.now();
}

export function is_undefined(val) {
  return val === undefined || val === null || val.length === 0;
}

export function parse_rate_data(data) {
  try {
    const str = typeof data === 'string' ? data : String(data);
    const obj = JSON.parse(str);
    if (typeof obj.timestamp === 'number' && typeof obj.count === 'number') {
      return new Ok([obj.timestamp, obj.count]);
    }
    return new Error(undefined);
  } catch (e) {
    return new Error(undefined);
  }
}

