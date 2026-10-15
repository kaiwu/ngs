// Exercise the compiled Gleam API in QuickJS. Node cannot load njs's XML module.
import * as xml from '../../build/dev/javascript/ngs/njs/xml.mjs';
import * as buffer from '../../build/dev/javascript/ngs/njs/buffer.mjs';
import * as api from '../../build/dev/javascript/ngs/njs/ngx.mjs';
import * as request from '../../build/dev/javascript/ngs/njs/request.mjs';
import * as response from '../../build/dev/javascript/ngs/njs/response.mjs';

function value(result) {
    if (!result.isOk()) throw new Error('Expected Ok from XML lookup');
    return result[0];
}

function missing(result) {
    return !result.isOk() && result[0] === undefined;
}

function root(source) {
    return xml.doc_root(xml.parse(source));
}

function text(data) {
    return buffer.to_string(data, new buffer.Utf8(), 0, buffer.length(data));
}

function exception(fn) {
    try {
        fn();
        return null;
    } catch (error) {
        return { name: error.name, message: error.message };
    }
}

function namespaces() {
    const node = root('<r xmlns="urn:default" xmlns:x="urn:other" x:ID="wrong" ID="correct" empty="">'
        + '<x:Issuer>foreign</x:Issuer><Issuer>default</Issuer>'
        + '<Issuer xmlns="">plain</Issuer><wrapper><nested/></wrapper></r>');
    return {
        plain: value(xml.node_get_attribute_ns(node, '', 'ID')),
        foreign: value(xml.node_get_attribute_ns(node, 'urn:other', 'ID')),
        default_attribute_missing: missing(xml.node_get_attribute_ns(node, 'urn:default', 'ID')),
        empty: value(xml.node_get_attribute_ns(node, '', 'empty')),
        foreign_child: xml.node_text(value(xml.node_get_child_ns(node, 'urn:other', 'Issuer'))),
        default_child: xml.node_text(value(xml.node_get_child_ns(node, 'urn:default', 'Issuer'))),
        plain_child: xml.node_text(value(xml.node_get_child_ns(node, '', 'Issuer'))),
        missing_attribute: missing(xml.node_get_attribute_ns(node, 'urn:missing', 'ID')),
        missing_child: missing(xml.node_get_child_ns(node, 'urn:missing', 'Issuer')),
        direct_children_only: missing(xml.node_get_child_ns(node, 'urn:default', 'nested')),
        namespace: value(xml.node_ns(node)),
    };
}

function optional() {
    const doc = xml.parse('<r><child empty=""/></r>');
    const node = xml.doc_root(doc);
    const child = value(xml.node_tag(node, 'child'));
    const attrs = value(xml.node_attrs(child));
    return {
        root: xml.node_name(value(xml.doc_tag(doc, 'r'))),
        parent: xml.node_name(value(xml.node_parent(child))),
        empty_attribute: value(xml.node_attr(child, 'empty')),
        empty_attr_value: value(xml.attr_value(attrs, 'empty')),
        missing: [
            xml.doc_tag(doc, 'missing'), xml.node_tag(node, 'missing'),
            xml.node_tag_name(node, 'missing'), xml.node_attr(node, 'missing'),
            xml.node_attrs(node), xml.node_ns(node), xml.node_parent(node),
            xml.attr_value(attrs, 'missing'),
        ].map(missing),
        empty_tags: xml.node_tags(child).length,
        missing_tags: xml.node_tags_name(node, 'missing').length,
    };
}

function entities() {
    const node = root('<!DOCTYPE r [<!ENTITY a "A"><!ENTITY b "&a;B">]>'
        + '<r xmlns:x="urn:x" x:ID="pre&b;post" empty=""/>');
    return {
        local: value(xml.node_attr(node, 'ID')),
        attrs: value(xml.attr_value(value(xml.node_attrs(node)), 'ID')),
        namespace: value(xml.node_get_attribute_ns(node, 'urn:x', 'ID')),
        serialized: xml.serialize_to_string(node, undefined),
        empty: value(xml.node_attr(node, 'empty')),
    };
}

function methods() {
    const names = ['addChild', 'getAttributeNS', 'getChildNS', 'removeChildren',
        'setAttribute', 'removeAttribute', 'removeAllAttributes', 'setText', 'removeText'];
    const node = root('<r>' + names.map(name => `<${name}/>`).join('') + '</r>');
    const found = names.map(name => xml.node_name(value(xml.node_tag_name(node, name))));
    xml.node_remove_tag(node, 'getChildNS');
    return {
        found,
        removed: missing(xml.node_tag(node, 'getChildNS')),
        methods_callable: names.every(name => typeof node[name] === 'function'),
        remaining: xml.node_tags(node).length,
    };
}

