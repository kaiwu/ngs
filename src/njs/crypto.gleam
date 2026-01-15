import gleam/javascript/array.{type Array}
import gleam/javascript/promise.{type Promise}
import gleam/json.{type Json}
import njs/buffer.{type ArrayBuffer, type Encoding, type TypedArray}

pub type Hmac

pub type Hash

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

@external(javascript, "../crypto_ffi.mjs", "get_random_values")
pub fn get_random_values(typedarray a: TypedArray) -> TypedArray

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

@external(javascript, "../crypto_ffi.mjs", "create_hash")
pub fn create_hash(algorithm a: String) -> Hash

@external(javascript, "../crypto_ffi.mjs", "hash_update")
pub fn hash_update(hash h: Hash, data d: BitArray) -> Hash

@external(javascript, "../crypto_ffi.mjs", "hash_copy")
pub fn hash_copy(hash h: Hash) -> Hash

@external(javascript, "../crypto_ffi.mjs", "hash_digest")
pub fn hash_digest(hash h: Hash, encoding e: Encoding) -> String

@external(javascript, "../crypto_ffi.mjs", "create_hmac")
pub fn create_hmac(algorithm a: String, secret k: String) -> Hmac

@external(javascript, "../crypto_ffi.mjs", "hmac_update")
pub fn hmac_update(hmac h: Hmac, data d: BitArray) -> Hmac

@external(javascript, "../crypto_ffi.mjs", "hmac_digest")
pub fn hmac_digest(hmac h: Hmac, encoding e: Encoding) -> String
