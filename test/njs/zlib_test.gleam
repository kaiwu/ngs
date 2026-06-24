import njs/zlib

pub fn module_test() {
  let _ = zlib.deflate_raw_sync
  let _ = zlib.deflate_sync
  let _ = zlib.inflate_raw_sync
  let _ = zlib.inflate_sync
  let _ = zlib.constants
  let _ = zlib.constants_z_no_compression
  let _ = zlib.z_no_compression
  let _ = zlib.constants_z_best_speed
  let _ = zlib.z_best_speed
  let _ = zlib.constants_z_default_compression
  let _ = zlib.z_default_compression
  let _ = zlib.constants_z_best_compression
  let _ = zlib.z_best_compression
  let _ = zlib.constants_z_filtered
  let _ = zlib.z_filtered
  let _ = zlib.constants_z_huffman_only
  let _ = zlib.z_huffman_only
  let _ = zlib.constants_z_rle
  let _ = zlib.z_rle
  let _ = zlib.constants_z_fixed
  let _ = zlib.z_fixed
  let _ = zlib.constants_z_default_strategy
  let _ = zlib.z_default_strategy
}
