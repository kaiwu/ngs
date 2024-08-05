import { Ok, Error } from "./gleam.mjs"

export function object() {
  return {};
}

export function merge(o, k, v) {
  return {
    ...o,
    [k]: v,
  };
}

export function append(ar, a) {
  ar.push(a);
  return ar;
}

export function get(o, k) {
  return k in o ? new Ok(o[k]) : new Error(undefined);
}

export function name(f) {
  return f.name;
}

export function id(a) {
  return a;
}

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

export function gatob(a) {
  return atob(a);
}

export function gbtoa(a) {
  return btoa(a);
}

export function version() {
  let v = {
    njs: njs.version,
    build: ngx.build,
    conf_file_path: ngx.conf_file_path,
    error_log_path: ngx.error_log_path,
    conf_prefix: ngx.conf_prefix,
    prefix: ngx.prefix,
    version: ngx.version,
    version_number: ngx.version_number,
    worker_id: ngx.worker_id,
  };
  return JSON.stringify(v);
}

export function dump(a) {
  return njs.dump(a);
}

export function parse_query_string(q) {
  return require('querystring').parse(q);
}

export function make_query_string(q) {
  return require('querystring').stringify(q);
}

export function shared_dict_add(k, v, t) {
  try {
    let r = t ? ngx.shared.SharedDict.add(k, v, t) 
              : ngx.shared.SharedDict.add(k, v);
    return new Ok(r);
  } catch (e) {
    return new Error(undefined);
  }
}

export function shared_dict_set(k, v, t) {
   t ? ngx.shared.SharedDict.set(k, v, t) 
     : ngx.shared.SharedDict.set(k, v);
}

export function shared_dict_replace(k, v) {
  try {
    let r = ngx.shared.SharedDict.replace(k, v);
    return new Ok(r);
  } catch (e) {
    return new Error(undefined);
  }
}

export function shared_dict_clear() {
  ngx.shared.SharedDict.clear();
}

export function shared_dict_name() {
  return ngx.shared.SharedDict.name;
}

export function shared_dict_delete(k) {
  return ngx.shared.SharedDict.delete(k);
}

export function shared_dict_has(k) {
  return ngx.shared.SharedDict.has(k);
}

export function shared_dict_get(k) {
  let r = ngx.shared.SharedDict.get(k);
  if (r) {
    return new Ok(r);
  }
  else {
    return new Error(undefined);
  }
}

export function shared_dict_items(m) {
  return ngx.shared.SharedDict.items(m);
}

export function shared_dict_keys(m) {
  return ngx.shared.SharedDict.keys(m);
}

export function shared_dict_pop(k) {
  let r = ngx.shared.SharedDict.pop(k);
  if (r) {
    return new Ok(r);
  }
  else {
    return new Error(undefined);
  }
}

export function shared_dict_size() {
  return ngx.shared.SharedDict.size();
}

