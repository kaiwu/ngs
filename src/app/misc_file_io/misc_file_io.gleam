import njs/fs
import njs/http.{type HTTPRequest}
import njs/ngx.{type JsObject}

const storage_path = "/tmp/njs_storage"

fn push(r: HTTPRequest) -> Nil {
  let option = fs.WriteFileOption(mode: 0o666, flag: fs.flag_a)
  let _ = fs.append_file_sync(storage_path, http.request_text(r), option)
  http.return_text(r, 200, "")
}

fn flush(r: HTTPRequest) -> Nil {
  let option = fs.WriteFileOption(mode: 0o666, flag: fs.flag_w)
  let _ = fs.write_file_sync(storage_path, "", option)
  http.return_text(r, 200, "")
}

fn read(r: HTTPRequest) -> Nil {
  let option = fs.ReadFileOption(encoding: fs.utf8, flag: fs.flag_r)
  fs.read_file_sync(storage_path, option)
  |> http.return_text(r, 200, _)
}

pub fn exports() -> JsObject {
  ngx.object()
  |> ngx.merge("push", push)
  |> ngx.merge("flush", flush)
  |> ngx.merge("read", read)
}
