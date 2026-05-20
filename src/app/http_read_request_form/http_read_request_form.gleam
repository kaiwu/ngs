import gleam/javascript/array
import gleam/javascript/promise.{type Promise}
import gleam/list
import gleam/string
import njs/http.{type HTTPRequest, type RequestForm, FormFile, FormText}
import njs/ngx.{type JsObject}

fn render_form(form: RequestForm) -> String {
  let a = case http.form_get(form, "a") {
    Ok(FormText(v)) -> v
    Ok(FormFile(name)) -> "[file:" <> name <> "]"
    Error(_) -> "null"
  }
  let has_b = http.form_has(form, "b")
  let b_all =
    http.form_get_all(form, "b")
    |> array.to_list
    |> list.map(fn(v) {
      case v {
        FormText(s) -> s
        FormFile(name) -> "[file:" <> name <> "]"
      }
    })
    |> string.join(",")
  let has_files = http.form_has_files(form)
  let upload = case http.form_get(form, "upload") {
    Ok(FormFile(name)) -> name
    Ok(FormText(_)) -> "text"
    Error(_) -> "none"
  }
  "a="
  <> a
  <> " has_b="
  <> case has_b {
    True -> "true"
    False -> "false"
  }
  <> " b_all="
  <> b_all
  <> " has_files="
  <> case has_files {
    True -> "true"
    False -> "false"
  }
  <> " upload="
  <> upload
}

fn urlencoded(r: HTTPRequest) -> Promise(Nil) {
  use form <- promise.await(http.read_request_form(r))
  http.return_text(r, 200, render_form(form))
  promise.resolve(Nil)
}

fn multipart(r: HTTPRequest) -> Promise(Nil) {
  use form <- promise.await(http.read_request_form(r))
  http.return_text(r, 200, render_form(form))
  promise.resolve(Nil)
}

fn max_keys(r: HTTPRequest) -> Promise(Nil) {
  use form <- promise.await(http.read_request_form_with_max_keys(r, 1))
  let a = case http.form_get(form, "a") {
    Ok(FormText(v)) -> v
    _ -> "null"
  }
  let b = case http.form_get(form, "b") {
    Ok(FormText(v)) -> v
    _ -> "null"
  }
  http.return_text(r, 200, "a=" <> a <> " b=" <> b)
  promise.resolve(Nil)
}

pub fn exports() -> JsObject {
  ngx.object()
  |> ngx.merge("urlencoded", urlencoded)
  |> ngx.merge("multipart", multipart)
  |> ngx.merge("max_keys", max_keys)
}
