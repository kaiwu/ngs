export function add(d, k, v, t) {
  return t ? d.add(k, v, t) : d.add(k, v);
}

export function capacity(d) {
  return d.capacity;
}

export function clear(d) {
  d.clear();
}

export function delete(d, k) {
  return d.delete(k);
}

export function free_space(d) {
  return d.freeSpace;
}

export function get(d, k) {
  return d.get(k);
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
  return d.pop(k);
}

export function replace(d, k, v) {
  return d.replace(k, v);
}

export function set(d, k, v, t) {
  return t ? d.set(k, v, t) : d.set(k, v);
}

export function size(d) {
  return d.size;
}

export function dict_type(d) {
  return d.type;
}
