import fs from 'fs';

export function access_sync(p, m) {
  fs.accessSync(p, m);
}

export function append_file_sync(fn, d, o) {
  fs.appendFileSync(fn, d, o);
}

export function close_sync(fd) {
  fs.closeSync(fd);
}

export function exists_sync(p) {
  return fs.existsSync(p);
}

export function fstat_sync(fd) {
  return fs.fstatSync(fd);
}

export function lstat_sync(p, o) {
  return o ? fs.lstatSync(p, o) : fs.lstatSync(p);
}

export function mkdir_sync(p, o) {
  fs.mkdirSync(p, o);
}

export function open_sync(p, f, m) {
  return fs.openSync(p, f, m);
}

export function read_dir_sync(p, o) {
  return o ? fs.readdirSync(p, o) : fs.readdirSync(p);
}

export function read_file_sync(fn, o) {
  return o ? fs.readFileSync(fn, o) : fs.readFileSync(fn);
}

export function read_link_sync(p, e) {
  return fs.readlinkSync(p, e);
}

export function read_sync(fd, b, o, l, p) {
  return fs.readSync(fd, b, o, l, p);
}

export function real_path_sync(p, e) {
  return fs.realpathSync(p, e);
}

export function rename_sync(op, np) {
  fs.renameSync(op, np);
}

export function rmdir_sync(p) {
  fs.rmdirSync(p);
}

export function stat_sync(p, o) {
  return o ? fs.statSync(p, o) : fs.statSync(p);
}

export function symlink_sync(t, p) {
  fs.symlinkSync(t, p);
}

export function unlink_sync(p) {
  fs.unlinkSync(p);
}

export function write_file_sync(fn, d, o) {
  fs.writeFileSync(fn, d, o);
}

export function write_sync_buffer(fd, b, o, l, p) {
  return fs.writeSync(fd, b, o, l, p);
}

export function write_sync_string(fd, s, p, e) {
  return fs.writeSync(fd, s, p, e);
}

export function promises_open(p, f, m) {
  return new Promise(resolve => {
    fs.promises.open(p, f, m).then(h => resolve(h))
  })
}

export function file_handle_close(h) {
  return new Promise(resolve => {
    h.close().then(() => resolve(undefined))
  })
}

export function file_handle_fd(h) {
  return h.fd;
}

export function file_handle_read(h, b, o, l, p) {
  return new Promise(resolve => {
    h.read(b, o, l, p).then(r => resolve(r))
  })
}

export function file_handle_stat(h) {
  return new Promise(resolve => {
    h.stat().then(s => resolve(s))
  })
}

export function file_handle_write_buffer(h, b, o, l, p) {
  return new Promise(resolve => {
    h.write(b, o, l, p).then(r => resolve(r))
  })
}

export function file_handle_write_string(h, s, p, e) {
  return new Promise(resolve => {
    h.write(s, p, e).then(r => resolve(r))
  })
}

export function dirent_is_block_device(d) {
  return d.isBlockDevice();
}

export function dirent_is_character_device(d) {
  return d.isCharacterDevice();
}

export function dirent_is_directory(d) {
  return d.isDirectory();
}

export function dirent_is_fifo(d) {
  return d.isFIFO();
}

export function dirent_is_file(d) {
  return d.isFile();
}

export function dirent_is_socket(d) {
  return d.isSocket();
}

export function dirent_is_symbolic_link(d) {
  return d.isSymbolicLink();
}

export function dirent_name(d) {
  return d.name;
}

export function stats_is_block_device(s) {
  return s.isBlockDevice();
}

export function stats_is_directory(s) {
  return s.isDirectory();
}

export function stats_is_fifo(s) {
  return s.isFIFO();
}

export function stats_is_file(s) {
  return s.isFile();
}

export function stats_is_socket(s) {
  return s.isSocket();
}

export function stats_is_symbolic_link(s) {
  return s.isSymbolicLink();
}

export function stats_dev(s) {
  return s.dev;
}

export function stats_ino(s) {
  return s.ino;
}

export function stats_mode(s) {
  return s.mode;
}

export function stats_nlink(s) {
  return s.nlink;
}

export function stats_uid(s) {
  return s.uid;
}

export function stats_gid(s) {
  return s.gid;
}

export function stats_rdev(s) {
  return s.rdev;
}

export function stats_size(s) {
  return s.size;
}

export function stats_blksize(s) {
  return s.blksize;
}

export function stats_blocks(s) {
  return s.blocks;
}

export function stats_atime_ms(s) {
  return s.atimeMs;
}

export function stats_mtime_ms(s) {
  return s.mtimeMs;
}

export function stats_ctime_ms(s) {
  return s.ctimeMs;
}

export function stats_birthtime_ms(s) {
  return s.birthtimeMs;
}

export function stats_atime(s) {
  return s.atime;
}

export function stats_mtime(s) {
  return s.mtime;
}

export function stats_ctime(s) {
  return s.ctime;
}

export function stats_birthtime(s) {
  return s.birthtime;
}

export function constants_f_ok() {
  return fs.constants.F_OK;
}

export function constants_r_ok() {
  return fs.constants.R_OK;
}

export function constants_w_ok() {
  return fs.constants.W_OK;
}

export function constants_x_ok() {
  return fs.constants.X_OK;
}
