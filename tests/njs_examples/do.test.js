import { afterAll, beforeAll, describe, expect, test } from 'bun:test';
import { createHmac } from 'node:crypto';
import { cleanupRuntime, startNginx, stopNginx, TEST_URL } from '../harness.js';

const moduleName = 'njs_examples';
const formType = 'application/x-www-form-urlencoded';
const certDir = 'submodules/njs-examples/njs/http/certs';

function request(path, options = {}) {
    return fetch(TEST_URL + path, { redirect: 'manual', signal: AbortSignal.timeout(3000), ...options });
}

async function expectReply(response, status, body) {
    const text = await response.text();
    expect(response.status, text).toBe(status);
    expect(text).toBe(body);
}

describe('vendored njs-examples in QuickJS', () => {
    beforeAll(() => startNginx('tests/njs_examples/nginx.conf', moduleName));
    afterAll(async () => { await stopNginx(); cleanupRuntime(moduleName); });

    test('signed POST reaches the backend with the exact form body', async () => {
        const body = 'label=Salt+%26+Pepper';
        const signature = createHmac('sha1', 'example-test-key').update('/secure/order' + body).digest('base64');
        const options = { method: 'POST', body, headers: { 'Content-Type': formType, Signature: signature } };
        await expectReply(await request('/secure/order', options), 200, 'BACKEND:POST:/secure/order:' + body + '\n');
        await expectReply(await request('/secure/order', { method: 'POST', body }), 401, 'No signature\n');
    });

    test('remote authorization propagates the user, denies an unknown token and redirects a guest', async () => {
        await expectReply(await request('/protected/?token=t-alice'), 200, 'Hello alice\n');
        await expectReply(await request('/protected/?token=t-unknown'), 403, 'Access denied\n');
        const guest = await request('/protected/');
        expect(guest.status).toBe(302);
        expect(guest.headers.get('location')).toBe('https://idp.example.com/login?rd=%2Fprotected%2F');
    });

    test('access-phase quota is per bearer key and returns Retry-After', async () => {
        const as = token => request('/api/', { headers: { Authorization: 'Bearer ' + token } });
        await expectReply(await request('/api/'), 401, 'missing bearer token\n');
        for (let i = 0; i < 5; i++) await expectReply(await as('alpha'), 200, 'welcome alpha\n');
        const limited = await as('alpha');
        expect(limited.headers.get('retry-after')).toBe('10');
        await expectReply(limited, 429, 'rate limit exceeded (6/5)\n');
        await expectReply(await as('beta'), 200, 'welcome beta\n');
    });

    test('form region selects the backend and unsupported regions or uploads stop at access', async () => {
        const submit = region => request('/submit', {
            method: 'POST', headers: { 'Content-Type': formType }, body: 'region=' + region,
        });
        await expectReply(await submit('us'), 200, 'BACKEND 8081:/submit\n');
        await expectReply(await submit('eu'), 200, 'BACKEND 8082:/submit\n');
        await expectReply(await submit('unknown'), 400, 'unknown region: unknown\n');
        const form = new FormData();
        form.set('region', 'us');
        form.set('file', new Blob(['sample']), 'example.txt');
        await expectReply(await request('/submit', { method: 'POST', body: form }), 403, 'file uploads not allowed\n');
    });

    test('upstream DER vector decodes integers, strings and object identifiers', async () => {
        const response = await request('/der', { method: 'POST', body: Bun.file(certDir + '/js/test.der') });
        expect(response.status).toBe(200);
        expect(await response.json()).toEqual([0, -137878, '029c0b3400977a9bdf97', 'printable string',
            'is5 string', 'αβγδ', '9', '4f2606']);
    });

    test('upstream client certificate exposes both IP and both DNS SANs', async () => {
        const response = await request('/san', {
            method: 'POST', body: Bun.file(certDir + '/ca/intermediate/certs/client.cert.pem'),
        });
        expect(response.status).toBe(200);
        expect(await response.json()).toEqual(['7f000001', '00000000000000000000000000000001',
            'example.com', 'www2.example.com']);
    });
});
