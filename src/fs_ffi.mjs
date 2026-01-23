import { default as Fs } from 'fs';
import { Ok, Error } from "./gleam.mjs"
import { FileReadResult } from "./njs/fs.mjs"

export function constants_f_ok() {
    return Fs.constants.F_OK;
}

export function constants_r_ok() {
    return Fs.constants.R_OK;
}

export function constants_w_ok() {
    return Fs.constants.W_OK;
}

export function constants_x_ok() {
    return Fs.constants.X_OK;
}

export function access_sync(p, m) {
    try {
        Fs.accessSync(p, m);
        return new Ok(true)
    } catch (e) {
        return new Error(undefined)
    }
}

export function access_async(p, m) {
    return new Promise(resolve => {
        Fs.promises.access(p, m).then(() => resolve(new Ok(true)))
            .catch((_) => resolve(new Error(undefined)))
    })
}

export function append_file_sync(fn, d, o) {
    Fs.appendFileSync(fn, d, o);
}

export function append_file_async(fn, d, o) {
    return new Promise(resolve => {
        Fs.promises.appendFile(fn, d, o).then(() => resolve(undefined))
    })
}

export function close_sync(fd) {
    Fs.closeSync(fd);
}

export function close_async(fd) {
    return new Promise(resolve => {
        Fs.promises.close(fd).then(() => resolve(undefined))
    })
}

export function exists_sync(p) {
    return Fs.existsSync(p);
}

export function exists_async(p) {
    return new Promise(resolve => {
        Fs.promises.exists(p).then((b) => resolve(b))
    })
}

export function fstat_sync(fd) {
    return Fs.fstatSync(fd);
}

export function fstat_async(fd) {
    return new Promise(resolve => {
        Fs.promises.fstat(fd).then((s) => resolve(s))
    })
}

export function lstat_sync(p) {
    try {
        var s = Fs.lstatSync(p, { throwIfNoEntry: true })
        return new Ok(s)
    } catch (e) {
        return new Error(undefined)
    }
}

export function lstat_async(p) {
    return new Promise(resolve => {
        Fs.promises.lstat(p).then((s) => resolve(new Ok(s)))
            .catch((_) => resolve(new Error(undefined)))
    })
}

export function mkdir_sync(p, o) {
    Fs.mkdirSync(p, o);
}

export function mkdir_async(p, o) {
    return new Promise(resolve => {
        Fs.promises.mkdir(p, o).then(() => resolve(undefined))
    })
}

export function open_sync(p, f, m) {
    return Fs.openSync(p, f, m);
}

export function open_async(p, f, m) {
    return new Promise(resolve => {
        Fs.promises.open(p, f, m).then((f) => resolve(f))
    })
}

export function read_dir_sync(p, e) {
    return Fs.readdirSync(p, {
        encoding: e,
        withFileTypes: true
    })
}

export function read_dir_async(p, e) {
    return new Promise(resolve => {
        Fs.promises.readdir(p, {
            encoding: e,
            withFileTypes: true
        }).then((a) => resolve(a))
    })
}

export function read_file_sync(fn, o) {
    return Fs.readFileSync(fn, o)
}

export function read_file_async(fn, o) {
    return new Promise(resolve => {
        Fs.promises.readFile(fn, o).then((a) => resolve(a))
    })
}

export function read_link_sync(p, e) {
    return Fs.readlinkSync(p, e);
}

export function read_link_async(p, e) {
    return new Promise(resolve => {
        Fs.promises.readlink(p, e).then((d) => resolve(d));
    })
}

export function read_sync(fd, o, l, p) {
    const length = l > 1024 ? l : 1024;
    const b = Buffer.alloc(length)
    var i = Fs.readSync(fd, b, o, l, p);
    return new FileReadResult(i, b)
}

export function read_async(fd, o, l, p) {
    return new Promise(resolve => {
        const length = l > 1024 ? l : 1024;
        const b = Buffer.alloc(length)
        Fs.promises.read(fd, b, o, l, p).then((i) = resolve(new FileReadResult(i, b)))
    })
}

export function real_path_sync(p, e) {
    return Fs.realpathSync(p, e);
}

export function real_path_async(p, e) {
    return new Promise(resolve => {
        Fs.promises.realpath(p, e).then((s) => resolve(s))
    })
}

export function rename_sync(op, np) {
    Fs.renameSync(op, np);
}

export function rmdir_sync(p) {
    Fs.rmdirSync(p);
}

export function stat_sync(p, o) {
    return o ? Fs.statSync(p, o) : Fs.statSync(p);
}

export function symlink_sync(t, p) {
    Fs.symlinkSync(t, p);
}

export function unlink_sync(p) {
    Fs.unlinkSync(p);
}

export function write_file_sync(fn, d, o) {
    Fs.writeFileSync(fn, d, o);
}

export function write_sync_buffer(fd, b, o, l, p) {
    return Fs.writeSync(fd, b, o, l, p);
}

export function write_sync_string(fd, s, p, e) {
    return Fs.writeSync(fd, s, p, e);
}

export function promises_open(p, f, m) {
    return new Promise(resolve => {
        Fs.promises.open(p, f, m).then(h => resolve(h))
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


