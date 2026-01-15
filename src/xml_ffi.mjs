// Use njs built-in xml module, with fallback for Node.js testing
// In njs, built-in modules are accessible via global objects
let xml;
try {
  // Check if we're in njs environment by looking for njs-specific global
  if (typeof njs !== 'undefined') {
    xml = xml;  // njs built-in xml module
  } else {
    throw new Error('Not in njs environment');
  }
} catch (e) {
  // Node.js test environment - create mock since 'xml' would be interpreted as npm package
  xml = {
    parse: () => ({}),
    c14n: () => ({}),
    exclusiveC14n: () => ({}),
    serialize: () => ({}),
    serializeToString: () => '',
  };
}

export function parse(d) {
  return xml.parse(d);
}

export function c14n(rn, en) {
  return en ? xml.c14n(rn, en) : xml.c14n(rn);
}

export function exclusive_c14n(rn, en, wc, pl) {
  return xml.exclusiveC14n(rn, en, wc, pl);
}

export function serialize(rn, en) {
  return en ? xml.serialize(rn, en) : xml.serialize(rn);
}

export function serialize_to_string(rn, en) {
  return en ? xml.serializeToString(rn, en) : xml.serializeToString(rn);
}

export function doc_root(d) {
  return d.$root;
}

export function doc_tag(d, n) {
  return d[n];
}

export function node_tag_name(no, n) {
  return no[n];
}

export function node_attr(no, n) {
  return no['$attr$' + n];
}

export function node_set_attr(no, n, v) {
  no['$attr$' + n] = v;
}

export function node_attrs(no) {
  return no.$attrs;
}

export function node_name(no) {
  return no.$name;
}

export function node_ns(no) {
  return no.$ns;
}

export function node_parent(no) {
  return no.$parent;
}

export function node_tag(no, n) {
  return no['$tag$' + n];
}

export function node_set_tag(no, n, v) {
  no['$tag$' + n] = v;
}

export function node_tags(no) {
  return no.$tags;
}

export function node_set_tags(no, ts) {
  no.$tags = ts;
}

export function node_tags_name(no, n) {
  return no['$tags$' + n];
}

export function node_set_tags_name(no, n, ts) {
  no['$tags$' + n] = ts;
}

export function node_text(no) {
  return no.$text;
}

export function node_set_text(no, v) {
  no.$text = v;
}

export function node_add_child(no, nd) {
  no.addChild(nd);
}

export function node_remove_all_attributes(no) {
  no.removeAllAttributes();
}

export function node_remove_attribute(no, n) {
  no.removeAttribute(n);
}

export function node_remove_children(no, n) {
  no.removeChildren(n);
}

export function node_remove_text(no) {
  no.removeText();
}

export function attr_value(a, n) {
  return a[n];
}
