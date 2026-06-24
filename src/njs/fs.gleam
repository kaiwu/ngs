import gleam/javascript/array.{type Array}
import gleam/javascript/promise.{type Promise}
import njs/buffer.{type Buffer}

pub type Stats

pub type Dirent

pub type FileHandle

pub type Constants

pub type Promises

pub const utf8 = "utf8"

pub const buf = "buffer"

pub const hex = "hex"

pub const base64 = "base64"

pub const base64url = "base64url"

pub const flag_a = "a"

pub const flag_ax = "ax"

pub const flag_aplus = "a+"

pub const flag_axplus = "ax+"

pub const flag_as = "as"

pub const flag_asplus = "as+"

pub const flag_r = "r"

pub const flag_rs = "rs"

pub const flag_rplus = "r+"

pub const flag_rsplus = "rs+"

pub const flag_w = "w"

pub const flag_wx = "wx"

pub const flag_wplus = "w+"

pub const flag_wxplus = "wx+"

pub type FileOption {
  ReadFileOption(encoding: String, flag: String)
  WriteFileOption(mode: Int, flag: String)
}

pub type FileReadResult {
  FileReadResult(bytes_read: Int, buffer: Buffer)
}

@external(javascript, "../fs_ffi.mjs", "constants")
pub fn constants() -> Constants

@external(javascript, "../fs_ffi.mjs", "constants_f_ok")
pub fn constants_f_ok() -> Int

@external(javascript, "../fs_ffi.mjs", "constants_r_ok")
pub fn constants_r_ok() -> Int

@external(javascript, "../fs_ffi.mjs", "constants_w_ok")
pub fn constants_w_ok() -> Int

@external(javascript, "../fs_ffi.mjs", "constants_x_ok")
pub fn constants_x_ok() -> Int

@external(javascript, "../fs_ffi.mjs", "promises")
pub fn promises() -> Promises

@external(javascript, "../fs_ffi.mjs", "access_sync")
pub fn access_sync(path: String, mode: Int) -> Result(Bool, Nil)

@external(javascript, "../fs_ffi.mjs", "access_async")
pub fn access(path: String, mode: Int) -> Promise(Result(Bool, Nil))

@external(javascript, "../fs_ffi.mjs", "append_file_sync")
pub fn append_file_sync(
  filename f: String,
  data d: a,
  option o: FileOption,
) -> Nil

@external(javascript, "../fs_ffi.mjs", "append_file_async")
pub fn append_file(
  filename f: String,
  data d: a,
  option o: FileOption,
) -> Promise(Nil)

@external(javascript, "../fs_ffi.mjs", "close_sync")
pub fn close_sync(fd: Int) -> Nil

@external(javascript, "../fs_ffi.mjs", "close_async")
pub fn close(fd: Int) -> Promise(Nil)

@external(javascript, "../fs_ffi.mjs", "exists_sync")
pub fn exists_sync(path: String) -> Bool

@external(javascript, "../fs_ffi.mjs", "exists_async")
pub fn exists(path: String) -> Promise(Bool)

@external(javascript, "../fs_ffi.mjs", "fstat_sync")
pub fn fstat_sync(fd: Int) -> Stats

@external(javascript, "../fs_ffi.mjs", "fstat_async")
pub fn fstat(fd: Int) -> Promise(Stats)

@external(javascript, "../fs_ffi.mjs", "lstat_sync")
pub fn lstat_sync(path: String) -> Result(Stats, Nil)

@external(javascript, "../fs_ffi.mjs", "lstat_async")
pub fn lstat(path: String) -> Promise(Result(Stats, Nil))

@external(javascript, "../fs_ffi.mjs", "mkdir_sync")
pub fn mkdir_sync(path: String, mode: Int) -> Nil

@external(javascript, "../fs_ffi.mjs", "mkdir_async")
pub fn mkdir(path: String, mode: Int) -> Promise(Nil)

@external(javascript, "../fs_ffi.mjs", "open_sync")
pub fn open_sync(path: String, flags: String, mode: Int) -> Int

@external(javascript, "../fs_ffi.mjs", "open_async")
pub fn open(path: String, flags: String, mode: Int) -> Promise(FileHandle)

@external(javascript, "../fs_ffi.mjs", "read_dir_sync")
pub fn read_dir_sync(path p: String, encoding e: String) -> Array(Dirent)

@external(javascript, "../fs_ffi.mjs", "read_dir_async")
pub fn read_dir(path p: String, encoding e: String) -> Promise(Array(Dirent))

