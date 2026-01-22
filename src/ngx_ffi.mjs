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

export function make_string(a) {
    return JSON.stringify(a);
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

export function dump(a) {
    return njs.dump(a);
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
            ngx.log(ngx.ERROR, message);
            break;
    }
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
