import app/misc
import njs/ngx.{type JsObject}

pub fn exports() -> JsObject {
  ngx.object()
  |> ngx.export(misc.version)
  |> ngx.export(misc.decode_uri)
  |> ngx.export(misc.hello)
  |> ngx.export(misc.join)
}
