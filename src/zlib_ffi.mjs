import {default as zl} from 'zlib';

export function deflate_raw_sync(d, o) {
  return o ? zl.deflateRawSync(d, o) : zl.deflateRawSync(d);
}

export function deflate_sync(d, o) {
  return o ? zl.deflateSync(d, o) : zl.deflateSync(d);
}

export function inflate_raw_sync(d) {
  return zl.inflateRawSync(d);
}

export function inflate_sync(d) {
  return zl.inflateSync(d);
}

export function constants() {
  return zl.constants;
}

export function constants_z_no_compression() {
  return zl.constants.Z_NO_COMPRESSION;
}

export function z_no_compression() {
  return zl.constants.Z_NO_COMPRESSION;
}

export function constants_z_best_speed() {
  return zl.constants.Z_BEST_SPEED;
}

export function z_best_speed() {
  return zl.constants.Z_BEST_SPEED;
}

export function constants_z_default_compression() {
  return zl.constants.Z_DEFAULT_COMPRESSION;
}

export function z_default_compression() {
  return zl.constants.Z_DEFAULT_COMPRESSION;
}

export function constants_z_best_compression() {
  return zl.constants.Z_BEST_COMPRESSION;
}

export function z_best_compression() {
  return zl.constants.Z_BEST_COMPRESSION;
}

export function constants_z_filtered() {
  return zl.constants.Z_FILTERED;
}

export function z_filtered() {
  return zl.constants.Z_FILTERED;
}

export function constants_z_huffman_only() {
  return zl.constants.Z_HUFFMAN_ONLY;
}

export function z_huffman_only() {
  return zl.constants.Z_HUFFMAN_ONLY;
}

export function constants_z_rle() {
  return zl.constants.Z_RLE;
}

export function z_rle() {
  return zl.constants.Z_RLE;
}

export function constants_z_fixed() {
  return zl.constants.Z_FIXED;
}

export function z_fixed() {
  return zl.constants.Z_FIXED;
}

export function constants_z_default_strategy() {
  return zl.constants.Z_DEFAULT_STRATEGY;
}

export function z_default_strategy() {
  return zl.constants.Z_DEFAULT_STRATEGY;
}