@external(javascript, "../fs_ffi.mjs", "read_file_sync")
pub fn read_file_sync(filename f: String, option o: FileOption) -> String

@external(javascript, "../fs_ffi.mjs", "read_file_async")
pub fn read_file(filename f: String, option o: FileOption) -> Promise(String)

@external(javascript, "../fs_ffi.mjs", "read_link_sync")
pub fn read_link_sync(path: String, encoding: String) -> a

@external(javascript, "../fs_ffi.mjs", "read_link_async")
pub fn read_link(path: String, encoding: String) -> Promise(a)

@external(javascript, "../fs_ffi.mjs", "read_sync")
pub fn read_sync(fd d: Int, length l: Int, position p: Int) -> FileReadResult

@external(javascript, "../fs_ffi.mjs", "read_async")
pub fn read(
  fd d: Int,
  length l: Int,
  position p: Int,
) -> Promise(FileReadResult)

@external(javascript, "../fs_ffi.mjs", "real_path_sync")
pub fn real_path_sync(path: String, encoding: String) -> String

@external(javascript, "../fs_ffi.mjs", "real_path_async")
pub fn real_path(path: String, encoding: String) -> Promise(String)

@external(javascript, "../fs_ffi.mjs", "rename_sync")
pub fn rename_sync(old_path: String, new_path: String) -> Nil

@external(javascript, "../fs_ffi.mjs", "rename_async")
pub fn rename(old_path: String, new_path: String) -> Promise(Nil)

@external(javascript, "../fs_ffi.mjs", "rmdir_sync")
pub fn rmdir_sync(path: String) -> Nil

@external(javascript, "../fs_ffi.mjs", "rmdir_async")
pub fn rmdir(path: String) -> Promise(Nil)

@external(javascript, "../fs_ffi.mjs", "stat_sync")
pub fn stat_sync(path: String) -> Result(Stats, Nil)

@external(javascript, "../fs_ffi.mjs", "stat_async")
pub fn stat(path: String) -> Promise(Result(Stats, Nil))

@external(javascript, "../fs_ffi.mjs", "symlink_sync")
pub fn symlink_sync(target: String, path: String) -> Nil

@external(javascript, "../fs_ffi.mjs", "symlink_async")
pub fn symlink(target: String, path: String) -> Promise(Nil)

@external(javascript, "../fs_ffi.mjs", "unlink_sync")
pub fn unlink_sync(path: String) -> Nil

@external(javascript, "../fs_ffi.mjs", "unlink_async")
pub fn unlink(path: String) -> Promise(Nil)

@external(javascript, "../fs_ffi.mjs", "write_file_sync")
pub fn write_file_sync(
  filename f: String,
  data d: a,
  option o: FileOption,
) -> Nil

@external(javascript, "../fs_ffi.mjs", "write_file_async")
pub fn write_file(
  filename f: String,
  data d: a,
  option o: FileOption,
) -> Promise(Nil)

@external(javascript, "../fs_ffi.mjs", "write_sync")
pub fn write_sync(
  fd: Int,
  buffer: Buffer,
  offset: Int,
  length: Int,
  position: Int,
) -> Int

@external(javascript, "../fs_ffi.mjs", "write_async")
pub fn write(
  fd: Int,
  buffer: Buffer,
  offset: Int,
  length: Int,
  position: Int,
) -> Promise(Int)

@external(javascript, "../fs_ffi.mjs", "file_handle_close")
pub fn file_handle_close(handle: FileHandle) -> Promise(Nil)

@external(javascript, "../fs_ffi.mjs", "file_handle_fd")
pub fn file_handle_fd(handle: FileHandle) -> Int

@external(javascript, "../fs_ffi.mjs", "file_handle_value_of")
pub fn file_handle_value_of(handle: FileHandle) -> Int

@external(javascript, "../fs_ffi.mjs", "file_handle_read")
pub fn file_handle_read(
  handle: FileHandle,
  length: Int,
  position: Int,
) -> Promise(FileReadResult)

@external(javascript, "../fs_ffi.mjs", "file_handle_stat")
pub fn file_handle_stat(handle: FileHandle) -> Promise(Stats)

@external(javascript, "../fs_ffi.mjs", "file_handle_write")
pub fn file_handle_write(
  handle: FileHandle,
  buffer: Buffer,
  offset: Int,
  length: Int,
  position: Int,
) -> Promise(FileReadResult)

