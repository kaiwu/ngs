import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { startNginx, stopNginx, cleanupRuntime, TEST_URL } from "../harness.js";

const MODULE = "http_async_var_js_header_filter";

const req = async (path) => {
  const res = await fetch(`${TEST_URL}${path}`);
  return {
    status: res.status,
    text: await res.text(),
    header: res.headers.get("x-async-header"),
  };
};

describe("http_async_var_js_header_filter", () => {
  beforeAll(async () => {
    await startNginx(`dist/${MODULE}/nginx.conf`, MODULE);
  });

  afterAll(async () => {
    await stopNginx();
    cleanupRuntime(MODULE);
  });

  test("sets upper header when path contains upper", async () => {
    const res = await req("/upper/path");
    expect(res.status).toBe(200);
    expect(res.text).toBe("OK");
    expect(res.header).toBe("X-UPPER");
  });

  test("sets lower header otherwise", async () => {
    const res = await req("/lower/path");
    expect(res.status).toBe(200);
    expect(res.text).toBe("OK");
    expect(res.header).toBe("x-lower");
  });
});
