//// Simple Rate Limiting - Sliding window rate limiter using shared dict
//// Reference: https://github.com/nginx/njs-examples/blob/master/njs/http/rate-limit/simple.js
////
//// Uses js_shared_dict_zone to track request counts per client IP.
//// Returns retry-after value (seconds) if rate limit exceeded, "0" otherwise.

import gleam/int
import gleam/result
import gleam/string
import njs/http.{type HTTPRequest}
import njs/ngx.{type JsObject}
import njs/shared_dict.{type SharedDict}

fn ratelimit(r: HTTPRequest) -> String {
  let vars = http.get_variables(r)
  let zone_name = get_var_string(vars, "rl_zone_name")

  case zone_name, shared_dict.get_shared_dict(zone_name) {
    "", _ -> {
      let _ = http.log(r, "ratelimit: rl_zone_name not set")
      "0"
    }
    _, Error(_) -> {
      let _ = http.log(r, "ratelimit: " <> zone_name <> " zone not found")
      "0"
    }
    _, Ok(dict) -> do_ratelimit(r, dict, vars)
  }
}

fn do_ratelimit(r: HTTPRequest, dict: SharedDict, vars: JsObject) -> String {
  let key_var = get_var_string(vars, "rl_key")
  let key = case key_var {
    "" -> http.remote_address(r)
    k -> k
  }
  let window = get_var_int(vars, "rl_windows_ms", 60_000)
  let limit = get_var_int(vars, "rl_limit", 10)
  let now = ngx.now()

  case shared_dict.has(dict, key) {
    False -> {
      let data = encode_data(now, 1)
      let _ = shared_dict.set(dict, key, shared_dict.ItemString(data), 3600)
      "0"
    }
    True -> {
      case shared_dict.get(dict, key) {
        shared_dict.ItemString(raw) -> {
          process_existing(dict, key, raw, now, window, limit)
        }
        _ -> panic as "not possible"
      }
    }
  }
}

fn process_existing(
  dict: SharedDict,
  key: String,
  raw: String,
  now: Int,
  window: Int,
  limit: Int,
) -> String {
  case decode_data(raw) {
    Error(_) -> panic as "not possible"
    Ok(#(timestamp, count)) -> {
      let #(new_ts, new_count) = case now - timestamp >= window {
        True -> #(now, 1)
        False -> #(timestamp, count + 1)
      }
      let elapsed = now - new_ts
      let remaining_ms = window - elapsed
      let retry_after = case new_count > limit {
        // Ensure at least 1 second when rate limited
        True -> int.max(1, remaining_ms / 1000)
        False -> 0
      }

      let data = encode_data(new_ts, new_count)
      let _ = shared_dict.set(dict, key, shared_dict.ItemString(data), 3600)
      int.to_string(retry_after)
    }
  }
}

fn encode_data(timestamp: Int, count: Int) -> String {
  int.to_string(timestamp) <> ":" <> int.to_string(count)
}

fn decode_data(raw: String) -> Result(#(Int, Int), Nil) {
  case string.split_once(raw, ":") {
    Error(_) -> Error(Nil)
    Ok(#(ts_str, count_str)) -> {
      use ts <- result.try(int.parse(ts_str))
      use count <- result.try(int.parse(count_str))
      Ok(#(ts, count))
    }
  }
}

fn get_var_string(vars: JsObject, key: String) -> String {
  case ngx.get(vars, key) {
    Error(_) -> ""
    Ok(val) -> ngx.to_string(val)
  }
}

fn get_var_int(vars: JsObject, key: String, default: Int) -> Int {
  case ngx.get(vars, key) {
    Error(_) -> default
    Ok(val) -> {
      case int.parse(ngx.to_string(val)) {
        Error(_) -> default
        Ok(n) -> n
      }
    }
  }
}

pub fn exports() -> JsObject {
  ngx.object()
  |> ngx.merge("ratelimit", ratelimit)
}
