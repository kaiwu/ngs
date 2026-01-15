import njs/headers

pub fn module_test() {
  let _ = headers.from_string
  let _ = headers.from_headers
  let _ = headers.from_array
  let _ = headers.append
  let _ = headers.delete
  let _ = headers.get
  let _ = headers.get_all
  let _ = headers.for_each
  let _ = headers.has
  let _ = headers.set
}
