import gleam/javascript/promise.{type Promise}
import njs/request.{type Request}
import njs/response.{type Response}

pub type Resource {
  ResourceUrl(url: String)
  ResourceReq(request: Request)
}

@external(javascript, "./ngx_ffi.mjs", "fetch")
pub fn fetch(resource r: Resource, options o: o) -> Promise(Response)
