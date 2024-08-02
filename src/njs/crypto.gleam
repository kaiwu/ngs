import gleam/javascript/array.{type Array}
import gleam/javascript/promise.{type Promise}
import njs/buffer.{type ArrayBuffer, type TypedArray}

pub type CryptoKey

pub type KeyAlgorithm {
  /// RSA-OAEP
  RsaOaepKey(name: String, hash: String)
  /// HMAC
  HMACKey(name: String, hash: String, length: Int)
  /// AES-CTR AES-CBC ASE-GCM
  AesKey(name: String)
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

@external(javascript, "./crypto_ffi.mjs", "get_random_values")
pub fn get_random_values(typedarray a: TypedArray) -> TypedArray

@external(javascript, "./crypto_ffi.mjs", "encrypt")
pub fn encrypt(
  algorithm a: EncryptAlgorithm,
  key k: CryptoKey,
  plaintext d: ArrayBuffer,
) -> Promise(ArrayBuffer)

@external(javascript, "./crypto_ffi.mjs", "decrypt")
pub fn decrypt(
  algorithm a: DecryptAlgorithm,
  key k: CryptoKey,
  ciphertext d: ArrayBuffer,
) -> Promise(ArrayBuffer)

@external(javascript, "./crypto_ffi.mjs", "digest")
pub fn digest(algorithm a: String, data d: ArrayBuffer) -> Promise(ArrayBuffer)

@external(javascript, "./crypto_ffi.mjs", "sign")
pub fn sign(
  algorithm a: a,
  key k: CryptoKey,
  data d: ArrayBuffer,
) -> Promise(ArrayBuffer)

@external(javascript, "./crypto_ffi.mjs", "verify")
pub fn verify(
  algorithm a: a,
  key k: CryptoKey,
  signature s: ArrayBuffer,
  data d: ArrayBuffer,
) -> Promise(Bool)

@external(javascript, "./crypto_ffi.mjs", "import")
pub fn import_key(
  format f: String,
  key k: ArrayBuffer,
  algorithm a: KeyAlgorithm,
  extractable e: Bool,
  usages ku: Array(String),
) -> Promise(CryptoKey)
