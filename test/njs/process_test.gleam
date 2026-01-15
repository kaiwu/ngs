import njs/process

pub fn module_test() {
  let _ = process.argv
  let _ = process.env
  let _ = process.kill
  let _ = process.pid
  let _ = process.ppid
}
