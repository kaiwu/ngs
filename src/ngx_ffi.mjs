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

export function now() {
    return Date.now()
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

export function make_string(a) {
    var str = JSON.stringify(a);
    if ((str.startsWith('"') && str.endsWith('"')) ||
        (str.startsWith("'") && str.endsWith("'"))) {
        return str.slice(1, -1);
    }
    return str;
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

export function request_cache(r) {
    return r.cache;
}

export function request_credentials(r) {
    return r.credentials;
}

export function request_mode(r) {
    return r.mode;
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

export function response_type(r) {
    return r.type;
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

export function base64url_decode(s) {
    return Buffer.from(s, 'base64url').toString('utf8');
}

export function base64url_encode(s) {
    return Buffer.from(s, 'utf8').toString('base64url');
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

export function build() {
    return ngx.build;
}

export function conf_file_path() {
    return ngx.conf_file_path;
}

export function conf_prefix() {
    return ngx.conf_prefix;
}

export function error_log_path() {
    return ngx.error_log_path;
}

export function prefix() {
    return ngx.prefix;
}

export function nginx_version() {
    return ngx.version;
}

export function ngx_version_number() {
    return ngx.version_number;
}

export function worker_id() {
    return ngx.worker_id;
}

export function level_err() {
    return ngx.ERR;
}

export function level_info() {
    return ngx.INFO;
}

export function level_warn() {
    return ngx.WARN;
}

export function ngx_log(level, message) {
    switch (level) {
        case 0: // Info
            ngx.log(ngx.INFO, message);
            break;
        case 1: // Warn
            ngx.log(ngx.WARN, message);
            break;
        case 2: // Err
            ngx.log(ngx.ERR, message);
            break;
    }
}

export function engine_id() {
    return ngx.engine_id;
}

export function njs_version() {
    return njs.version;
}

export function njs_version_number() {
    return njs.version_number;
}

export function njs_engine() {
    return njs.engine;
}

export function njs_on(event, cb) {
    njs.on(event, cb);
}

export function parse_query_string(q) {
    return require('querystring').parse(q);
}

export function make_query_string(q) {
    return require('querystring').stringify(q);
}

export function headers_append(headers, name, value) {
    return headers.append(name, value);
}

export function headers_delete(headers, name) {
    return headers.delete(name);
}

export function headers_get(headers, name) {
    return headers.get(name);
}

export function headers_get_all(headers, name) {
    return headers.getAll(name);
}

export function headers_for_each(headers, callback) {
    return headers.forEach(callback);
}

export function headers_has(headers, name) {
    return headers.has(name);
}

export function headers_set(headers, name, value) {
    return headers.set(name, value);
}
