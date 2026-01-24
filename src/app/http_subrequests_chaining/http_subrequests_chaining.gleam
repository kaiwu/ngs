import gleam/javascript/promise
import njs/http.{type HTTPRequest}
import njs/ngx.{type JsObject}

fn chain(r: HTTPRequest) -> promise.Promise(Nil) {
  use res1 <- promise.await(http.subrequest(r, "/step1", ""))
  let body1 = http.response_text(res1)

  use res2 <- promise.await(http.subrequest(r, "/step2", body1))
  let body2 = http.response_text(res2)

  let combined = body1 <> ":" <> body2

  http.return_text(r, 200, combined)
  |> promise.resolve
}

fn step1(r: HTTPRequest) -> promise.Promise(Nil) {
  http.return_text(r, 200, "one")
  |> promise.resolve
}

fn step2(r: HTTPRequest) -> promise.Promise(Nil) {
  http.return_text(r, 200, "one-two")
  |> promise.resolve
}

pub fn exports() -> JsObject {
  ngx.object()
  |> ngx.merge("chain", chain)
  |> ngx.merge("step1", step1)
  |> ngx.merge("step2", step2)
}
