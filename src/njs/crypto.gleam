import gleam/javascript/array.{type Array}
import gleam/javascript/promise.{type Promise}
import gleam/json.{type Json}
import njs/buffer.{type ArrayBuffer, type Buffer, type Encoding, type TypedArray}

pub type CryptoKey

pub type CryptoKeyPair

pub type SubtleCrypto

pub type Hash

pub type Hmac

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

@external(javascript, "../crypto_ffi.mjs", "subtle")
pub fn subtle() -> SubtleCrypto

@external(javascript, "../crypto_ffi.mjs", "crypto_key_algorithm")
pub fn crypto_key_algorithm(key k: CryptoKey) -> a

@external(javascript, "../crypto_ffi.mjs", "crypto_key_extractable")
pub fn crypto_key_extractable(key k: CryptoKey) -> Bool

@external(javascript, "../crypto_ffi.mjs", "crypto_key_type")
pub fn crypto_key_type(key k: CryptoKey) -> String

@external(javascript, "../crypto_ffi.mjs", "crypto_key_usages")
pub fn crypto_key_usages(key k: CryptoKey) -> Array(String)

@external(javascript, "../crypto_ffi.mjs", "crypto_key_pair_private_key")
pub fn crypto_key_pair_private_key(key_pair kp: CryptoKeyPair) -> CryptoKey

@external(javascript, "../crypto_ffi.mjs", "crypto_key_pair_public_key")
pub fn crypto_key_pair_public_key(key_pair kp: CryptoKeyPair) -> CryptoKey

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

@external(javascript, "../crypto_ffi.mjs", "create_hash")
pub fn create_hash(algorithm a: String) -> Hash

@external(javascript, "../crypto_ffi.mjs", "hash_update")
pub fn hash_update(hash h: Hash, data d: a) -> Hash

@external(javascript, "../crypto_ffi.mjs", "hash_digest_buffer")
pub fn hash_digest_buffer(hash h: Hash) -> Buffer

@external(javascript, "../crypto_ffi.mjs", "hash_digest")
pub fn hash_digest(hash h: Hash, encoding e: Encoding) -> String

@external(javascript, "../crypto_ffi.mjs", "hash_copy")
pub fn hash_copy(hash h: Hash) -> Hash

@external(javascript, "../crypto_ffi.mjs", "hash_constructor")
pub fn hash_constructor(hash h: Hash, algorithm a: String) -> Hash

@external(javascript, "../crypto_ffi.mjs", "create_hmac")
pub fn create_hmac(algorithm a: String, key k: b) -> Hmac

@external(javascript, "../crypto_ffi.mjs", "hmac_update")
pub fn hmac_update(hmac h: Hmac, data d: a) -> Hmac

@external(javascript, "../crypto_ffi.mjs", "hmac_digest_buffer")
pub fn hmac_digest_buffer(hmac h: Hmac) -> Buffer

@external(javascript, "../crypto_ffi.mjs", "hmac_digest")
pub fn hmac_digest(hmac h: Hmac, encoding e: Encoding) -> String

@external(javascript, "../crypto_ffi.mjs", "hmac_constructor")
pub fn hmac_constructor(hmac h: Hmac, algorithm a: String, key k: b) -> Hmac

/// Hash data through async WebCrypto and return the result as an encoded string.
/// The raw node-style createHash/update/digest chain is also exposed above.
@external(javascript, "../crypto_ffi.mjs", "compute_hash")
pub fn compute_hash(
  algorithm a: String,
  data d: Buffer,
  encoding e: Encoding,
) -> Promise(String)

/// Compute an HMAC through async WebCrypto and return it as an encoded string.
/// The raw node-style createHmac/update/digest chain is also exposed above.
@external(javascript, "../crypto_ffi.mjs", "compute_hmac")
pub fn compute_hmac(
  algorithm a: String,
  key k: Buffer,
  data d: Buffer,
  encoding e: Encoding,
) -> Promise(String)
