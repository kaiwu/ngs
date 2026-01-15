pub type Timeout

@external(javascript, "../timers_ffi.mjs", "set_timeout")
pub fn set_timeout(
  callback: fn(a) -> Nil,
  milliseconds: Int,
  args: b,
) -> Timeout

@external(javascript, "../timers_ffi.mjs", "clear_timeout")
pub fn clear_timeout(timeout: Timeout) -> Nil
