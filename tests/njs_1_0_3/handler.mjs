import * as api from '../../build/dev/javascript/ngs/njs/ngx.mjs';
import * as http from '../../build/dev/javascript/ngs/njs/http.mjs';
import * as qs from '../../build/dev/javascript/ngs/njs/querystring.mjs';
import * as crypto from '../../build/dev/javascript/ngs/njs/crypto.mjs';
import * as decoder from '../../build/dev/javascript/ngs/njs/text_decoder.mjs';
import * as shared from '../../build/dev/javascript/ngs/njs/shared_dict.mjs';
import * as headers from '../../build/dev/javascript/ngs/njs/headers.mjs';
import * as request from '../../build/dev/javascript/ngs/njs/request.mjs';
import * as response from '../../build/dev/javascript/ngs/njs/response.mjs';
import * as timers from '../../build/dev/javascript/ngs/njs/timers.mjs';
import * as stream from '../../build/dev/javascript/ngs/njs/stream.mjs';

function json(r, result) {
    http.return_text(r, 200, JSON.stringify(result));
}

function version(r) {
    json(r, { engine: api.njs_engine(), number: api.njs_version_number() });
}

function args(r) {
    const parsed = http.args(r);
    const raw = http.get_variable(r, 'args');
    const decoded = qs.decode(raw.isOk() ? raw[0] : '');
    json(r, { parsed, decoded, nullPrototype: Object.getPrototypeOf(parsed) === null,
        moduleNullPrototype: Object.getPrototypeOf(decoded) === null });
}

function queryHelpers(r) {
    const query = api.make_query_string({ tag: ['a & b', ''] });
    json(r, api.parse_query_string(query));
}

function dictValues(r) {
    const zone = counters();
    shared.set(zone, 'value-test', new shared.ItemInt(0), 60000);
    const zero = shared.get(zone, 'value-test');
    const replaced = shared.replace(zone, 'value-test', new shared.ItemInt(3));
    const popped = shared.pop(zone, 'value-test');
    json(r, { zero: zero.isOk() && zero[0].i, replaced, popped: popped.isOk() && popped[0].i,
        missing: !shared.get(zone, 'value-test').isOk(), secondPopMissing: !shared.pop(zone, 'value-test').isOk() });
}

function dictCollection(r) {
    const zone = counters();
    shared.clear(zone);
    shared.set(zone, 'sample', new shared.ItemInt(17), 60000);
    const [[key, value]] = shared.items(zone, 1);
    json(r, { size: shared.size(zone), free: typeof shared.free_space(zone), key, value: value.i });
}

async function gcm(r) {
    const key = await crypto.import_key('raw', new ArrayBuffer(16), new crypto.AesKey('AES-GCM'), false, ['encrypt']);
    const bytes = s => new TextEncoder().encode(s).buffer;
    const alg = new crypto.AesGcm('AES-GCM', new ArrayBuffer(12), bytes('fixture AAD'), 96);
    const encrypted = await crypto.encrypt(alg, key, bytes('message'));
    json(r, Buffer.from(encrypted).toString('hex'));
}

function optionalHeaders(r) {
    const h = headers.from_array([['X-Empty', '']]);
    const empty = headers.get(h, 'X-Empty');
    const missing = headers.get(h, 'X-Missing');
    json(r, { empty: empty.isOk() && empty[0], missing: !missing.isOk() });
}

async function digest(r) {
    const bytes = new TextEncoder().encode('abc').buffer;
    const hex = await crypto.digest('SHA-256', bytes).then(hash => Buffer.from(hash).toString('hex'));
    const invalid = await crypto.digest('unsupported-digest', bytes).then(() => 'resolved', e => e.name);
    json(r, { hex, invalid });
}

async function emptyHmac(r) {
    const alg = new crypto.HMACKey('HMAC', 'SHA-256', 256);
    const importKey = length => crypto.import_key('raw', new ArrayBuffer(length), alg, false, ['sign']);
    const invalid = await importKey(0).then(() => 'resolved', e => e.name);
    const key = await importKey(32);
    json(r, { invalid, usable: crypto.crypto_key_usages(key) });
}

