import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { startNginx, stopNginx, cleanupRuntime, TEST_URL } from "../harness.js";

const MODULE = "http_logging_num_requests";

describe("http logging num_requests", () => {
  beforeAll(async () => {
    await startNginx(`dist/${MODULE}/nginx.conf`, MODULE);
  });

  afterAll(async () => {
    await stopNginx();
    cleanupRuntime(MODULE);
  });

  test("returns request count starting at 1", async () => {
    const res = await fetch(`${TEST_URL}/count`);
    expect(res.status).toBe(200);
    const count = parseInt(await res.text(), 10);
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test("increments count on subsequent requests", async () => {
    const res1 = await fetch(`${TEST_URL}/count`);
    const count1 = parseInt(await res1.text(), 10);

    const res2 = await fetch(`${TEST_URL}/count`);
    const count2 = parseInt(await res2.text(), 10);

    expect(count2).toBe(count1 + 1);
  });

  test("includes count in response body", async () => {
    const res = await fetch(`${TEST_URL}/`);
    expect(res.status).toBe(200);
    const body = await res.text();
    expect(body).toMatch(/Request count: \d+/);
  });

  test("count persists across multiple requests", async () => {
    const counts = [];
    for (let i = 0; i < 5; i++) {
      const res = await fetch(`${TEST_URL}/count`);
      counts.push(parseInt(await res.text(), 10));
    }

    for (let i = 1; i < counts.length; i++) {
      expect(counts[i]).toBe(counts[i - 1] + 1);
    }
  });
});
