import njs/request

pub fn module_test() {
  let _ = request.from_url
  let _ = request.from_request
  let _ = request.has_body
  let _ = request.headers
  let _ = request.method
  let _ = request.url
  let _ = request.array_buffer
  let _ = request.json
  let _ = request.text
  let _ = request.cache
  let _ = request.credentials
  let _ = request.mode
}
