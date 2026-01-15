import njs/xml

pub fn module_test() {
  let _ = xml.parse
  let _ = xml.c14n
  let _ = xml.exclusive_c14n
  let _ = xml.serialize
  let _ = xml.serialize_to_string
  let _ = xml.doc_root
  let _ = xml.doc_tag
  let _ = xml.node_tag_name
  let _ = xml.node_attr
  let _ = xml.node_set_attr
  let _ = xml.node_attrs
  let _ = xml.node_name
  let _ = xml.node_ns
  let _ = xml.node_parent
  let _ = xml.node_tag
  let _ = xml.node_set_tag
  let _ = xml.node_tags
  let _ = xml.node_set_tags
  let _ = xml.node_tags_name
  let _ = xml.node_set_tags_name
  let _ = xml.node_text
  let _ = xml.node_set_text
  let _ = xml.node_add_child
  let _ = xml.node_remove_all_attributes
  let _ = xml.node_remove_attribute
  let _ = xml.node_remove_children
  let _ = xml.node_remove_text
  let _ = xml.attr_value
}
