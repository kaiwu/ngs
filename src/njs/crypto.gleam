import gleam/javascript/array.{type Array}
import gleam/javascript/promise.{type Promise}
import gleam/json.{type Json}
import njs/buffer.{type ArrayBuffer, type Buffer, type Encoding, type TypedArray}

pub type CryptoKey

pub type CryptoKeyPair

pub type KeyData {
  KeyData(d: Json)
  KeyArrayData(d: ArrayBuffer)
}

pub type KeyAlgorithm {
  /// RSA-OAEP
  RsaOaepKey(name: String, hash: String)
  /// HMAC
  HMACKey(name: String, hash: String, length: Int)
  /// AES-CTR AES-CBC AES-GCM AES-KW
  AesKey(name: String)
  /// Ed25519, X25519
  OKPKey(name: String)
}

pub type EncryptAlgorithm {
  RsaOaep(name: String)
  AesCtr(name: String, counter: ArrayBuffer, length: Int)
  AesCbc(name: String, iv: ArrayBuffer)
  AesGcm(
    name: String,
    iv: ArrayBuffer,
    additional_data: ArrayBuffer,
    tag_length: Int,
  )
}

pub type DecryptAlgorithm =
  EncryptAlgorithm

@external(javascript, "../crypto_ffi.mjs", "get_random_values")
pub fn get_random_values(typedarray a: TypedArray) -> TypedArray

/// Generate a random UUID v4 string. Added in njs 0.9.7.
@external(javascript, "../crypto_ffi.mjs", "random_uuid")
pub fn random_uuid() -> String

@external(javascript, "../crypto_ffi.mjs", "encrypt")
pub fn encrypt(
  algorithm a: EncryptAlgorithm,
  key k: CryptoKey,
  plaintext d: ArrayBuffer,
) -> Promise(ArrayBuffer)

@external(javascript, "../crypto_ffi.mjs", "decrypt")
pub fn decrypt(
  algorithm a: DecryptAlgorithm,
  key k: CryptoKey,
  ciphertext d: ArrayBuffer,
) -> Promise(ArrayBuffer)

@external(javascript, "../crypto_ffi.mjs", "digest")
pub fn digest(algorithm a: String, data d: ArrayBuffer) -> Promise(ArrayBuffer)

@external(javascript, "../crypto_ffi.mjs", "sign")
pub fn sign(
  algorithm a: a,
  key k: CryptoKey,
  data d: ArrayBuffer,
) -> Promise(ArrayBuffer)

@external(javascript, "../crypto_ffi.mjs", "verify")
pub fn verify(
  algorithm a: a,
  key k: CryptoKey,
  signature s: ArrayBuffer,
  data d: ArrayBuffer,
) -> Promise(Bool)

@external(javascript, "../crypto_ffi.mjs", "import_key")
pub fn import_key(
  format f: String,
  key k: ArrayBuffer,
  algorithm a: KeyAlgorithm,
  extractable e: Bool,
  usages ku: Array(String),
) -> Promise(CryptoKey)

@external(javascript, "../crypto_ffi.mjs", "export_key")
pub fn export_key(format f: String, key k: CryptoKey) -> Promise(KeyData)

@external(javascript, "../crypto_ffi.mjs", "generate_key")
pub fn generate_key(
  algorithm a: KeyAlgorithm,
  extractable e: Bool,
  usages ku: Array(String),
) -> Promise(CryptoKeyPair)

@external(javascript, "../crypto_ffi.mjs", "derive_bits")
pub fn derive_bits(
  algorithm a: a,
  base_key k: CryptoKey,
  length l: Int,
) -> Promise(ArrayBuffer)

@external(javascript, "../crypto_ffi.mjs", "derive_key")
pub fn derive_key(
  algorithm a: a,
  base_key k: CryptoKey,
  derived_key_algorithm dka: KeyAlgorithm,
  extractable e: Bool,
  key_usages ku: Array(String),
) -> Promise(CryptoKey)

/// Wrap a CryptoKey using a wrapping key. Added in njs 0.9.7.
@external(javascript, "../crypto_ffi.mjs", "wrap_key")
pub fn wrap_key(
  format f: String,
  key k: CryptoKey,
  wrapping_key wk: CryptoKey,
  algorithm a: a,
) -> Promise(ArrayBuffer)

/// Unwrap an encrypted key. Added in njs 0.9.7.
@external(javascript, "../crypto_ffi.mjs", "unwrap_key")
pub fn unwrap_key(
  format f: String,
  wrapped_key wk: ArrayBuffer,
  unwrapping_key uk: CryptoKey,
  unwrap_algorithm ua: a,
  unwrapped_key_algorithm uka: KeyAlgorithm,
  extractable e: Bool,
  key_usages ku: Array(String),
) -> Promise(CryptoKey)

/// Hash data and return the result as an encoded string.
/// algorithm: Node.js-style name ("sha256", "sha1", "md5", etc.)
/// Replaces the removed createHash/update/digest chain from njs 0.9.7.
@external(javascript, "../crypto_ffi.mjs", "compute_hash")
pub fn compute_hash(
  algorithm a: String,
  data d: Buffer,
  encoding e: Encoding,
) -> Promise(String)

/// Compute an HMAC and return it as an encoded string.
/// algorithm: hash algorithm ("sha256", "sha1", etc.)
/// key: raw key bytes as a Buffer
/// Replaces the removed createHmac/update/digest chain from njs 0.9.7.
@external(javascript, "../crypto_ffi.mjs", "compute_hmac")
pub fn compute_hmac(
  algorithm a: String,
  key k: Buffer,
  data d: Buffer,
  encoding e: Encoding,
) -> Promise(String)
