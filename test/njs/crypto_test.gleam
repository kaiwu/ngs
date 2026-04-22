import njs/crypto

pub fn module_test() {
  let _ = crypto.get_random_values
  let _ = crypto.random_uuid
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
  let _ = crypto.wrap_key
  let _ = crypto.unwrap_key
  let _ = crypto.compute_hash
  let _ = crypto.compute_hmac
}
