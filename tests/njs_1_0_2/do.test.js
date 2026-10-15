import { describe, test, expect, beforeAll, afterAll } from 'bun:test';
import { build } from 'esbuild';
import { copyFileSync, mkdirSync } from 'node:fs';
import { startNginx, stopNginx, cleanupRuntime } from '../harness.js';

const MODULE = 'njs_1_0_2';

async function request(path) {
    const response = await fetch(`http://127.0.0.1:8888${path}`, {
        headers: { Connection: 'close' },
        signal: AbortSignal.timeout(3000),
    });
    const body = await response.json();
    expect(body.error, JSON.stringify(body)).toBeUndefined();
    expect(response.status).toBe(200);
    return body;
}

async function rawFetch(response, { limit = 64, requestObject = false, delayClose = 0, repeat = false } = {}) {
    const sockets = new Set();
    const timers = new Set();
    let connections = 0;
    const server = Bun.listen({
        hostname: '127.0.0.1', port: 0,
        socket: {
            open(socket) {
                connections++;
                sockets.add(socket);
                socket.data = '';
            },
            data(socket, data) {
                socket.data += new TextDecoder().decode(data);
                const end = socket.data.indexOf('\r\n\r\n');
                if (end < 0) return;
                socket.data = socket.data.slice(end + 4);
                socket.write(response);
                if (delayClose) {
                    const timer = setTimeout(() => { timers.delete(timer); socket.end(); }, delayClose);
                    timers.add(timer);
                } else socket.end();
            },
            close(socket) { sockets.delete(socket); },
            error() {},
        },
    });
    try {
        const res = await fetch(`http://127.0.0.1:8888/fetch?port=${server.port}&limit=${limit}&request=${requestObject ? 1 : ''}&repeat=${repeat ? 1 : ''}`, {
            headers: { Connection: 'close' }, signal: AbortSignal.timeout(3000),
        });
        expect(res.status).toBe(200);
        const result = await res.json();
        return repeat ? { ...result, connections } : result;
    } finally {
        for (const timer of timers) clearTimeout(timer);
        for (const socket of sockets) socket.terminate();
        server.stop(true);
    }
}

