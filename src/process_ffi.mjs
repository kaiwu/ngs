export { runtime_process as process };

function runtime_process() {
  return process;
}

export function argv() {
  return process.argv;
}

export function env() {
  return process.env;
}

export function kill(pid, signal) {
  process.kill(pid, signal);
}

export function pid() {
  return process.pid;
}

export function ppid() {
  return process.ppid;
}
