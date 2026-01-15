import njs/crypto

pub fn module_test() {
  let _ = crypto.get_random_values
  let _ = crypto.encrypt
  let _ = crypto.decrypt
  let _ = crypto.digest
  let _ = crypto.sign
  let _ = crypto.verify
  let _ = crypto.import_key
  let _ = crypto.export_key
  let _ = crypto.generate_key
  let _ = crypto.derive_bits
  let _ = crypto.derive_key
  let _ = crypto.create_hash
  let _ = crypto.hash_update
  let _ = crypto.hash_copy
  let _ = crypto.hash_digest
  let _ = crypto.create_hmac
  let _ = crypto.hmac_update
  let _ = crypto.hmac_digest
}