describe('njs 1.0.2 bindings in QuickJS', () => {
    beforeAll(async () => {
        mkdirSync(`dist/${MODULE}/njs`, { recursive: true });
        await build({
            entryPoints: [`tests/${MODULE}/handler.mjs`],
            bundle: true, format: 'esm', target: 'es2020',
            external: ['xml', 'crypto', 'fs', 'querystring', 'zlib', 'buffer'],
            outfile: `dist/${MODULE}/njs/app.js`,
        });
        copyFileSync(`tests/${MODULE}/nginx.conf`, `dist/${MODULE}/nginx.conf`);
        await startNginx(`dist/${MODULE}/nginx.conf`, MODULE);
    });

    afterAll(async () => {
        await stopNginx();
        cleanupRuntime(MODULE);
    });

    test('namespace lookups distinguish local names, default namespaces, and empty values', async () => {
        expect(await request('/namespaces')).toEqual({
            plain: 'correct', foreign: 'wrong', default_attribute_missing: true, empty: '',
            foreign_child: 'foreign', default_child: 'default', plain_child: 'plain',
            missing_attribute: true, missing_child: true, direct_children_only: true,
            namespace: 'urn:default',
        });
    });

    test('optional XML values are Results and child collections remain arrays', async () => {
        expect(await request('/optional')).toEqual({
            root: 'r', parent: 'r', empty_attribute: '', empty_attr_value: '',
            missing: Array(8).fill(true), empty_tags: 0, missing_tags: 0,
        });
    });

    test('all attribute accessors agree with canonicalization on entity values', async () => {
        expect(await request('/entities')).toEqual({
            local: 'preABpost', attrs: 'preABpost', namespace: 'preABpost', empty: '',
            serialized: '<r xmlns:x="urn:x" empty="" x:ID="preABpost"></r>',
        });
    });

    test('children named after methods can be looked up and removed', async () => {
        const result = await request('/methods');
        expect(result.found).toEqual(['addChild', 'getAttributeNS', 'getChildNS', 'removeChildren',
            'setAttribute', 'removeAttribute', 'removeAllAttributes', 'setText', 'removeText']);
        expect(result.removed).toBe(true);
        expect(result.methods_callable).toBe(true);
        expect(result.remaining).toBe(8);
    });

    test('mutations preserve live wrappers and keep removed descendants readable', async () => {
        const result = await request('/mutations');
        expect(result).toEqual({
            live: 'changed', live_text: 'new', detached: true, descendant_parent: 'child',
            detached_text: 'new',
            detached_mutation: { name: 'TypeError', message: 'XMLNode is detached' },
            detached_c14n: { name: 'TypeError', message: 'XMLNode is detached' },
            copied_names: ['copy', 'copy', 'from_doc'], independent_copy: true,
            source_unchanged: true, replacement: ['copy'], removed_parent: true,
            empty_tags: 0, no_attrs: true, text: '',
        });
    });

    test('invalid mutations and exclusions throw without changing the live tree', async () => {
        const { errors, unchanged } = await request('/rejected');
        expect(unchanged).toBe('<r><keep></keep></r>');
        expect(Object.keys(errors)).toHaveLength(12);
        for (const error of Object.values(errors)) expect(error?.name).toBe('TypeError');
        expect(errors.add_namespace.message).toBe('XMLNode has namespaces');
        expect(errors.replace_namespace.message).toBe('setval[1] has namespaces');
        expect(errors.foreign_exclusion.message).toBe('"excluding" is not in XMLNode tree');
        expect(errors.detached_exclusion.message).toBe('"excluding" is not in XMLNode tree');
    });

    test('Buffer XML parsing, canonicalization, and checked Buffer sizes run on 1.0.2', async () => {
        const result = await request('/canonicalization');
        expect(result.version).toBe(0x010002);
        expect(result.engine).toBe('QuickJS');
        for (const key of ['c14n', 'serialize', 'string'])
            expect(result[key]).toBe('<r><keep a="1" b="2"></keep></r>');
        expect(result.exclusive).toBe('<r><!--comment--><keep a="1" b="2"></keep><omit></omit></r>');
        expect(result.exclusive_excluding).toBe('<r><keep a="1" b="2"></keep></r>');
        expect(result.malformed?.message).toContain('failed to parse XML');
        expect(result.oversize_alloc?.name).toBe('RangeError');
        expect(result.oversize_concat?.name).toBe('RangeError');
    });

    test.each([
        ['Content-Length: 1\r\nContent-Length: 2', 'conflicting http content length'],
        ['Transfer-Encoding: chunked\r\nContent-Length: 1', 'conflicting http response framing'],
    ])('fetch rejects conflicting framing: %s', async (headers, error) => {
        expect(await rawFetch(`HTTP/1.1 200 OK\r\n${headers}\r\n\r\na`)).toEqual({ error });
    });

    test('fetch rejects informational responses', async () => {
        expect(await rawFetch('HTTP/1.1 100 Continue\r\n\r\n')).toEqual({ error: 'unsupported http response status' });
    });

    test('fetch keepalive reuses a clean fixed-length connection', async () => {
        expect(await rawFetch('HTTP/1.1 200 OK\r\nContent-Length: 1\r\n\r\na', {
            repeat: true, delayClose: 1500,
        })).toEqual({ status: 200, body: 'a', next: { status: 200, body: 'a' }, connections: 1 });
    });

    test.each([
        ['HTTP/1.1 200 OK\r\nContent-Length: 1\r\n\r\nab', 200, 'a'],
        ['HTTP/1.1 200 OK\r\nTransfer-Encoding: chunked\r\n\r\n1\r\na\r\n0\r\n\r\nextra', 200, 'a'],
        ['HTTP/1.1 204 No Content\r\n\r\nextra', 204, ''],
    ])('fetch excludes trailing bytes and discards the connection: %s', async (response, status, body) => {
        expect(await rawFetch(response, { repeat: true, delayClose: 1500 })).toEqual({
            status, body, next: { status, body }, connections: 2,
        });
    });

    test('chunked decoded bytes respect the exact response body limit', async () => {
        const response = 'HTTP/1.1 200 OK\r\nTransfer-Encoding: chunked\r\n\r\n2\r\nab\r\n2\r\ncd\r\n0\r\n\r\n';
        expect(await rawFetch(response, { limit: 4 })).toEqual({ status: 200, body: 'abcd' });
        expect(await rawFetch(response, { limit: 3 })).toEqual({ error: 'http response body is too large' });
    });

    test('bodyless statuses ignore Content-Length as a body limit', async () => {
        for (const status of [204, 304])
            expect(await rawFetch(`HTTP/1.1 ${status} No Body\r\nContent-Length: 100\r\n\r\n`, { limit: 1 }))
                .toEqual({ status, body: '' });
    });

    test('close-delimited bodies wait for EOF with both fetch binding variants', async () => {
        const response = 'HTTP/1.1 200 OK\r\n\r\ncomplete body';
        expect(await rawFetch(response, { delayClose: 40 })).toEqual({ status: 200, body: 'complete body' });
        expect(await rawFetch(response, { requestObject: true })).toEqual({ status: 200, body: 'complete body' });
        expect(await rawFetch(response, { delayClose: 1500 })).toEqual({ error: 'read timed out' });
    });

    test('negative fetch body limits reject before connecting', async () => {
        expect(await rawFetch('HTTP/1.1 200 OK\r\n\r\n', { limit: -1 }))
            .toEqual({ error: 'max_response_body_size must be non-negative' });
    });
});
