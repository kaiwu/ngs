import { afterAll, beforeAll, describe, expect, test } from 'bun:test';
import { build } from 'esbuild';
import { createCipheriv } from 'node:crypto';
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { connect } from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { cleanupRuntime, expectedNjsVersion, startNginx, stopNginx, TEST_URL } from '../harness.js';
import { startTransport } from './transport.js';

const moduleName = 'njs_1_0_3';
const dist = 'dist/' + moduleName;
const expectedVersion = expectedNjsVersion();
const preview = test.skipIf(expectedVersion < 0x010003);
let transport;
let stateDir;

async function body(path, method = 'GET') {
    const res = await fetch(TEST_URL + path, { method, signal: AbortSignal.timeout(3000) });
    const text = await res.text();
    expect(res.status, text).toBe(200);
    return text;
}

async function json(path, method) {
    return JSON.parse(await body(path, method));
}

describe('njs upgrade contracts in QuickJS', () => {
    beforeAll(async () => {
        mkdirSync(dist + '/njs', { recursive: true });
        await build({
            entryPoints: ['tests/njs_1_0_3/handler.mjs'], outfile: dist + '/njs/app.js',
            bundle: true, format: 'esm', target: 'es2020', external: ['querystring', 'crypto', 'fs', 'xml', 'zlib', 'buffer'],
        });
        transport = await startTransport();
        writeFileSync(dist + '/transport.conf', transport.config);
        writeFileSync(dist + '/stream-transport.conf', transport.streamConfig);
        stateDir = mkdtempSync(join(tmpdir(), 'ngs-shared-dict-'));
        writeFileSync(dist + '/persistence.conf',
            `js_shared_dict_zone zone=saved:512k timeout=1m "state=${stateDir}/state.json";\n`);
        copyFileSync('tests/njs_1_0_3/nginx.conf', dist + '/nginx.conf');
        await startNginx(dist + '/nginx.conf', moduleName);
        expect(await json('/')).toEqual({ engine: 'QuickJS', number: expectedVersion });
    });
    afterAll(async () => {
        try { await stopNginx(); } finally {
            await transport?.stop();
            if (stateDir) rmSync(stateDir, { recursive: true, force: true });
            cleanupRuntime(moduleName);
        }
    });

    test('request and querystring bindings preserve case and repeated values', async () => {
        const result = await json('/args?team=alpha&Team=other&team=beta&empty=');
        const expected = { team: ['alpha', 'beta'], Team: 'other', empty: '' };
        expect(result.parsed).toEqual(expected);
        expect(result.decoded).toEqual(expected);
    });

    test('a selected forward proxy tunnels HTTPS to the local TLS origin', async () => {
        const before = transport.connects.length;
        expect(await body('/proxied-tls')).toBe('TLS origin /sample');
        expect(transport.connects.slice(before)).toEqual([transport.address]);
    });

    test('stream access fetches over verified TLS and deferred sends reach both peers', async () => {
        const client = connect(18889, '127.0.0.1');
        client.setTimeout(3000, () => client.destroy(new Error('stream reply timed out')));
        try {
            client.write('go');
            let reply = '';
            client.setEncoding('utf8');
            for await (const chunk of client) reply += chunk;
            expect(reply).toStartWith('TLS origin /stream\nHTTP/1.1 200 OK\r\n');
            expect(reply).toEndWith('\r\n\r\nstream peer\n');
        } finally {
            client.destroy();
        }
    });

    preview('an empty proxy variable connects directly to the same verified TLS origin', async () => {
        const before = transport.connects.length;
        expect(await body('/direct-tls')).toBe('TLS origin /sample');
        expect(transport.connects.length).toBe(before);
    });

    preview('query parsing splits before decoding and returns null-prototype objects', async () => {
        const result = await json('/args?label=salt+%26+pepper&x%3Dy=1&x%3Dy=2&=empty&toString=field');
        const expected = { label: 'salt & pepper', 'x=y': ['1', '2'], '': 'empty', toString: 'field' };
        expect(result).toEqual({ parsed: expected, decoded: expected, nullPrototype: true, moduleNullPrototype: true });
    });

    preview('both parsers keep the character following an invalid UTF-8 unit', async () => {
        const result = await json('/args?word=%E2%82%41+end');
        expect(result.parsed.word).toBe('\uFFFDA end');
        expect(result.decoded.word).toBe('\uFFFDA end');
    });

    preview('request args accept the thousandth segment and omit the next', async () => {
        const result = await json('/args?' + 'k=v&'.repeat(999) + 'last=yes&extra=no');
        expect(result.parsed.k).toHaveLength(999);
        expect(result.parsed.last).toBe('yes');
        expect(result.parsed).not.toHaveProperty('extra');
    });

    preview('digest returns chainable promises for success and validation errors', async () => {
        expect(await json('/digest')).toEqual({
            hex: 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad', invalid: 'TypeError',
        });
    });

    preview('HMAC rejects an empty raw key and accepts a valid signing key', async () => {
        expect(await json('/hmac')).toEqual({ invalid: 'TypeError', usable: ['sign'] });
    });

    preview('TextDecoder handles a split leading BOM and resets after a no-input flush', async () => {
        expect(await json('/decode')).toEqual(['', 'A', '\uFEFFB', '', '\uFFFD', 'C', '']);
    });

    preview('only the reply exposes the executing parent and the child receives the encoded argument', async () => {
        expect(await json('/reply')).toEqual({ status: 200, sameParent: true, child: { hasParent: false, label: 'a & b' } });
    });

    preview('Fetch constructors copy headers and expose body consumption', async () => {
        expect(await json('/fetch')).toEqual({ requestHeader: 'original', responseHeader: 'original', sameHeaders: true,
            bodyUsedBefore: false, body: 'response', bodyUsedAfter: true, requestBody: 'body' });
    });

    preview('cancelling the same timeout twice leaves another timer runnable', async () => {
        expect(await json('/timer')).toEqual(['active']);
    });

    preview('expired dictionary entries are absent to delete, add and increment', async () => {
        expect(await json('/seed')).toBe(42);
        const deadline = Date.now() + 2000;
        while (!(await json('/expired'))) {
            if (Date.now() >= deadline) throw new Error('shared dictionary entry did not expire');
            await Bun.sleep(10);
        }
        expect(await json('/update')).toEqual({ deleted: false, added: true, value: 0, increment: 10, stored: 10 });
    });

    test('state file restores a live value and its original expiration on restart', async () => {
        expect(await json('/saved')).toBeNull();
        const written = await json('/saved', 'POST');
        expect(written.value).toBe('kept');
        const file = join(stateDir, 'state.json');
        const deadline = Date.now() + 3000;
        while (!existsSync(file)) {
            if (Date.now() >= deadline) throw new Error('shared dictionary snapshot was not published');
            await Bun.sleep(25);
        }
        const snapshot = JSON.parse(readFileSync(file, 'utf8'));
        expect(snapshot.marker.value).toBe('kept');
        expect(snapshot.marker.expire).toBeGreaterThan(Date.now());
        await stopNginx();
        await startNginx(dist + '/nginx.conf', moduleName);
        const beforeRead = Date.now();
        const restored = await json('/saved');
        expect(restored.value).toBe('kept');
        expect(restored.ttl).toBeGreaterThan(0);
        // nginx caches the current millisecond within an event-loop iteration.
        expect(beforeRead + restored.ttl).toBeLessThanOrEqual(snapshot.marker.expire + 100);
        expect(Date.now() + restored.ttl).toBeGreaterThanOrEqual(snapshot.marker.expire - 100);
    });

    // Executable acceptance tests for the pending ngs binding changes.
    test.todo('bundled ngx query helpers round-trip duplicate and empty values', async () => {
        expect(await json('/query-helpers')).toEqual({ tag: ['a & b', ''] });
    });

    test.todo('dictionary reads and pops return typed Results and replace accepts DictItem', async () => {
        expect(await json('/dict-values')).toEqual({ zero: 0, replaced: true, popped: 3, missing: true, secondPopMissing: true });
    });

    test.todo('dictionary collection metrics are numbers and items contain typed pairs', async () => {
        expect(await json('/dict-collection')).toEqual({ size: 1, free: 'number', key: 'sample', value: 17 });
    });

    test.todo('Gleam AES-GCM options authenticate AAD and honor a 96-bit tag', async () => {
        const cipher = createCipheriv('aes-128-gcm', Buffer.alloc(16), Buffer.alloc(12), { authTagLength: 12 });
        cipher.setAAD(Buffer.from('fixture AAD'));
        const expected = Buffer.concat([cipher.update('message'), cipher.final(), cipher.getAuthTag()]);
        expect(await json('/gcm')).toBe(expected.toString('hex'));
    });

    test.todo('Fetch header lookup distinguishes an empty value from a missing header', async () => {
        expect(await json('/optional-headers')).toEqual({ empty: '', missing: true });
    });
});
