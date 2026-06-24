import njs/shared_dict

pub fn module_test() {
  let _ = shared_dict.shared_memory_error_name
  let _ = shared_dict.shared_memory_error_message
  let _ = shared_dict.add
  let _ = shared_dict.capacity
  let _ = shared_dict.clear
  let _ = shared_dict.delete
  let _ = shared_dict.free_space
  let _ = shared_dict.get
  let _ = shared_dict.has
  let _ = shared_dict.incr
  let _ = shared_dict.items
  let _ = shared_dict.keys
  let _ = shared_dict.name
  let _ = shared_dict.pop
  let _ = shared_dict.replace
  let _ = shared_dict.set
  let _ = shared_dict.size
  let _ = shared_dict.dict_type
  let _ = shared_dict.ttl
}
