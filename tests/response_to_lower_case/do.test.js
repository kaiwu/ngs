import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { startNginx, stopNginx, cleanupRuntime, TEST_URL } from "../harness.js";

const MODULE = "http_response_to_lower_case";

describe("http response to_lower_case", () => {
  beforeAll(async () => {
    await startNginx(`dist/${MODULE}/nginx.conf`, MODULE);
  });

  afterAll(async () => {
    await stopNginx();
    cleanupRuntime(MODULE);
  });

  test("converts response body to lowercase", async () => {
    const res = await fetch(`${TEST_URL}/`);
    expect(res.status).toBe(200);
    const body = await res.text();
    expect(body).toBe("hello world");
  });

  test("converts long mixed-case text to lowercase", async () => {
    const res = await fetch(`${TEST_URL}/long`);
    expect(res.status).toBe(200);
    const body = await res.text();
    expect(body).toBe("the quick brown fox jumps over the lazy dog. abcdefghijklmnopqrstuvwxyz abcdefghijklmnopqrstuvwxyz 0123456789 mixed case text here!");
  });
});
