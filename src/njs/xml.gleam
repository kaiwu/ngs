import gleam/javascript/array.{type Array}
import njs/buffer.{type Buffer}

pub type XMLDoc

pub type XMLNode

pub type XMLAttr

@external(javascript, "../xml_ffi.mjs", "parse")
pub fn parse(data: a) -> XMLDoc

@external(javascript, "../xml_ffi.mjs", "c14n")
pub fn c14n(root_node: a, excluding_node: b) -> Buffer

@external(javascript, "../xml_ffi.mjs", "exclusive_c14n")
pub fn exclusive_c14n(
  root_node: a,
  excluding_node: b,
  with_comments: Bool,
  prefix_list: String,
) -> Buffer

@external(javascript, "../xml_ffi.mjs", "serialize")
pub fn serialize(root_node: a, excluding_node: b) -> Buffer

@external(javascript, "../xml_ffi.mjs", "serialize_to_string")
pub fn serialize_to_string(root_node: a, excluding_node: b) -> String

@external(javascript, "../xml_ffi.mjs", "doc_root")
pub fn doc_root(doc: XMLDoc) -> XMLNode

@external(javascript, "../xml_ffi.mjs", "doc_tag")
pub fn doc_tag(doc: XMLDoc, name: String) -> XMLNode

@external(javascript, "../xml_ffi.mjs", "node_tag_name")
pub fn node_tag_name(node: XMLNode, name: String) -> XMLNode

@external(javascript, "../xml_ffi.mjs", "node_attr")
pub fn node_attr(node: XMLNode, name: String) -> String

@external(javascript, "../xml_ffi.mjs", "node_set_attr")
pub fn node_set_attr(node: XMLNode, name: String, value: String) -> Nil

@external(javascript, "../xml_ffi.mjs", "node_attrs")
pub fn node_attrs(node: XMLNode) -> XMLAttr

@external(javascript, "../xml_ffi.mjs", "node_name")
pub fn node_name(node: XMLNode) -> String

@external(javascript, "../xml_ffi.mjs", "node_ns")
pub fn node_ns(node: XMLNode) -> String

@external(javascript, "../xml_ffi.mjs", "node_parent")
pub fn node_parent(node: XMLNode) -> XMLNode

@external(javascript, "../xml_ffi.mjs", "node_tag")
pub fn node_tag(node: XMLNode, name: String) -> XMLNode

@external(javascript, "../xml_ffi.mjs", "node_set_tag")
pub fn node_set_tag(node: XMLNode, name: String, value: XMLNode) -> Nil

@external(javascript, "../xml_ffi.mjs", "node_tags")
pub fn node_tags(node: XMLNode) -> Array(XMLNode)

@external(javascript, "../xml_ffi.mjs", "node_set_tags")
pub fn node_set_tags(node: XMLNode, tags: Array(XMLNode)) -> Nil

@external(javascript, "../xml_ffi.mjs", "node_tags_name")
pub fn node_tags_name(node: XMLNode, name: String) -> Array(XMLNode)

@external(javascript, "../xml_ffi.mjs", "node_set_tags_name")
pub fn node_set_tags_name(
  node: XMLNode,
  name: String,
  tags: Array(XMLNode),
) -> Nil

@external(javascript, "../xml_ffi.mjs", "node_text")
pub fn node_text(node: XMLNode) -> String

@external(javascript, "../xml_ffi.mjs", "node_set_text")
pub fn node_set_text(node: XMLNode, value: String) -> Nil

@external(javascript, "../xml_ffi.mjs", "node_add_child")
pub fn node_add_child(node: XMLNode, child: XMLNode) -> Nil

@external(javascript, "../xml_ffi.mjs", "node_remove_all_attributes")
pub fn node_remove_all_attributes(node: XMLNode) -> Nil

@external(javascript, "../xml_ffi.mjs", "node_remove_attribute")
pub fn node_remove_attribute(node: XMLNode, name: String) -> Nil

@external(javascript, "../xml_ffi.mjs", "node_remove_children")
pub fn node_remove_children(node: XMLNode, tag_name: String) -> Nil

@external(javascript, "../xml_ffi.mjs", "node_remove_text")
pub fn node_remove_text(node: XMLNode) -> Nil

@external(javascript, "../xml_ffi.mjs", "attr_value")
pub fn attr_value(attr: XMLAttr, name: String) -> String
