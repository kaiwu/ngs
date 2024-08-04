import app/misc
import njs/ngx.{type JsObject}

pub fn exports() -> JsObject {
  ngx.object()
  |> ngx.merge("version", misc.version)
  |> ngx.merge("decode_uri", misc.decode_uri)
  |> ngx.merge("hello", misc.hello)
  |> ngx.merge("join", misc.join)
}