@external(javascript, "../fs_ffi.mjs", "dirent_is_block_device")
pub fn dirent_is_block_device(dirent: Dirent) -> Bool

@external(javascript, "../fs_ffi.mjs", "dirent_is_character_device")
pub fn dirent_is_character_device(dirent: Dirent) -> Bool

@external(javascript, "../fs_ffi.mjs", "dirent_is_directory")
pub fn dirent_is_directory(dirent: Dirent) -> Bool

@external(javascript, "../fs_ffi.mjs", "dirent_is_fifo")
pub fn dirent_is_fifo(dirent: Dirent) -> Bool

@external(javascript, "../fs_ffi.mjs", "dirent_is_file")
pub fn dirent_is_file(dirent: Dirent) -> Bool

@external(javascript, "../fs_ffi.mjs", "dirent_is_socket")
pub fn dirent_is_socket(dirent: Dirent) -> Bool

@external(javascript, "../fs_ffi.mjs", "dirent_is_symbolic_link")
pub fn dirent_is_symbolic_link(dirent: Dirent) -> Bool

@external(javascript, "../fs_ffi.mjs", "dirent_name")
pub fn dirent_name(dirent: Dirent) -> String

@external(javascript, "../fs_ffi.mjs", "stats_is_block_device")
pub fn stats_is_block_device(stats: Stats) -> Bool

@external(javascript, "../fs_ffi.mjs", "stats_is_directory")
pub fn stats_is_directory(stats: Stats) -> Bool

@external(javascript, "../fs_ffi.mjs", "stats_is_fifo")
pub fn stats_is_fifo(stats: Stats) -> Bool

@external(javascript, "../fs_ffi.mjs", "stats_is_file")
pub fn stats_is_file(stats: Stats) -> Bool

@external(javascript, "../fs_ffi.mjs", "stats_is_socket")
pub fn stats_is_socket(stats: Stats) -> Bool

@external(javascript, "../fs_ffi.mjs", "stats_is_symbolic_link")
pub fn stats_is_symbolic_link(stats: Stats) -> Bool

@external(javascript, "../fs_ffi.mjs", "stats_dev")
pub fn stats_dev(stats: Stats) -> Int

@external(javascript, "../fs_ffi.mjs", "stats_ino")
pub fn stats_ino(stats: Stats) -> Int

@external(javascript, "../fs_ffi.mjs", "stats_mode")
pub fn stats_mode(stats: Stats) -> Int

@external(javascript, "../fs_ffi.mjs", "stats_nlink")
pub fn stats_nlink(stats: Stats) -> Int

@external(javascript, "../fs_ffi.mjs", "stats_uid")
pub fn stats_uid(stats: Stats) -> Int

@external(javascript, "../fs_ffi.mjs", "stats_gid")
pub fn stats_gid(stats: Stats) -> Int

@external(javascript, "../fs_ffi.mjs", "stats_rdev")
pub fn stats_rdev(stats: Stats) -> Int

@external(javascript, "../fs_ffi.mjs", "stats_size")
pub fn stats_size(stats: Stats) -> Int

@external(javascript, "../fs_ffi.mjs", "stats_blksize")
pub fn stats_blksize(stats: Stats) -> Int

@external(javascript, "../fs_ffi.mjs", "stats_blocks")
pub fn stats_blocks(stats: Stats) -> Int

@external(javascript, "../fs_ffi.mjs", "stats_atime_ms")
pub fn stats_atime_ms(stats: Stats) -> Int

@external(javascript, "../fs_ffi.mjs", "stats_mtime_ms")
pub fn stats_mtime_ms(stats: Stats) -> Int

@external(javascript, "../fs_ffi.mjs", "stats_ctime_ms")
pub fn stats_ctime_ms(stats: Stats) -> Int

@external(javascript, "../fs_ffi.mjs", "stats_birthtime_ms")
pub fn stats_birthtime_ms(stats: Stats) -> Int

@external(javascript, "../fs_ffi.mjs", "stats_atime")
pub fn stats_atime(stats: Stats) -> String

@external(javascript, "../fs_ffi.mjs", "stats_mtime")
pub fn stats_mtime(stats: Stats) -> String

@external(javascript, "../fs_ffi.mjs", "stats_ctime")
pub fn stats_ctime(stats: Stats) -> String

@external(javascript, "../fs_ffi.mjs", "stats_birthtime")
pub fn stats_birthtime(stats: Stats) -> String
