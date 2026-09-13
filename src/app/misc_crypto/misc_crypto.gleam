import gleam/javascript/promise
import gleam/json
import njs/buffer
import njs/crypto
import njs/http.{type HTTPRequest}
import njs/ngx.{type JsObject}

fn hash(encoding: buffer.Encoding) -> String {
  crypto.create_hash("sha256")
  |> crypto.hash_update("abc")
  |> crypto.hash_digest(encoding)
}

fn hmac(encoding: buffer.Encoding) -> String {
  crypto.create_hmac("sha256", "key")
  |> crypto.hmac_update("abc")
  |> crypto.hmac_digest(encoding)
}

fn buffer_hex(data: buffer.Buffer) -> String {
  buffer.to_string(data, buffer.Hex, 0, buffer.length(data))
}

fn sync(r: HTTPRequest) -> Nil {
  let data = buffer.from_string("abc", buffer.Utf8)
  let key = buffer.from_string("key", buffer.Utf8)
  let hash_buffer =
    crypto.create_hash("sha256")
    |> crypto.hash_update(data)
    |> crypto.hash_digest_buffer
    |> buffer_hex
  let hmac_buffer =
    crypto.create_hmac("sha256", key)
    |> crypto.hmac_update(data)
    |> crypto.hmac_digest_buffer
    |> buffer_hex
  let original = crypto.create_hash("sha256") |> crypto.hash_update("ab")
  let copy = crypto.hash_copy(original)
  let original_digest =
    original |> crypto.hash_update("c") |> crypto.hash_digest(buffer.Hex)
  let copy_digest =
    copy |> crypto.hash_update("d") |> crypto.hash_digest(buffer.Hex)

  json.object([
    #("hash_hex", json.string(hash(buffer.Hex))),
    #("hash_base64", json.string(hash(buffer.Base64))),
    #("hash_base64url", json.string(hash(buffer.Base64Url))),
    #("hmac_hex", json.string(hmac(buffer.Hex))),
    #("hmac_base64", json.string(hmac(buffer.Base64))),
    #("hmac_base64url", json.string(hmac(buffer.Base64Url))),
    #("hash_buffer", json.string(hash_buffer)),
    #("hmac_buffer", json.string(hmac_buffer)),
    #("original", json.string(original_digest)),
    #("copy", json.string(copy_digest)),
  ])
  |> json.to_string
  |> http.return_text(r, 200, _)
}

fn async_crypto(r: HTTPRequest) -> promise.Promise(Nil) {
  let data = buffer.from_string("abc", buffer.Utf8)
  let key = buffer.from_string("key", buffer.Utf8)
  use hash <- promise.await(crypto.compute_hash("sha256", data, buffer.Hex))
  use hmac <- promise.await(crypto.compute_hmac("sha256", key, data, buffer.Hex))
  json.object([#("hash", json.string(hash)), #("hmac", json.string(hmac))])
  |> json.to_string
  |> http.return_text(r, 200, _)
  |> promise.resolve
}

pub fn exports() -> JsObject {
  ngx.object()
  |> ngx.merge("sync", sync)
  |> ngx.merge("async_crypto", async_crypto)
}
