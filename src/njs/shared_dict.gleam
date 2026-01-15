import gleam/javascript/array.{type Array}

pub type SharedDict

pub type DictItem

@external(javascript, "../shared_dict_ffi.mjs", "add")
pub fn add(dict: SharedDict, key: String, value: a, timeout: b) -> Bool

@external(javascript, "../shared_dict_ffi.mjs", "capacity")
pub fn capacity(dict: SharedDict) -> Int

@external(javascript, "../shared_dict_ffi.mjs", "clear")
pub fn clear(dict: SharedDict) -> Nil

@external(javascript, "../shared_dict_ffi.mjs", "delete")
pub fn delete(dict: SharedDict, key: String) -> Bool

@external(javascript, "../shared_dict_ffi.mjs", "free_space")
pub fn free_space(dict: SharedDict) -> Int

@external(javascript, "../shared_dict_ffi.mjs", "get")
pub fn get(dict: SharedDict, key: String) -> a

@external(javascript, "../shared_dict_ffi.mjs", "has")
pub fn has(dict: SharedDict, key: String) -> Bool

@external(javascript, "../shared_dict_ffi.mjs", "incr")
pub fn incr(
  dict: SharedDict,
  key: String,
  delta: Int,
  init: a,
  timeout: b,
) -> Int

@external(javascript, "../shared_dict_ffi.mjs", "items")
pub fn items(dict: SharedDict, max_count: a) -> Array(DictItem)

@external(javascript, "../shared_dict_ffi.mjs", "keys")
pub fn keys(dict: SharedDict, max_count: a) -> Array(String)

@external(javascript, "../shared_dict_ffi.mjs", "name")
pub fn name(dict: SharedDict) -> String

@external(javascript, "../shared_dict_ffi.mjs", "pop")
pub fn pop(dict: SharedDict, key: String) -> a

@external(javascript, "../shared_dict_ffi.mjs", "replace")
pub fn replace(dict: SharedDict, key: String, value: a) -> Bool

@external(javascript, "../shared_dict_ffi.mjs", "set")
pub fn set(dict: SharedDict, key: String, value: a, timeout: b) -> SharedDict

@external(javascript, "../shared_dict_ffi.mjs", "size")
pub fn size(dict: SharedDict) -> Int

@external(javascript, "../shared_dict_ffi.mjs", "dict_type")
pub fn dict_type(dict: SharedDict) -> String
