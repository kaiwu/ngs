//// Simple Rate Limiting - Sliding window rate limiter using shared dict
//// Reference: https://github.com/nginx/njs-examples/blob/master/njs/http/rate-limit/simple.js
////
//// Uses js_shared_dict_zone to track request counts per client IP.
//// Returns retry-after value (seconds) if rate limit exceeded, "0" otherwise.

import gleam/int
import njs/http.{type HTTPRequest}
import njs/ngx.{type JsObject}
import njs/shared_dict

fn ratelimit(r: HTTPRequest) -> String {
  let zone_name = get_variable(r, "rl_zone_name")
  case ngx.get_shared_dict(zone_name) {
    Error(_) -> {
      let _ = http.log(r, "ratelimit: " <> zone_name <> " zone not found")
      "0"
    }
    Ok(dict) -> do_ratelimit(r, dict)
  }
}

fn do_ratelimit(r: HTTPRequest, dict: shared_dict.SharedDict) -> String {
  let key = get_variable_or(r, "rl_key", http.remote_address(r))
  let window = get_variable_int(r, "rl_windows_ms", 60_000)
  let limit = get_variable_int(r, "rl_limit", 10)
  let now = now_ms()

  let _ =
    http.log(
      r,
      "ratelimit: key="
        <> key
        <> " window="
        <> int.to_string(window)
        <> " limit="
        <> int.to_string(limit),
    )

  let raw_data = shared_dict.get(dict, key)
  case is_undefined(raw_data) {
    True -> {
      let new_data = encode_data(now, 1)
      let _ = shared_dict.set(dict, key, new_data, 0)
      "0"
    }
    False -> {
      case parse_rate_data(raw_data) {
        Error(_) -> {
          let new_data = encode_data(now, 1)
          let _ = shared_dict.set(dict, key, new_data, 0)
          "0"
        }
        Ok(#(timestamp, count)) -> {
          let #(new_timestamp, new_count) = case now - timestamp >= window {
            True -> #(now, 1)
            False -> #(timestamp, count + 1)
          }

          let elapsed = now - new_timestamp
          let retry_after = case new_count > limit {
            True -> { window - elapsed } / 1000
            False -> 0
          }

          let new_data = encode_data(new_timestamp, new_count)
          let _ = shared_dict.set(dict, key, new_data, 0)
          int.to_string(retry_after)
        }
      }
    }
  }
}

fn encode_data(timestamp: Int, count: Int) -> String {
  "{\"timestamp\":"
  <> int.to_string(timestamp)
  <> ",\"count\":"
  <> int.to_string(count)
  <> "}"
}

@external(javascript, "../../http_ffi.mjs", "get_variable")
fn get_variable(r: HTTPRequest, name: String) -> String

@external(javascript, "../../http_ffi.mjs", "get_variable_or")
fn get_variable_or(r: HTTPRequest, name: String, default: String) -> String

@external(javascript, "../../http_ffi.mjs", "get_variable_int")
fn get_variable_int(r: HTTPRequest, name: String, default: Int) -> Int

@external(javascript, "../../http_ffi.mjs", "now_ms")
fn now_ms() -> Int

@external(javascript, "../../http_ffi.mjs", "is_undefined")
fn is_undefined(a: a) -> Bool

@external(javascript, "../../http_ffi.mjs", "parse_rate_data")
fn parse_rate_data(data: a) -> Result(#(Int, Int), Nil)

pub fn exports() -> JsObject {
  ngx.object()
  |> ngx.merge("ratelimit", ratelimit)
}
