//// Request Counting - Tracks number of requests per client IP
//// Reference: https://github.com/nginx/njs-examples/blob/master/njs/http/logging/num_requests.js
////
//// Uses shared dict to maintain per-IP request counts.
//// Note: Uses js_shared_dict_zone (open-source) instead of keyval_zone (nginx Plus).

import gleam/int
import njs/http.{type HTTPRequest}
import njs/ngx.{type JsObject}
import njs/shared_dict

fn num_requests(r: HTTPRequest) -> String {
  let ip = http.remote_address(r)
  case ngx.get_shared_dict("requests") {
    Error(_) -> "0"
    Ok(dict) -> {
      let count = shared_dict.incr(dict, ip, 1, 0, 0)
      int.to_string(count)
    }
  }
}

pub fn exports() -> JsObject {
  ngx.object()
  |> ngx.merge("num_requests", num_requests)
}
