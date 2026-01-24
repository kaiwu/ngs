import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { startNginx, stopNginx, cleanupRuntime, TEST_URL } from "../harness.js";

const MODULE = "misc_aes_gcm";

const req = async (path, init = {}) => {
  const res = await fetch(`${TEST_URL}${path}`, init);
  return { status: res.status, text: await res.text() };
};

describe("misc_aes_gcm", () => {
  beforeAll(async () => {
    await startNginx(`dist/${MODULE}/nginx.conf`, MODULE);
  });

  afterAll(async () => {
    await stopNginx();
    cleanupRuntime(MODULE);
  });

  test("encrypts and decrypts payload", async () => {
    const plaintext = "hello aes gcm";
    const enc = await req("/encrypt", { method: "POST", body: plaintext });
    expect(enc.status).toBe(200);
    expect(enc.text).not.toBe(plaintext);

    const dec = await req("/decrypt", { method: "POST", body: enc.text });
    expect(dec.status).toBe(200);
    expect(dec.text).toBe(plaintext);
  });
});
