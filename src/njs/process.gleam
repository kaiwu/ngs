import gleam/javascript/array.{type Array}

pub type Process

pub type Env

@external(javascript, "../process_ffi.mjs", "process")
pub fn process() -> Process

@external(javascript, "../process_ffi.mjs", "argv")
pub fn argv() -> Array(String)

@external(javascript, "../process_ffi.mjs", "env")
pub fn env() -> Env

pub type Signal

@external(javascript, "../process_ffi.mjs", "kill")
pub fn kill(pid: Int, signal: Signal) -> Nil

@external(javascript, "../process_ffi.mjs", "pid")
pub fn pid() -> Int

@external(javascript, "../process_ffi.mjs", "ppid")
pub fn ppid() -> Int
