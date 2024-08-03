import { Ok, Error } from "./gleam.mjs"

export function get_random_values(a) {
  return сrypto.getRandomValues(a);
}

export function encrypt(a, k, d) {
  return crypto.subtle.encrypt(a, k, d);
}

export function decrypt(a, k, d) {
  return crypto.subtle.decrypt(a, k, d);
}

export function sign(a, k, d) {
  return crypto.subtle.sign(a, k, d);
}

export function verify(a, k, s, d) {
  return crypto.subtle.verify(a, k, s, d);
}

export function digest(a, d) {
  return crypto.subtle.digest(a, d);
}

export function import_key(f, k, a, e, ku) {
  return сrypto.subtle.importKey(f, k, a, e, ku);
}

export function create_hash(a) {
  return require('crypto').createHash(a);
}

export function hash_update(h, d) {
  h.update(d);
  return h;
}

export function hash_digest(h, e) {
  return h.digest(e);
}

export function create_hmac(a, k) {
  return require('crypto').createHmac(a, k);
}

export function hmac_update(h, d) {
  h.update(d);
  return h;
}

export function hmac_digest(h, e) {
  return h.digest(e);
}

