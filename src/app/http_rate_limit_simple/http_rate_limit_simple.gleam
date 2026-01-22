//// Simple Rate Limiting - Sliding window rate limiter using shared dict
//// Reference: https://github.com/nginx/njs-examples/blob/master/njs/http/rate-limit/simple.js
////
//// Uses js_shared_dict_zone to track request counts per client IP.
//// Returns retry-after value (seconds) if rate limit exceeded, "0" otherwise.

import njs/http.{type HTTPRequest}
import njs/ngx.{type JsObject}

fn ratelimit(r: HTTPRequest) -> Nil {
  // TODO: implement
  r
  |> http.return_text(200, "TODO")
}

pub fn exports() -> JsObject {
  ngx.object()
  |> ngx.merge("ratelimit", ratelimit)
}
