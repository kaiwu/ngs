import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { startNginx, stopNginx, cleanupRuntime, TEST_URL } from "../harness.js";

const MODULE = "http_complex_redirects";

const req = async (baseUrl, path, init = {}) => {
  const res = await fetch(`${baseUrl}${path}`, init);
  return { status: res.status, text: await res.text() };
};

describe("http_complex_redirects", () => {
  beforeAll(async () => {
    await startNginx(`dist/${MODULE}/nginx.conf`, MODULE);
  });

  afterAll(async () => {
    await stopNginx();
    cleanupRuntime(MODULE);
  });

  test("proxies to original uri when no mapping", async () => {
    const res = await req(TEST_URL, "/foo");
    expect(res.status).toBe(200);
    expect(res.text).toBe("/proxy/foo");
  });

  test("adds mapping and routes through resolver", async () => {
    const add = await req("http://127.0.0.1:8090", "/add", {
      method: "POST",
      body: JSON.stringify({ from: "/foo", to: "/bar" }),
    });
    expect(add.status).toBe(200);

    const res = await req(TEST_URL, "/foo");
    expect(res.status).toBe(200);
    expect(res.text).toBe("/proxy/bar");
  });

  test("removes mapping and routes to original", async () => {
    const remove = await req("http://127.0.0.1:8090", "/remove", {
      method: "POST",
      body: JSON.stringify({ from: "/foo" }),
    });
    expect(remove.status).toBe(200);

    const res = await req(TEST_URL, "/foo");
    expect(res.status).toBe(200);
    expect(res.text).toBe("/proxy/foo");
  });
});
