@external(javascript, "../console_ffi.mjs", "error")
pub fn error(msg: a) -> Nil

@external(javascript, "../console_ffi.mjs", "info")
pub fn info(msg: a) -> Nil

@external(javascript, "../console_ffi.mjs", "log")
pub fn log(msg: a) -> Nil

@external(javascript, "../console_ffi.mjs", "time")
pub fn time(label: String) -> Nil

@external(javascript, "../console_ffi.mjs", "time_end")
pub fn time_end(label: String) -> Nil

@external(javascript, "../console_ffi.mjs", "warn")
pub fn warn(msg: a) -> Nil
