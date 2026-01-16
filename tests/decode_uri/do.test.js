import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { startNginx, stopNginx, cleanupRuntime, TEST_URL } from "../harness.js";

const MODULE = "http_decode_uri";

describe("http decode uri", () => {
  beforeAll(async () => {
    await startNginx(`dist/${MODULE}/nginx.conf`, MODULE);
  });

  afterAll(async () => {
    await stopNginx();
    cleanupRuntime(MODULE);
  });

  describe("decode uri response", () => {
    test("outputs 'foo' text", async () => {
      const res = await fetch(`${TEST_URL}/foo?foo=5`);
      expect(res.status).toBe(200);
      const body = await res.text();
      expect(body).toBe("5");
    });

    test("outputs 'foo' text by decode", async () => {
      const res = await fetch(`${TEST_URL}/dec_foo?foo=njs`);
      expect(res.status).toBe(200);
      const body = await res.text();
      expect(body).toBe("njs");
    });
  });
});
