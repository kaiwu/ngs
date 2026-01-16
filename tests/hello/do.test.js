import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { startNginx, stopNginx, cleanupRuntime, TEST_URL } from "../harness.js";

const MODULE = "http_hello";

describe("http hello", () => {
  beforeAll(async () => {
    await startNginx(`dist/${MODULE}/nginx.conf`, MODULE);
  });

  afterAll(async () => {
    await stopNginx();
    cleanupRuntime(MODULE);
  });

  describe("hello response", () => {
    test("outputs 'hello' text", async () => {
      const res = await fetch(`${TEST_URL}/hello`);
      expect(res.status).toBe(200);
      const body = await res.text();
      expect(body).toBe("Hello World!\n");
    });
  });
});
