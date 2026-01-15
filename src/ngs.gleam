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
  conf f: String,
  outfile o: String,
) -> Promise(Result(Nil, String))

@external(javascript, "./ngs_ffi.mjs", "bundle_watch")
pub fn bundle_watch(
  entry e: String,
  outfile o: String,
) -> Promise(Result(Nil, String))

@external(javascript, "./ngs_ffi.mjs", "copy_watch")
pub fn copy_watch(
  conf f: String,
  outfile o: String,
) -> Promise(Result(Nil, String))

type Builder =
  fn(String, String) -> Promise(Result(Nil, String))

type Asset {
  Asset(src: String, dist: String, builder: Builder)
}

type App {
  App(name: String, entry: String)
}

fn apps() -> List(App) {
  [
    App(
      "http_hello",
      "./build/dev/javascript/ngs/apps/http_hello/http_hello.mjs",
    ),
    App(
      "http_decode_uri",
      "./build/dev/javascript/ngs/apps/http_decode_uri/http_decode_uri.mjs",
    ),
    App(
      "http_complex_redirects",
      "./build/dev/javascript/ngs/apps/http_complex_redirects/http_complex_redirects.mjs",
    ),
    App(
      "http_join_subrequests",
      "./build/dev/javascript/ngs/apps/http_join_subrequests/http_join_subrequests.mjs",
    ),
    App(
      "http_subrequests_chaining",
      "./build/dev/javascript/ngs/apps/http_subrequests_chaining/http_subrequests_chaining.mjs",
    ),
    App(
      "http_authorization_jwt",
      "./build/dev/javascript/ngs/apps/http_authorization_jwt/http_authorization_jwt.mjs",
    ),
    App(
      "http_authorization_gen_hs_jwt",
      "./build/dev/javascript/ngs/apps/http_authorization_gen_hs_jwt/http_authorization_gen_hs_jwt.mjs",
    ),
    App(
      "http_authorization_request_body",
      "./build/dev/javascript/ngs/apps/http_authorization_request_body/http_authorization_request_body.mjs",
    ),
    App(
      "http_authorization_auth_request",
      "./build/dev/javascript/ngs/apps/http_authorization_auth_request/http_authorization_auth_request.mjs",
    ),
    App(
      "http_authorization_secure_link_hash",
      "./build/dev/javascript/ngs/apps/http_authorization_secure_link_hash/http_authorization_secure_link_hash.mjs",
    ),
    App(
      "http_certs_subject_alternative",
      "./build/dev/javascript/ngs/apps/http_certs_subject_alternative/http_certs_subject_alternative.mjs",
    ),
    App(
      "http_certs_dynamic",
      "./build/dev/javascript/ngs/apps/http_certs_dynamic/http_certs_dynamic.mjs",
    ),
    App(
      "http_certs_fetch_https",
      "./build/dev/javascript/ngs/apps/http_certs_fetch_https/http_certs_fetch_https.mjs",
    ),
    App(
      "http_logging_num_requests",
      "./build/dev/javascript/ngs/apps/http_logging_num_requests/http_logging_num_requests.mjs",
    ),
    App(
      "http_rate_limit_simple",
      "./build/dev/javascript/ngs/apps/http_rate_limit_simple/http_rate_limit_simple.mjs",
    ),
    App(
      "http_response_to_lower_case",
      "./build/dev/javascript/ngs/apps/http_response_to_lower_case/http_response_to_lower_case.mjs",
    ),
    App(
      "http_response_modify_set_cookie",
      "./build/dev/javascript/ngs/apps/http_response_modify_set_cookie/http_response_modify_set_cookie.mjs",
    ),
    App(
      "http_api_set_keyval",
      "./build/dev/javascript/ngs/apps/http_api_set_keyval/http_api_set_keyval.mjs",
    ),
    App(
      "http_async_var_auth_request",
      "./build/dev/javascript/ngs/apps/http_async_var_auth_request/http_async_var_auth_request.mjs",
    ),
    App(
      "http_async_var_js_header_filter",
      "./build/dev/javascript/ngs/apps/http_async_var_js_header_filter/http_async_var_js_header_filter.mjs",
    ),
    App(
      "stream_auth_request",
      "./build/dev/javascript/ngs/apps/stream_auth_request/stream_auth_request.mjs",
    ),
    App(
      "stream_detect_http",
      "./build/dev/javascript/ngs/apps/stream_detect_http/stream_detect_http.mjs",
    ),
    App(
      "stream_inject_header",
      "./build/dev/javascript/ngs/apps/stream_inject_header/stream_inject_header.mjs",
    ),
    App(
      "misc_file_io",
      "./build/dev/javascript/ngs/apps/misc_file_io/misc_file_io.mjs",
    ),
    App(
      "misc_aes_gcm",
      "./build/dev/javascript/ngs/apps/misc_aes_gcm/misc_aes_gcm.mjs",
    ),
  ]
}

const dist = "./dist/"

const src = "./src/"

fn bundle_asset(apps: List(App), watch: Bool) -> List(Asset) {
  apps
  |> list.map(fn(a) {
    case watch {
      True -> Asset(a.entry, dist <> a.name <> "/njs/app.js", bundle_watch)
      False -> Asset(a.entry, dist <> a.name <> "/njs/app.js", bundle_build)
    }
  })
}

fn conf_asset(apps: List(App), watch: Bool) -> List(Asset) {
  apps
  |> list.map(fn(a) {
    case watch {
      True ->
        Asset(
          src <> "apps/" <> a.name <> "/nginx.conf",
          dist <> a.name <> "/nginx.conf",
          copy_watch,
        )
      False ->
        Asset(
          src <> "apps/" <> a.name <> "/nginx.conf",
          dist <> a.name <> "/nginx.conf",
          copy_build,
        )
    }
  })
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

  use r0 <- promise.await(apps() |> bundle_asset(watch) |> build)
  use r1 <- promise.await(apps() |> conf_asset(watch) |> build)

  [r0, r1]
  |> list.fold(Ok(Nil), fold_result)
  |> result.map_error(fn(e) { io.println_error(e) })
  |> promise.resolve
}
