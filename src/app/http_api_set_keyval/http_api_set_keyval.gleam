import gleam/int
import gleam/string
import njs/http.{type HTTPRequest}
import njs/ngx.{type JsObject}
import njs/shared_dict

const dict_name = "kv"

const ttl_seconds = 3600

fn set_keyval(r: HTTPRequest) -> Nil {
  let args = http.args(r)
  let method_arg = get_arg_string(args, "method")
  let method = case method_arg {
    "" -> string.uppercase(http.method(r))
    m -> string.uppercase(m)
  }

  case shared_dict.get_shared_dict(dict_name) {
    Error(_) -> http.return_text(r, 500, "shared dict missing\n")
    Ok(dict) -> handle_method(r, dict, method, args)
  }
}

fn handle_method(
  r: HTTPRequest,
  dict: shared_dict.SharedDict,
  method: String,
  args: JsObject,
) -> Nil {
  case method {
    "POST" -> handle_create(r, dict, args)
    "PATCH" -> handle_update(r, dict, args)
    "DELETE" -> handle_delete(r, dict, args)
    "GET" -> handle_get(r, dict, args)
    _ -> http.return_text(r, 405, "method not allowed\n")
  }
}

fn handle_create(
  r: HTTPRequest,
  dict: shared_dict.SharedDict,
  args: JsObject,
) -> Nil {
  let key = get_arg_string(args, "key")
  let value = get_arg_string(args, "value")

  case key, value {
    "", _ -> http.return_text(r, 400, "missing key\n")
    _, "" -> http.return_text(r, 400, "missing value\n")
    _, _ -> {
      case shared_dict.has(dict, key) {
        True -> http.return_text(r, 409, "exists\n")
        False -> {
          let _ =
            shared_dict.set(
              dict,
              key,
              shared_dict.ItemString(value),
              ttl_seconds,
            )
          http.return_text(r, 201, "created\n")
        }
      }
    }
  }
}

fn handle_update(
  r: HTTPRequest,
  dict: shared_dict.SharedDict,
  args: JsObject,
) -> Nil {
  let key = get_arg_string(args, "key")
  let value = get_arg_string(args, "value")

  case key, value {
    "", _ -> http.return_text(r, 400, "missing key\n")
    _, "" -> http.return_text(r, 400, "missing value\n")
    _, _ -> {
      case shared_dict.has(dict, key) {
        False -> http.return_text(r, 404, "not found\n")
        True -> {
          let _ =
            shared_dict.set(
              dict,
              key,
              shared_dict.ItemString(value),
              ttl_seconds,
            )
          http.return_text(r, 200, "updated\n")
        }
      }
    }
  }
}

fn handle_delete(
  r: HTTPRequest,
  dict: shared_dict.SharedDict,
  args: JsObject,
) -> Nil {
  let key = get_arg_string(args, "key")

  case key {
    "" -> http.return_text(r, 400, "missing key\n")
    _ -> {
      case shared_dict.delete(dict, key) {
        True -> http.return_text(r, 200, "deleted\n")
        False -> http.return_text(r, 404, "not found\n")
      }
    }
  }
}

fn handle_get(
  r: HTTPRequest,
  dict: shared_dict.SharedDict,
  args: JsObject,
) -> Nil {
  let key = get_arg_string(args, "key")

  case key {
    "" -> http.return_text(r, 400, "missing key\n")
    _ -> {
      case shared_dict.has(dict, key) {
        False -> http.return_text(r, 404, "not found\n")
        True -> {
          case shared_dict.get(dict, key) {
            shared_dict.ItemString(value) ->
              http.return_text(r, 200, value <> "\n")
            shared_dict.ItemInt(value) ->
              http.return_text(r, 200, int.to_string(value) <> "\n")
            shared_dict.ItemNumber(value) ->
              http.return_text(r, 200, ngx.to_string(value) <> "\n")
          }
        }
      }
    }
  }
}

fn get_arg_string(args: JsObject, key: String) -> String {
  case ngx.get(args, key) {
    Error(_) -> ""
    Ok(value) -> ngx.to_string(value)
  }
}

pub fn exports() -> JsObject {
  ngx.object()
  |> ngx.merge("set_keyval", set_keyval)
}
