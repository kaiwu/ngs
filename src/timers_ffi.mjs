export function set_timeout(cb, ms, args) {
  return setTimeout(cb, ms, ...args);
}

export function clear_timeout(t) {
  clearTimeout(t);
}
