import gleam/javascript/array
import gleam/javascript/promise
import njs/buffer
import njs/crypto
import njs/http.{type HTTPRequest}
import njs/ngx.{type JsObject}

const key_hex = "000102030405060708090a0b0c0d0e0f"

const iv_hex = "0f0e0d0c0b0a090807060504"

const tag_length = 16

fn import_key() -> promise.Promise(crypto.CryptoKey) {
  let key_bytes = buffer.from_string(key_hex, buffer.Hex)
  crypto.import_key(
    "raw",
    buffer.get_buffer(key_bytes),
    crypto.AesKey("AES-GCM"),
    False,
    array.from_list(["encrypt", "decrypt"]),
  )
}

fn make_iv() -> buffer.ArrayBuffer {
  let iv_buf = buffer.from_string(iv_hex, buffer.Hex)
  buffer.get_buffer(iv_buf)
}

fn empty_aad() -> buffer.ArrayBuffer {
  buffer.get_buffer(buffer.from_string("", buffer.Utf8))
}

fn encrypt(r: HTTPRequest) -> promise.Promise(Nil) {
  let plaintext = http.request_text(r)
  let plaintext_buf = buffer.from_string(plaintext, buffer.Utf8)
  let plaintext_len = buffer.length(plaintext_buf)

  use key <- promise.await(import_key())
  use ciphertext_ab <- promise.await(crypto.encrypt(
    crypto.AesGcm("AES-GCM", make_iv(), empty_aad(), 128),
    key,
    buffer.get_buffer(plaintext_buf),
  ))

  let ciphertext_len = plaintext_len + tag_length
  let ciphertext_buf = buffer.from(ciphertext_ab, 0, ciphertext_len)
  let encoded =
    buffer.to_string(ciphertext_buf, buffer.Base64, 0, ciphertext_len)

  http.return_text(r, 200, encoded)
  |> promise.resolve
}

fn decrypt(r: HTTPRequest) -> promise.Promise(Nil) {
  let ciphertext_b64 = http.request_text(r)
  let ciphertext_buf = buffer.from_string(ciphertext_b64, buffer.Base64)
  let ciphertext_len = buffer.length(ciphertext_buf)
  let plaintext_len = ciphertext_len - tag_length

  use key <- promise.await(import_key())
  use plaintext_ab <- promise.await(crypto.decrypt(
    crypto.AesGcm("AES-GCM", make_iv(), empty_aad(), 128),
    key,
    buffer.get_buffer(ciphertext_buf),
  ))

  let plaintext_buf = buffer.from(plaintext_ab, 0, plaintext_len)
  let plaintext = buffer.to_string(plaintext_buf, buffer.Utf8, 0, plaintext_len)

  http.return_text(r, 200, plaintext)
  |> promise.resolve
}

pub fn exports() -> JsObject {
  ngx.object()
  |> ngx.merge("encrypt", encrypt)
  |> ngx.merge("decrypt", decrypt)
}
