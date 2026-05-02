import gleam/javascript/array.{type Array}

pub type SharedDict

pub type DictItem {
  ItemString(s: String)
  ItemInt(i: Int)
  ItemNumber(n: Float)
}

@external(javascript, "../shared_dict_ffi.mjs", "get_shared_dict")
pub fn get_shared_dict(name: String) -> Result(SharedDict, Nil)

@external(javascript, "../shared_dict_ffi.mjs", "add")
fn do_add(dict: SharedDict, key: String, value: a, timeout: Int) -> Bool

pub fn add(
  dict: SharedDict,
  key: String,
  value: DictItem,
  timeout: Int,
) -> Bool {
  case value {
    ItemString(s) -> do_add(dict, key, s, timeout)
    ItemNumber(n) -> do_add(dict, key, n, timeout)
    ItemInt(i) -> do_add(dict, key, i, timeout)
  }
}

@external(javascript, "../shared_dict_ffi.mjs", "capacity")
pub fn capacity(dict: SharedDict) -> Int

@external(javascript, "../shared_dict_ffi.mjs", "clear")
pub fn clear(dict: SharedDict) -> Nil

@external(javascript, "../shared_dict_ffi.mjs", "shared_dict_delete")
pub fn delete(dict: SharedDict, key: String) -> Bool

@external(javascript, "../shared_dict_ffi.mjs", "free_space")
pub fn free_space(dict: SharedDict) -> Int

@external(javascript, "../shared_dict_ffi.mjs", "get")
pub fn get(dict: SharedDict, key: String) -> DictItem

@external(javascript, "../shared_dict_ffi.mjs", "has")
pub fn has(dict: SharedDict, key: String) -> Bool

@external(javascript, "../shared_dict_ffi.mjs", "incr")
pub fn incr(
  dict: SharedDict,
  key: String,
  delta: Int,
  init: Int,
  timeout: Int,
) -> Int

@external(javascript, "../shared_dict_ffi.mjs", "items")
pub fn items(dict: SharedDict, max_count: Int) -> Array(DictItem)

@external(javascript, "../shared_dict_ffi.mjs", "keys")
pub fn keys(dict: SharedDict, max_count: Int) -> Array(String)

@external(javascript, "../shared_dict_ffi.mjs", "name")
pub fn name(dict: SharedDict) -> String

@external(javascript, "../shared_dict_ffi.mjs", "pop")
pub fn pop(dict: SharedDict, key: String) -> Result(DictItem, Nil)

@external(javascript, "../shared_dict_ffi.mjs", "replace")
pub fn replace(dict: SharedDict, key: String, value: DictItem) -> Bool

@external(javascript, "../shared_dict_ffi.mjs", "set")
fn do_set(dict: SharedDict, key: String, value: a, timeout: Int) -> SharedDict

pub fn set(
  dict: SharedDict,
  key: String,
  value: DictItem,
  timeout: Int,
) -> SharedDict {
  case value {
    ItemString(s) -> do_set(dict, key, s, timeout)
    ItemNumber(n) -> do_set(dict, key, n, timeout)
    ItemInt(i) -> do_set(dict, key, i, timeout)
  }
}

@external(javascript, "../shared_dict_ffi.mjs", "size")
pub fn size(dict: SharedDict) -> Int

@external(javascript, "../shared_dict_ffi.mjs", "dict_type")
pub fn dict_type(dict: SharedDict) -> String

/// Returns the remaining TTL in milliseconds for a key, or Error if the key
/// doesn't exist or has already expired. Requires the dict to be declared
/// with a timeout. Added in njs 0.9.7.
@external(javascript, "../shared_dict_ffi.mjs", "ttl")
pub fn ttl(dict: SharedDict, key: String) -> Result(Int, Nil)
