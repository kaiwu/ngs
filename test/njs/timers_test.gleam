import njs/timers

pub fn module_test() {
  let _ = timers.set_timeout
  let _ = timers.set_immediate
  let _ = timers.clear_timeout
}
