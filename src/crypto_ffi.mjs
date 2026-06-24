import {
  Hex,
  Base64,
  Base64Url,
} from "./njs/buffer.mjs";
import cryptoModule from "crypto";

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

export function subtle() {
    return crypto.subtle;
}

export function crypto_key_algorithm(k) {
    return k.algorithm;
}

export function crypto_key_extractable(k) {
    return k.extractable;
}

export function crypto_key_type(k) {
    return k.type;
}

export function crypto_key_usages(k) {
    return k.usages;
}

export function crypto_key_pair_private_key(kp) {
    return kp.privateKey;
}

export function crypto_key_pair_public_key(kp) {
    return kp.publicKey;
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
    return crypto.subtle.importKey(f, k, a, e, ku);
}

export function export_key(f, k) {
    return crypto.subtle.exportKey(f, k);
}

export function generate_key(a, e, u) {
    return crypto.subtle.generateKey(a, e, u);
}

export function derive_bits(a, k, l) {
    return crypto.subtle.deriveBits(a, k, l);
}

export function derive_key(a, k, dka, e, ku) {
    return crypto.subtle.deriveKey(a, k, dka, e, ku);
}

export function wrap_key(f, k, wk, wa) {
    return crypto.subtle.wrapKey(f, k, wk, wa);
}

export function unwrap_key(f, wk, uk, ua, uka, e, ku) {
    return crypto.subtle.unwrapKey(f, wk, uk, ua, uka, e, ku);
}

export function create_hash(algorithm) {
    return cryptoModule.createHash(algorithm);
}

export function hash_update(hash, data) {
    return hash.update(data);
}

export function hash_digest_buffer(hash) {
    return hash.digest();
}

export function hash_digest(hash, enc) {
    return hash.digest(encoding(enc));
}

export function hash_copy(hash) {
    return hash.copy();
}

export function hash_constructor(hash, algorithm) {
    return hash.constructor(algorithm);
}

export function create_hmac(algorithm, key) {
    return cryptoModule.createHmac(algorithm, key);
}

export function hmac_update(hmac, data) {
    return hmac.update(data);
}

export function hmac_digest_buffer(hmac) {
    return hmac.digest();
}

export function hmac_digest(hmac, enc) {
    return hmac.digest(encoding(enc));
}

export function hmac_constructor(hmac, algorithm, key) {
    return hmac.constructor(algorithm, key);
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