function decode(r) {
    const d = decoder.new$('utf-8', new decoder.TextDecoderOptions(false));
    const streaming = new decoder.TextDecodeOptions(true);
    const chunk = bytes => decoder.decode(d, new Uint8Array(bytes).buffer, streaming);
    // The no-input flush has no Gleam signature yet.
    json(r, [chunk([0xef]), chunk([0xbb, 0xbf, 65]), chunk([0xef, 0xbb, 0xbf, 66]),
        chunk([0xe2]), d.decode(), chunk([0xef, 0xbb, 0xbf, 67]), d.decode()]);
}

function child(r) {
    json(r, { hasParent: http.parent(r) !== undefined, label: http.args(r).label });
}

async function reply(r) {
    const res = await http.subrequest(r, '/child', qs.encode({ label: 'a & b' }));
    json(r, { status: http.status(res), sameParent: http.parent(res) === r,
        child: JSON.parse(http.response_text(res)) });
}

async function fetchObjects(r) {
    const original = headers.from_array([['X-Token', 'original']]);
    const req = request.from_url('http://127.0.0.1/example', { method: 'POST', headers: original, body: 'body' });
    const res = response.from_string('response', new response.ResponseOption(201, original, 'Created'));
    headers.set(original, 'X-Token', 'changed');
    json(r, { requestHeader: headers.get(request.headers(req), 'X-Token'),
        responseHeader: headers.get(response.headers(res), 'X-Token'),
        sameHeaders: response.headers(res) === response.headers(res),
        bodyUsedBefore: response.has_body(res), body: await response.text(res),
        bodyUsedAfter: response.has_body(res), requestBody: await request.text(req) });
}

async function cancelTimer(r) {
    const calls = [];
    const id = timers.set_timeout(() => calls.push('cancelled'), 1, []);
    timers.clear_timeout(id);
    timers.clear_timeout(id);
    await new Promise(resolve => timers.set_timeout(resolve, 10, []));
    calls.push('active');
    json(r, calls);
}

function counters() {
    return shared.get_shared_dict('counters')[0];
}

function seed(r) {
    const zone = counters();
    for (const key of ['clock', 'remove', 'add', 'increment']) shared.set(zone, key, new shared.ItemInt(42), 100);
    json(r, shared.get(zone, 'increment').i);
}

function expired(r) {
    json(r, !shared.has(counters(), 'clock'));
}

function update(r) {
    const zone = counters();
    json(r, { deleted: shared.delete$(zone, 'remove'), added: shared.add(zone, 'add', new shared.ItemInt(0), 60000),
        value: shared.get(zone, 'add').i, increment: shared.incr(zone, 'increment', 3, 7, 60000),
        stored: shared.get(zone, 'increment').i });
}

function saved(r) {
    const zone = shared.get_shared_dict('saved')[0];
    if (http.method(r) === 'POST') shared.set(zone, 'marker', new shared.ItemString('kept'), 30000);
    const ttl = shared.ttl(zone, 'marker');
    json(r, ttl.isOk() ? { value: shared.get(zone, 'marker').s, ttl: ttl[0] } : null);
}

async function fetchTls(r) {
    const res = await api.fetch_url(http.get_variable(r, 'tls_origin')[0]);
    http.return_text(r, response.status(res), await response.text(res));
}

async function streamAccess(s) {
    const vars = stream.variables(s);
    const res = await api.fetch_url(vars.tls_origin);
    vars.message = await response.text(res);
    stream.allow(s);
}

function streamFilter(s) {
    const upload = new stream.UpStringEvent();
    stream.on(s, upload, event => {
        if (!event.s.length) return;
        stream.off(s, upload);
        const options = new stream.SendOption(false, true);
        timers.set_timeout(() => {
            stream.send_downstream(s, stream.variables(s).message + '\n', options);
            stream.send_upstream(s, 'GET /stream-origin HTTP/1.0\r\nHost: localhost\r\n\r\n', options);
        }, 1, []);
    });
}

export default { version, args, digest, emptyHmac, decode, reply, child, fetchObjects,
    cancelTimer, seed, expired, update, saved, fetchTls, streamAccess, streamFilter,
    queryHelpers, dictValues, dictCollection, gcm, optionalHeaders };
