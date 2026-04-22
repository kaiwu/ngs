import {
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

// Normalize Node.js-style algorithm names to WebCrypto names
function algo_name(a) {
  switch (a.toLowerCase()) {
    case 'md5':    return 'MD5';
    case 'sha1':   return 'SHA-1';
    case 'sha256': return 'SHA-256';
    case 'sha384': return 'SHA-384';
    case 'sha512': return 'SHA-512';
    default:       return a;
  }
}

export function get_random_values(a) {
    return crypto.getRandomValues(a);
}

export function random_uuid() {
    return crypto.randomUUID();
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

export function wrap_key(f, k, wk, wa) {
    return new Promise(resolve => {
        crypto.subtle.wrapKey(f, k, wk, wa).then(v => resolve(v))
    })
}

export function unwrap_key(f, wk, uk, ua, uka, e, ku) {
    return new Promise(resolve => {
        crypto.subtle.unwrapKey(f, wk, uk, ua, uka, e, ku).then(v => resolve(v))
    })
}

// Compute a hash digest and return it encoded as a string.
// algorithm: Node.js-style name ("sha256", "md5", etc.)
// data: Buffer (njs Buffer / Uint8Array)
// enc: Gleam Encoding
export async function compute_hash(algorithm, data, enc) {
    const hash_buf = await crypto.subtle.digest(algo_name(algorithm), data);
    return Buffer.from(hash_buf).toString(encoding(enc));
}

// Compute an HMAC and return it encoded as a string.
// algorithm: hash algorithm name ("sha256", "sha1", etc.)
// key_data: Buffer containing the raw HMAC key bytes
// data: Buffer containing the message bytes
// enc: Gleam Encoding
export async function compute_hmac(algorithm, key_data, data, enc) {
    const name = algo_name(algorithm);
    const key = await crypto.subtle.importKey(
        "raw",
        key_data,
        { name: "HMAC", hash: name },
        false,
        ["sign"]
    );
    const sig = await crypto.subtle.sign("HMAC", key, data);
    return Buffer.from(sig).toString(encoding(enc));
}