function mutations() {
    const node = root('<r><child><leaf>old</leaf></child><child/></r>');
    const child = value(xml.node_tag(node, 'child'));
    const leaf = value(xml.node_tag(child, 'leaf'));
    xml.node_set_attr(child, 'a', 'changed');
    xml.node_set_text(leaf, 'new');
    const live = value(xml.node_attr(value(xml.node_tag(node, 'child')), 'a'));
    const live_text = xml.node_text(value(xml.node_tag(value(xml.node_tag(node, 'child')), 'leaf')));
    xml.node_remove_tag(node, 'child');
    const detached = missing(xml.node_parent(child));
    const descendant_parent = xml.node_name(value(xml.node_parent(leaf)));
    const detached_text = xml.node_text(child);
    const detached_mutation = exception(() => xml.node_set_text(child, 'invalid'));
    const detached_c14n = exception(() => xml.c14n(child, undefined));

    const source = root('<copy><nested/></copy>');
    xml.node_add_child(node, source);
    xml.node_add_child(node, source);
    xml.node_add_child_doc(node, xml.parse('<from_doc/>'));
    const copied_names = xml.node_tags(node).map(xml.node_name);
    const copied = value(xml.node_tag(node, 'copy'));
    xml.node_set_attr(copied, 'local', 'yes');
    const independent_copy = missing(xml.node_attr(xml.node_tags_name(node, 'copy')[1], 'local'));
    xml.node_set_tags(node, [source]);
    const replacement = xml.node_tags(node).map(xml.node_name);
    const removed_parent = missing(xml.node_parent(copied));
    xml.node_remove_all_children(node);
    xml.node_set_attr(node, 'a', '');
    xml.node_remove_attribute(node, 'a');
    xml.node_set_attr(node, 'b', 'b');
    xml.node_remove_all_attributes(node);
    xml.node_set_text(node, 'text');
    xml.node_remove_text(node);
    return { live, live_text, detached, descendant_parent, detached_text,
        detached_mutation, detached_c14n, copied_names, independent_copy,
        source_unchanged: missing(xml.node_attr(source, 'local')),
        replacement, removed_parent, empty_tags: xml.node_tags(node).length,
        no_attrs: missing(xml.node_attrs(node)), text: xml.node_text(node) };
}

function rejected() {
    const node = root('<r><keep/></r>');
    const foreign = root('<foreign/>');
    const namespaced = root('<x:a xmlns:x="urn:x"/>');
    const nested_namespace = root('<plain><x:a xmlns:x="urn:x"/></plain>');
    const child = value(xml.node_tag(node, 'keep'));
    const errors = {
        add_namespace: exception(() => xml.node_add_child(node, namespaced)),
        add_nested_namespace: exception(() => xml.node_add_child(node, nested_namespace)),
        replace_namespace: exception(() => xml.node_set_tags(node, [foreign, namespaced])),
        foreign_exclusion: exception(() => xml.c14n(node, foreign)),
        tag_assignment: exception(() => { node.$tag$keep = foreign; }),
        tags_assignment: exception(() => { node.$tags$keep = [foreign]; }),
        tags_deletion: exception(() => { delete node.$tags$keep; }),
        nonstring_attribute: exception(() => xml.node_set_attr(node, 'a', 1)),
        nonstring_text: exception(() => xml.node_set_text(node, {})),
    };
    const unchanged = xml.serialize_to_string(node, undefined);
    xml.node_remove_children(node, 'keep');
    errors.detached_exclusion = exception(() => xml.serialize(node, child));
    errors.detached_string_exclusion = exception(() => xml.serialize_to_string(node, child));
    errors.detached_exclusive = exception(() => xml.exclusive_c14n(child, undefined, false, ''));
    return { errors, unchanged };
}

function canonicalization() {
    const data = buffer.from_string('<r><!--comment--><keep b="2" a="1"/><omit/></r>', new buffer.Utf8());
    const doc = xml.parse(data);
    const node = xml.doc_root(doc);
    const omit = value(xml.node_tag(node, 'omit'));
    return {
        c14n: text(xml.c14n(doc, omit)),
        serialize: text(xml.serialize(doc, omit)),
        string: xml.serialize_to_string(doc, omit),
        exclusive: text(xml.exclusive_c14n(doc, undefined, true, '')),
        exclusive_excluding: text(xml.exclusive_c14n(doc, omit, false, '')),
        malformed: exception(() => xml.parse('<r>')),
        oversize_alloc: exception(() => buffer.alloc(2 ** 32 + 16)),
        oversize_concat: exception(() => buffer.concat([], 2 ** 32 + 16)),
        version: api.njs_version_number(),
        engine: api.njs_engine(),
    };
}

async function fetch_response(r) {
    const url = `http://127.0.0.1:${r.args.port}/`;
    const options = { max_response_body_size: Number(r.args.limit ?? 64) };
    try {
        const result = r.args.request
            ? await api.fetch_request(request.from_url(url, {}), options)
            : await api.fetch_url(url, options);
        const output = { status: response.status(result), body: await response.text(result) };
        if (r.args.repeat) {
            const next = await api.fetch_url(url, options);
            output.next = { status: response.status(next), body: await response.text(next) };
        }
        return output;
    } catch (error) {
        return { error: error.message };
    }
}

const checks = { namespaces, optional, entities, methods, mutations, rejected, canonicalization };

async function handler(r) {
    try {
        const name = r.uri.slice(1);
        const result = name === 'fetch' ? await fetch_response(r) : checks[name]?.();
        r.return(result === undefined ? 404 : 200, JSON.stringify(result ?? {}));
    } catch (error) {
        r.return(500, JSON.stringify({ error: error.stack }));
    }
}

export default { handler };
