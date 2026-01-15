import njs/querystring

pub fn module_test() {
  let _ = querystring.decode
  let _ = querystring.encode
  let _ = querystring.escape
  let _ = querystring.parse
  let _ = querystring.stringify
  let _ = querystring.unescape
}
