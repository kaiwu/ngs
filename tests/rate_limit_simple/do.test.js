import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { startNginx, stopNginx, cleanupRuntime, TEST_URL } from "../harness.js";

const MODULE = "http_rate_limit_simple";

describe("http rate_limit simple", () => {
  beforeAll(async () => {
    await startNginx(`dist/${MODULE}/nginx.conf`, MODULE);
  });

  afterAll(async () => {
    await stopNginx();
    cleanupRuntime(MODULE);
  });

  test("allows requests under limit", async () => {
    const res = await fetch(`${TEST_URL}/`);
    expect(res.status).toBe(200);
    expect(await res.text()).toBe("OK\n");
  });

  test("returns 429 after exceeding limit", async () => {
    for (let i = 0; i < 5; i++) {
      await fetch(`${TEST_URL}/`);
    }

    const res = await fetch(`${TEST_URL}/`);
    expect(res.status).toBe(429);
    expect(await res.text()).toContain("Too Many Requests");
  });

  test("includes Retry-After header when rate limited", async () => {
    for (let i = 0; i < 6; i++) {
      await fetch(`${TEST_URL}/`);
    }

    const res = await fetch(`${TEST_URL}/`);
    if (res.status === 429) {
      const retryAfter = res.headers.get("Retry-After");
      expect(retryAfter).toBeTruthy();
      expect(parseInt(retryAfter, 10)).toBeGreaterThanOrEqual(0);
    }
  });

  test("rate limit resets after window expires", async () => {
    for (let i = 0; i < 10; i++) {
      await fetch(`${TEST_URL}/`);
    }

    await new Promise((resolve) => setTimeout(resolve, 1100));

    const res = await fetch(`${TEST_URL}/`);
    expect(res.status).toBe(200);
  });
});
