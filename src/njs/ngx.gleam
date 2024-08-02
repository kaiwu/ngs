import gleam/javascript/promise.{type Promise}
import njs/request.{type Request}
import njs/response.{type Response}

@external(javascript, "./ngx_ffi.mjs", "fetch")
pub fn fetch_url(resource r: String, options o: o) -> Promise(Response)

@external(javascript, "./ngx_ffi.mjs", "fetch")
pub fn fetch_request(resource r: Request, options o: o) -> Promise(Response)
