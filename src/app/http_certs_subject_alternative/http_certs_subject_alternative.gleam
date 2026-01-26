import njs/http.{type HTTPRequest}
import njs/ngx.{type JsObject}

fn san(r: HTTPRequest) -> Nil {
  // TODO: implement
  // Reference: submodules/njs-examples/njs/http/certs/js/subject_alternative.js
  // That implementation parses PEM via x509.js (ASN.1 parser). We do not have
  // Gleam bindings or a port for x509.js, and adding new FFI is disallowed.
  r
  |> http.return_text(200, "TODO")
}

pub fn exports() -> JsObject {
  ngx.object()
  |> ngx.merge("san", san)
}
