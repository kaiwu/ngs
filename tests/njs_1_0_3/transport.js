import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { createServer } from 'node:http';
import { connect } from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

// One TLS origin and a CONNECT proxy that can reach only that origin.
export async function startTransport() {
    const dir = mkdtempSync(join(tmpdir(), 'ngs-fetch-'));
    const cert = join(dir, 'cert.pem');
    const key = join(dir, 'key.pem');
    const tunnels = new Set();
    const connects = [];
    let origin;
    const proxy = createServer();
    async function stop() {
        for (const socket of tunnels) socket.destroy();
        if (proxy.listening) await new Promise(resolve => proxy.close(resolve));
        if (origin) await origin.stop(true);
        rmSync(dir, { recursive: true, force: true });
    }
    try {
        execFileSync('openssl', ['req', '-x509', '-newkey', 'rsa:2048', '-nodes', '-days', '1',
            '-subj', '/CN=127.0.0.1', '-addext', 'subjectAltName=IP:127.0.0.1,DNS:127.0.0.1',
            '-keyout', key, '-out', cert], { stdio: ['ignore', 'ignore', 'pipe'] });
        origin = Bun.serve({ hostname: '127.0.0.1', port: 0, tls: { cert: readFileSync(cert), key: readFileSync(key) },
            fetch: req => new Response('TLS origin ' + new URL(req.url).pathname) });
        const address = '127.0.0.1:' + origin.port;
        proxy.on('connect', (req, client, head) => {
            connects.push(req.url);
            if (req.url !== address) return client.destroy();
            const peer = connect(origin.port, '127.0.0.1', () => {
                client.write('HTTP/1.1 200 Connection Established\r\n\r\n');
                if (head.length) peer.write(head);
                client.pipe(peer).pipe(client);
            });
            for (const [socket, other] of [[peer, client], [client, peer]]) {
                tunnels.add(socket);
                socket.on('error', () => other.destroy());
                socket.on('close', () => { tunnels.delete(socket); other.destroy(); });
            }
        });
        await new Promise((resolve, reject) => {
            proxy.once('error', reject);
            proxy.listen(0, '127.0.0.1', resolve);
        });
        const config = `
            set $tls_origin https://${address}/sample;
            js_fetch_trusted_certificate "${cert}";
            location = /direct-tls {
                set $proxy_address "";
                js_fetch_proxy $proxy_address;
                js_content main.fetchTls;
            }
            location = /proxied-tls {
                set $proxy_address http://127.0.0.1:${proxy.address().port};
                js_fetch_proxy $proxy_address;
                js_content main.fetchTls;
            }
        `;
        const streamConfig = `js_var $tls_origin https://${address}/stream;
            js_fetch_trusted_certificate "${cert}";`;
        return { config, streamConfig, address, connects, stop };
    } catch (error) {
        await stop();
        throw error;
    }
}
