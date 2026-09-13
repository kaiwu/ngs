import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { startNginx, stopNginx, cleanupRuntime, TEST_URL } from "../harness.js";

const MODULE = "misc_crypto";
const SHA256 = "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad";
const HMAC = "9c196e32dc0175f86f4b1cb89289d6619de6bee699e4c378e68309ed97a1a6ab";

async function request(path) {
    const response = await fetch(`${TEST_URL}${path}`, {
        headers: { Connection: "close" },
        signal: AbortSignal.timeout(3000),
    });
    expect(response.status).toBe(200);
    return response.json();
}

describe("crypto bindings in QuickJS", () => {
    let sync;

    beforeAll(async () => {
        await startNginx(`dist/${MODULE}/nginx.conf`, MODULE);
        sync = await request("/sync");
    });

    afterAll(async () => {
        await stopNginx();
        cleanupRuntime(MODULE);
    });

    test("synchronous hashes and HMACs accept string inputs and encode digests", () => {
        expect(sync.hash_hex).toBe(SHA256);
        expect(sync.hmac_hex).toBe(HMAC);
        expect(sync.hash_base64).toBe(Buffer.from(SHA256, "hex").toString("base64"));
        expect(sync.hash_base64url).toBe(Buffer.from(SHA256, "hex").toString("base64url"));
        expect(sync.hmac_base64).toBe(Buffer.from(HMAC, "hex").toString("base64"));
        expect(sync.hmac_base64url).toBe(Buffer.from(HMAC, "hex").toString("base64url"));
    });

    test("synchronous hashes and HMACs accept and return native buffers", () => {
        expect(sync.hash_buffer).toBe(SHA256);
        expect(sync.hmac_buffer).toBe(HMAC);
    });

    test("hash copies can be updated independently", () => {
        expect(sync.original).toBe(SHA256);
        expect(sync.copy).toBe("a52d159f262b2c6ddb724a61840befc36eb30c88877a4030b65cbe86298449c9");
    });

    test("the native module import preserves global WebCrypto", async () => {
        expect(await request("/async")).toEqual({ hash: SHA256, hmac: HMAC });
    });
});
