export function allow(s) {
  s.allow();
}

export function decline(s) {
  s.decline();
}

export function deny(s) {
  s.deny();
}

export function done(s) {
  s.done();
}

export function done_code(s, c) {
  s.done(c);
}

export function error(s, m) {
  s.error(m);
}

export function log(s, m) {
  s.log(m);
}

export function off(s, en) {
  s.off(en);
}

export function on(s, en, cb) {
  s.on(en, cb);
}

export function remote_address(s) {
  return s.remoteAddress;
}

export function send(s, d) {
  s.send(d);
}

export function send_downstream(s, d) {
  s.sendDownstream(d);
}

export function send_upstream(s, d) {
  s.sendUpstream(d);
}

export function status(s) {
  return s.status;
}

export function set_return_value(s, rv) {
  s.setReturnValue(rv);
}

export function variables(s) {
  return s.variables;
}

export function raw_variables(s) {
  return s.rawVariables;
}

export function warn(s, m) {
  s.warn(m);
}
