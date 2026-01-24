import gleam/dynamic/decode
import gleam/json
import gleam/list
import gleam/string
import njs/fs
import njs/http.{type HTTPRequest}
import njs/ngx.{type JsObject}

const db_path = "/tmp/njs_resolv.db"

type RedirectRule {
  RedirectRule(from: String, to: String)
}

fn decode_rule(body: String) -> Result(RedirectRule, String) {
  let decoder = {
    use from <- decode.field("from", decode.string)
    use to <- decode.field("to", decode.string)
    decode.success(RedirectRule(from: from, to: to))
  }

  case json.parse(body, decoder) {
    Ok(rule) -> Ok(rule)
    Error(_) ->
      Error(
        "invalid request: expected format: {\"from\": \"/uri\", \"to\": \"/mapped_uri\"}",
      )
  }
}

fn load_rules() -> List(RedirectRule) {
  let option = fs.ReadFileOption(encoding: fs.utf8, flag: fs.flag_r)

  case fs.exists_sync(db_path) {
    True -> {
      let data = fs.read_file_sync(db_path, option)
      case string.is_empty(data) {
        True -> []
        False -> {
          let decoder = decode.list(of: decode_rule_decoder())
          case json.parse(data, decoder) {
            Ok(rules) -> rules
            Error(_) -> []
          }
        }
      }
    }
    False -> []
  }
}

fn decode_rule_decoder() -> decode.Decoder(RedirectRule) {
  let decoder = {
    use from <- decode.field("from", decode.string)
    use to <- decode.field("to", decode.string)
    decode.success(RedirectRule(from: from, to: to))
  }

  decoder
}

fn persist_rules(rules: List(RedirectRule)) -> Nil {
  let json_rules =
    json.array(rules, fn(rule) {
      json.object([
        #("from", json.string(rule.from)),
        #("to", json.string(rule.to)),
      ])
    })
    |> json.to_string

  let option = fs.WriteFileOption(mode: 0o666, flag: fs.flag_w)
  fs.write_file_sync(db_path, json_rules, option)
}

fn map_rules(r: HTTPRequest) -> Nil {
  let rules = load_rules()
  let json_rules =
    json.array(rules, fn(rule) {
      json.object([
        #("from", json.string(rule.from)),
        #("to", json.string(rule.to)),
      ])
    })
    |> json.to_string

  http.return_text(r, 200, json_rules)
}

fn resolv(r: HTTPRequest) -> Nil {
  let rules = load_rules()
  let uri = http.uri(r)
  let mapped = case list.find(rules, fn(rule) { rule.from == uri }) {
    Ok(rule) -> rule.to
    Error(_) -> uri
  }

  http.internal_redirect(r, "/proxy" <> mapped)
}

fn add_rule(r: HTTPRequest) -> Nil {
  let body = http.request_text(r)
  case decode_rule(body) {
    Ok(rule) -> {
      let rules = load_rules()
      let filtered =
        list.filter(rules, fn(existing) { existing.from != rule.from })
      let updated = [rule, ..filtered]
      persist_rules(updated)
      http.return_code(r, 200)
    }
    Error(reason) -> http.return_text(r, 400, reason)
  }
}

fn remove_rule(r: HTTPRequest) -> Nil {
  let body = http.request_text(r)
  let decoder = {
    use from <- decode.field("from", decode.string)
    decode.success(from)
  }

  case json.parse(body, decoder) {
    Ok(from) -> {
      let rules = load_rules()
      let updated = list.filter(rules, fn(rule) { rule.from != from })
      persist_rules(updated)
      http.return_code(r, 200)
    }
    Error(_) ->
      http.return_text(
        r,
        400,
        "invalid request: expected format: { \"from\": \"/uri\" }",
      )
  }
}

pub fn exports() -> JsObject {
  ngx.object()
  |> ngx.merge("resolv", resolv)
  |> ngx.merge("map", map_rules)
  |> ngx.merge("add", add_rule)
  |> ngx.merge("remove", remove_rule)
}
