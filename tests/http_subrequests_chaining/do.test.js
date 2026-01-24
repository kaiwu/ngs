import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { startNginx, stopNginx, cleanupRuntime, TEST_URL } from "../harness.js";

const MODULE = "http_subrequests_chaining";

const req = async (path) => {
  const res = await fetch(`${TEST_URL}${path}`);
  return { status: res.status, text: await res.text() };
};

describe("http_subrequests_chaining", () => {
  beforeAll(async () => {
    await startNginx(`dist/${MODULE}/nginx.conf`, MODULE);
  });

  afterAll(async () => {
    await stopNginx();
    cleanupRuntime(MODULE);
  });

  test("chains subrequests sequentially", async () => {
    const res = await req(`/`);
    expect(res.status).toBe(200);
    expect(res.text).toBe("one:one-two");
  });
});
