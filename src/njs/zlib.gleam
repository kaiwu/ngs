import njs/buffer.{type Buffer}

pub type Constants

pub type ZlibOptions {
  ZlibOptions(
    chunk_size: Int,
    dictionary: Buffer,
    level: Int,
    mem_level: Int,
    strategy: Int,
    window_bits: Int,
  )
}

@external(javascript, "../zlib_ffi.mjs", "deflate_raw_sync")
pub fn deflate_raw_sync(data: a, options: o) -> Buffer

@external(javascript, "../zlib_ffi.mjs", "deflate_sync")
pub fn deflate_sync(data: a, options: o) -> Buffer

@external(javascript, "../zlib_ffi.mjs", "inflate_raw_sync")
pub fn inflate_raw_sync(data: a) -> Buffer

@external(javascript, "../zlib_ffi.mjs", "inflate_sync")
pub fn inflate_sync(data: a) -> Buffer

@external(javascript, "../zlib_ffi.mjs", "constants")
pub fn constants() -> Constants

@external(javascript, "../zlib_ffi.mjs", "constants_z_no_compression")
pub fn constants_z_no_compression() -> Int

@external(javascript, "../zlib_ffi.mjs", "z_no_compression")
pub fn z_no_compression() -> Int

@external(javascript, "../zlib_ffi.mjs", "constants_z_best_speed")
pub fn constants_z_best_speed() -> Int

@external(javascript, "../zlib_ffi.mjs", "z_best_speed")
pub fn z_best_speed() -> Int

@external(javascript, "../zlib_ffi.mjs", "constants_z_default_compression")
pub fn constants_z_default_compression() -> Int

@external(javascript, "../zlib_ffi.mjs", "z_default_compression")
pub fn z_default_compression() -> Int

@external(javascript, "../zlib_ffi.mjs", "constants_z_best_compression")
pub fn constants_z_best_compression() -> Int

@external(javascript, "../zlib_ffi.mjs", "z_best_compression")
pub fn z_best_compression() -> Int

@external(javascript, "../zlib_ffi.mjs", "constants_z_filtered")
pub fn constants_z_filtered() -> Int

@external(javascript, "../zlib_ffi.mjs", "z_filtered")
pub fn z_filtered() -> Int

@external(javascript, "../zlib_ffi.mjs", "constants_z_huffman_only")
pub fn constants_z_huffman_only() -> Int

@external(javascript, "../zlib_ffi.mjs", "z_huffman_only")
pub fn z_huffman_only() -> Int

@external(javascript, "../zlib_ffi.mjs", "constants_z_rle")
pub fn constants_z_rle() -> Int

@external(javascript, "../zlib_ffi.mjs", "z_rle")
pub fn z_rle() -> Int

@external(javascript, "../zlib_ffi.mjs", "constants_z_fixed")
pub fn constants_z_fixed() -> Int

@external(javascript, "../zlib_ffi.mjs", "z_fixed")
pub fn z_fixed() -> Int

@external(javascript, "../zlib_ffi.mjs", "constants_z_default_strategy")
pub fn constants_z_default_strategy() -> Int

@external(javascript, "../zlib_ffi.mjs", "z_default_strategy")
pub fn z_default_strategy() -> Int
