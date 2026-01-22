import { Ok, Error } from "./gleam.mjs"
import {default as Crypto} from 'crypto'

import {
  Utf8,
  Hex,
  Base64,
  Base64Url,
} from "./njs/buffer.mjs";

function encoding(e) {
  if (e instanceof Hex) {
    return 'hex';
  }
  else if (e instanceof Base64) {
    return 'base64';
  }
  else if (e instanceof Base64Url) {
    return 'base64url';
  }
  return 'utf8';
}

export function get_random_values(a) {
    return crypto.getRandomValues(a);
}

export function encrypt(a, k, d) {
    return new Promise(resolve => {
        crypto.subtle.encrypt(a, k, d).then(v => resolve(v))
    })
}

export function decrypt(a, k, d) {
    return new Promise(resolve => {
        crypto.subtle.decrypt(a, k, d).then(v => resolve(v))
    })
}

export function sign(a, k, d) {
    return new Promise(resolve => {
        crypto.subtle.sign(a, k, d).then(v => resolve(v))
    })
}

export function verify(a, k, s, d) {
    return new Promise(resolve => {
        crypto.subtle.verify(a, k, s, d).then(v => resolve(v))
    })
}

export function digest(a, d) {
    return new Promise(resolve => {
        crypto.subtle.digest(a, d).then(v => resolve(v))
    })
}

export function import_key(f, k, a, e, ku) {
    return new Promise(resolve => {
        crypto.subtle.importKey(f, k, a, e, ku).then(v => resolve(v))
    })
}

export function export_key(f, k) {
    return new Promise(resolve => {
        crypto.subtle.exportKey(f, k).then(v => resolve(v))
    })
}

export function generate_key(a, e, u) {
    return new Promise(resolve => {
        crypto.subtle.generateKey(a, e, u).then(v => resolve(v))
    })
}

export function derive_bits(a, k, l) {
    return new Promise(resolve => {
        crypto.subtle.deriveBits(a, k, l).then(v => resolve(v))
    })
}

export function derive_key(a, k, dka, e, ku) {
    return new Promise(resolve => {
        crypto.subtle.deriveKey(a, k, dka, e, ku).then(v => resolve(v))
    })
}

export function create_hash(a) {
    return Crypto.createHash(a);
}

export function hash_update(h, d) {
    h.update(d);
    return h;
}

export function hash_copy(h) {
    return h.copy();
}

export function hash_digest(h, e) {
    return h.digest(encoding(e));
}

export function create_hmac(a, k) {
    return Crypto.createHmac(a, k);
}

export function hmac_update(h, d) {
    h.update(d);
    return h;
}

export function hmac_digest(h, e) {
    return h.digest(encoding(e));
}

