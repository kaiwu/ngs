import { Ok, Error } from "./gleam.mjs"
import { ItemString, ItemInt, ItemNumber } from "./njs/shared_dict.mjs"

export function get_shared_dict(name) {
    let dict = ngx.shared[name];
    if (dict) {
        return new Ok(dict);
    } else {
        return new Error(undefined);
    }
}

export function shared_memory_error_name() {
    return SharedMemoryError.prototype.name;
}

export function shared_memory_error_message() {
    return SharedMemoryError.prototype.message;
}

export function add(d, k, v, t) {
    return t ? d.add(k, v, t) : d.add(k, v);
}

export function capacity(d) {
    return d.capacity;
}

export function clear(d) {
    d.clear();
}

export function shared_dict_delete(d, k) {
    return d.delete(k);
}

export function free_space(d) {
    return d.freeSpace;
}

export function get(d, k) {
    let r = d.get(k);
    switch (typeof r) {
        case "string":
            return new ItemString(r)
        case "number":
            return Number.isInteger(r) ? new ItemInt(r) : new ItemNumber(r)
    }
}

export function has(d, k) {
    return d.has(k);
}

export function incr(d, k, delta, init, t) {
    return t ? d.incr(k, delta, init, t) : d.incr(k, delta, init);
}

export function items(d, mc) {
    return mc ? d.items(mc) : d.items();
}

export function keys(d, mc) {
    return mc ? d.keys(mc) : d.keys();
}

export function name(d) {
    return d.name;
}

export function pop(d, k) {
    if (has(d, k)) {
        return new Ok(d.pop(k))
    }
    return new Error(undefined)
}

export function replace(d, k, v) {
    return d.replace(k, v);
}

export function set(d, k, v, t) {
    return d.set(k, v, t)
}

export function size(d) {
    return d.size;
}

export function dict_type(d) {
    return d.type;
}

export function ttl(d, k) {
    const ms = d.ttl(k);
    return ms !== undefined ? new Ok(Math.round(ms)) : new Error(undefined);
}
