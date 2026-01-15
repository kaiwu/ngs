import njs/response

pub fn module_test() {
  let _ = response.from_string
  let _ = response.from_buffer
  let _ = response.empty
  let _ = response.has_body
  let _ = response.headers
  let _ = response.status
  let _ = response.status_text
  let _ = response.url
  let _ = response.array_buffer
  let _ = response.json
  let _ = response.text
  let _ = response.is_ok
  let _ = response.is_redirected
  let _ = response.type_prop
}
