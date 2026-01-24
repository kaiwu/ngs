import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { startNginx, stopNginx, cleanupRuntime, TEST_URL } from "../harness.js";

const MODULE = "http_complex_redirects";

const req = async (path, init = {}) => {
  const res = await fetch(`${TEST_URL}${path}`, {
    redirect: "manual",
    ...init,
  });
  return {
    status: res.status,
    location: res.headers.get("location"),
    text: await res.text(),
  };
};

describe("http_complex_redirects", () => {
  beforeAll(async () => {
    await startNginx(`dist/${MODULE}/nginx.conf`, MODULE);
  });

  afterAll(async () => {
    await stopNginx();
    cleanupRuntime(MODULE);
  });

  test("redirects to /a when uri contains to_a", async () => {
    const res = await req("/foo/to_a");
    expect(res.status).toBe(302);
    expect(res.location).toBe("/a");
  });

  test("redirects to /b otherwise", async () => {
    const res = await req("/foo/to_b");
    expect(res.status).toBe(302);
    expect(res.location).toBe("/b");
  });

  test("follow to /a returns body", async () => {
    const step1 = await req("/foo/to_a");
    expect(step1.location).toBe("/a");
    const res = await fetch(`${TEST_URL}${step1.location}`);
    expect(res.status).toBe(200);
    expect(await res.text()).toBe("A");
  });

  test("follow to /b returns body", async () => {
    const step1 = await req("/foo/to_b");
    expect(step1.location).toBe("/b");
    const res = await fetch(`${TEST_URL}${step1.location}`);
    expect(res.status).toBe(200);
    expect(await res.text()).toBe("B");
  });
});
