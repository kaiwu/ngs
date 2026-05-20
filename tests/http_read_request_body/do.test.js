import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { startNginx, stopNginx, cleanupRuntime, TEST_URL } from "../harness.js";

const MODULE = "http_read_request_body";

describe("http_read_request_body", () => {
  beforeAll(async () => {
    await startNginx(`dist/${MODULE}/nginx.conf`, MODULE);
  });

  afterAll(async () => {
    await stopNginx();
    cleanupRuntime(MODULE);
  });

  test("readRequestText echoes body as string", async () => {
    const res = await fetch(`${TEST_URL}/text`, {
      method: "POST",
      body: "hello njs",
    });
    expect(res.status).toBe(200);
    expect(await res.text()).toBe("hello njs");
  });

  test("readRequestArrayBuffer echoes body via buffer view", async () => {
    const res = await fetch(`${TEST_URL}/buffer`, {
      method: "POST",
      body: "buffer body",
    });
    expect(res.status).toBe(200);
    expect(await res.text()).toBe("buffer body");
  });

  test("readRequestJSON parses body and extracts field", async () => {
    const res = await fetch(`${TEST_URL}/json`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ msg: "from json" }),
    });
    expect(res.status).toBe(200);
    expect(await res.text()).toBe("from json");
  });

  test("decline passes through to next handler", async () => {
    const res = await fetch(`${TEST_URL}/decline`, { method: "GET" });
    expect(res.status).toBe(200);
    expect(await res.text()).toBe("passed\n");
  });
});
