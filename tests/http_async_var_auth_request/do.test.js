import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { startNginx, stopNginx, cleanupRuntime, TEST_URL } from "../harness.js";

const MODULE = "http_async_var_auth_request";

const req = async (path, init = {}) => {
  const res = await fetch(`${TEST_URL}${path}`, init);
  const text = await res.text();
  return { status: res.status, text }; 
};

describe("http_async_var_auth_request", () => {
  beforeAll(async () => {
    await startNginx(`dist/${MODULE}/nginx.conf`, MODULE);
  });

  afterAll(async () => {
    await stopNginx();
    cleanupRuntime(MODULE);
  });

  test("routes to backend A when path includes /a", async () => {
    const res = await req(`/secure/a/resource`);
    expect(res.status).toBe(200);
    expect(res.text).toBe("BACKEND A:/secure/a/resource\n");
  });

  test("routes to backend B otherwise", async () => {
    const res = await req(`/secure/b/resource`);
    expect(res.status).toBe(200);
    expect(res.text).toBe("BACKEND B:/secure/b/resource\n");
  });
});
