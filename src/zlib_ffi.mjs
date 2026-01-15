import zlib from 'zlib';

export function deflate_raw_sync(d, o) {
  return o ? zlib.deflateRawSync(d, o) : zlib.deflateRawSync(d);
}

export function deflate_sync(d, o) {
  return o ? zlib.deflateSync(d, o) : zlib.deflateSync(d);
}

export function inflate_raw_sync(d) {
  return zlib.inflateRawSync(d);
}

export function inflate_sync(d) {
  return zlib.inflateSync(d);
}

export function constants_z_no_compression() {
  return zlib.constants.Z_NO_COMPRESSION;
}

export function constants_z_best_speed() {
  return zlib.constants.Z_BEST_SPEED;
}

export function constants_z_default_compression() {
  return zlib.constants.Z_DEFAULT_COMPRESSION;
}

export function constants_z_best_compression() {
  return zlib.constants.Z_BEST_COMPRESSION;
}

export function constants_z_filtered() {
  return zlib.constants.Z_FILTERED;
}

export function constants_z_huffman_only() {
  return zlib.constants.Z_HUFFMAN_ONLY;
}

export function constants_z_rle() {
  return zlib.constants.Z_RLE;
}

export function constants_z_fixed() {
  return zlib.constants.Z_FIXED;
}

export function constants_z_default_strategy() {
  return zlib.constants.Z_DEFAULT_STRATEGY;
}
