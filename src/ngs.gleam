import envoy
import gleam/io
import gleam/javascript/promise.{type Promise}
import gleam/list
import gleam/result

@external(javascript, "./ngs_ffi.mjs", "bundle_build")
pub fn bundle_build(
  entry e: String,
  outfile o: String,
) -> Promise(Result(Nil, String))

@external(javascript, "./ngs_ffi.mjs", "copy_build")
pub fn copy_build(
  sql f: String,
  outfile o: String,
) -> Promise(Result(Nil, String))

@external(javascript, "./ngs_ffi.mjs", "bundle_watch")
pub fn bundle_watch(
  entry e: String,
  outfile o: String,
) -> Promise(Result(Nil, String))

@external(javascript, "./ngs_ffi.mjs", "copy_watch")
pub fn copy_watch(
  sql f: String,
  outfile o: String,
) -> Promise(Result(Nil, String))

type Builder =
  fn(String, String) -> Promise(Result(Nil, String))

type Asset {
  Asset(src: String, dist: String, builder: Builder)
}

const entry = "./build/dev/javascript/ngs/app/misc.mjs"

const dist = "./dist/nginx/"

// const src = "./src/"

fn bundle_asset(watch: Bool) -> List(Asset) {
  case watch {
    True -> [Asset(entry, dist <> "njs/app.js", bundle_watch)]
    False -> [Asset(entry, dist <> "njs/app.js", bundle_build)]
  }
}

fn fold_result(
  r0: Result(Nil, String),
  r: Result(Nil, String),
) -> Result(Nil, String) {
  case r0, r {
    Ok(Nil), Ok(Nil) -> r0
    Error(_), Ok(Nil) -> r0
    Ok(Nil), Error(_) -> r
    Error(e1), Error(e2) -> Error(e1 <> "\n\n" <> e2)
  }
}

fn build(ass: List(Asset)) -> Promise(Result(Nil, String)) {
  ass
  |> list.map(fn(a) { a.builder(a.src, a.dist) })
  |> promise.await_list
  |> promise.map(fn(ls) {
    ls
    |> list.fold(Ok(Nil), fold_result)
  })
}

pub fn main() {
  let watch =
    envoy.get("NJS_BUILD_WATCH")
    |> result.is_ok

  use r0 <- promise.await(bundle_asset(watch) |> build)

  [r0]
  |> list.fold(Ok(Nil), fold_result)
  |> result.map_error(fn(e) { io.println_error(e) })
  |> promise.resolve
}
