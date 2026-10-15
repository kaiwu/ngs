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

/// Returns the document root if its local name matches `name`.
@external(javascript, "../xml_ffi.mjs", "doc_tag")
pub fn doc_tag(doc: XMLDoc, name: String) -> Result(XMLNode, Nil)

/// Alias for `node_tag`. Uses `$tag$name` so method names are safe too.
@external(javascript, "../xml_ffi.mjs", "node_tag_name")
pub fn node_tag_name(node: XMLNode, name: String) -> Result(XMLNode, Nil)

/// Looks up an attribute by local name only. Use `node_get_attribute_ns` to
/// distinguish attributes with the same local name in different namespaces.
@external(javascript, "../xml_ffi.mjs", "node_attr")
pub fn node_attr(node: XMLNode, name: String) -> Result(String, Nil)

/// Looks up an attribute by namespace URI and local name (njs 1.0.2+).
/// Use `""` for no namespace. Unprefixed attributes have no namespace even
/// when their element declares a default namespace. Missing values are `Error`;
/// an attribute with an empty value is `Ok("")`.
@external(javascript, "../xml_ffi.mjs", "node_get_attribute_ns")
pub fn node_get_attribute_ns(
  node: XMLNode,
  namespace_uri: String,
  local_name: String,
) -> Result(String, Nil)

/// Looks up a direct child by namespace URI and local name (njs 1.0.2+).
/// Use `""` for no namespace. Returns `Error(Nil)` if no child matches.
@external(javascript, "../xml_ffi.mjs", "node_get_child_ns")
pub fn node_get_child_ns(
  node: XMLNode,
  namespace_uri: String,
  local_name: String,
) -> Result(XMLNode, Nil)

@external(javascript, "../xml_ffi.mjs", "node_set_attr")
pub fn node_set_attr(node: XMLNode, name: String, value: String) -> Nil

@external(javascript, "../xml_ffi.mjs", "node_attrs")
pub fn node_attrs(node: XMLNode) -> Result(XMLAttr, Nil)

@external(javascript, "../xml_ffi.mjs", "node_name")
pub fn node_name(node: XMLNode) -> String

@external(javascript, "../xml_ffi.mjs", "node_ns")
pub fn node_ns(node: XMLNode) -> Result(String, Nil)

/// Returns `Error(Nil)` for a document root or a detached node.
@external(javascript, "../xml_ffi.mjs", "node_parent")
pub fn node_parent(node: XMLNode) -> Result(XMLNode, Nil)

/// Looks up a child by local name, including names matching XMLNode methods.
@external(javascript, "../xml_ffi.mjs", "node_tag")
pub fn node_tag(node: XMLNode, name: String) -> Result(XMLNode, Nil)

/// Deletes all children with this local name using `delete node.$tag$name`.
@external(javascript, "../xml_ffi.mjs", "node_remove_tag")
pub fn node_remove_tag(node: XMLNode, name: String) -> Nil

/// Returns an empty array when the node has no child elements.
@external(javascript, "../xml_ffi.mjs", "node_tags")
pub fn node_tags(node: XMLNode) -> Array(XMLNode)

/// Replaces children with recursive copies. Sources must have no namespaces.
/// Mutation of a detached node, or copying a namespaced source, throws TypeError.
@external(javascript, "../xml_ffi.mjs", "node_set_tags")
pub fn node_set_tags(node: XMLNode, tags: Array(XMLNode)) -> Nil

/// Returns an empty array when there are no children with this local name.
@external(javascript, "../xml_ffi.mjs", "node_tags_name")
pub fn node_tags_name(node: XMLNode, name: String) -> Array(XMLNode)

@external(javascript, "../xml_ffi.mjs", "node_text")
pub fn node_text(node: XMLNode) -> String

@external(javascript, "../xml_ffi.mjs", "node_set_text")
pub fn node_set_text(node: XMLNode, value: String) -> Nil

/// Adds a recursive copy of a namespace-free source. The source is unchanged.
/// Mutation of a detached node, or copying a namespaced source, throws TypeError.
@external(javascript, "../xml_ffi.mjs", "node_add_child")
pub fn node_add_child(node: XMLNode, child: XMLNode) -> Nil

/// Adds a recursive copy of a namespace-free document's root (njs 1.0.2+).
@external(javascript, "../xml_ffi.mjs", "node_add_child")
pub fn node_add_child_doc(node: XMLNode, child: XMLDoc) -> Nil

@external(javascript, "../xml_ffi.mjs", "node_remove_all_attributes")
pub fn node_remove_all_attributes(node: XMLNode) -> Nil

@external(javascript, "../xml_ffi.mjs", "node_remove_attribute")
pub fn node_remove_attribute(node: XMLNode, name: String) -> Nil

@external(javascript, "../xml_ffi.mjs", "node_remove_children")
pub fn node_remove_children(node: XMLNode, tag_name: String) -> Nil

@external(javascript, "../xml_ffi.mjs", "node_remove_all_children")
pub fn node_remove_all_children(node: XMLNode) -> Nil

@external(javascript, "../xml_ffi.mjs", "node_remove_text")
pub fn node_remove_text(node: XMLNode) -> Nil

@external(javascript, "../xml_ffi.mjs", "attr_value")
pub fn attr_value(attr: XMLAttr, name: String) -> Result(String, Nil)
