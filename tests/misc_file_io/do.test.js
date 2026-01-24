import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { startNginx, stopNginx, cleanupRuntime, TEST_URL } from "../harness.js";

const MODULE = "misc_file_io";

const req = async (path, init = {}) => {
  const res = await fetch(`${TEST_URL}${path}`, init);
  const text = await res.text();
  return { status: res.status, text };
};

describe("misc_file_io", () => {
  beforeAll(async () => {
    await startNginx(`dist/${MODULE}/nginx.conf`, MODULE);
  });

  afterAll(async () => {
    await stopNginx();
    cleanupRuntime(MODULE);
  });

  test("flush, append, read, flush", async () => {
    // ensure clean
    const flush1 = await req(`/flush`, { method: "POST" });
    expect(flush1.status).toBe(200);

    const readEmpty = await req(`/read`);
    expect(readEmpty.status).toBe(200);
    expect(readEmpty.text).toBe("");

    const pushA = await req(`/push`, { method: "POST", body: "AAA" });
    expect(pushA.status).toBe(200);

    const pushB = await req(`/push`, { method: "POST", body: "BBB" });
    expect(pushB.status).toBe(200);

    const readData = await req(`/read`);
    expect(readData.status).toBe(200);
    expect(readData.text).toBe("AAABBB");

    const flush2 = await req(`/flush`, { method: "POST" });
    expect(flush2.status).toBe(200);

    const readAfterFlush = await req(`/read`);
    expect(readAfterFlush.status).toBe(200);
    expect(readAfterFlush.text).toBe("");
  });

  test("async flush, append, read, flush", async () => {
    const flush1 = await req(`/flush_async`, { method: "POST" });
    expect(flush1.status).toBe(200);

    const readEmpty = await req(`/read_async`);
    expect(readEmpty.status).toBe(200);
    expect(readEmpty.text).toBe("");

    const pushA = await req(`/push_async`, { method: "POST", body: "AAA" });
    expect(pushA.status).toBe(200);

    const pushB = await req(`/push_async`, { method: "POST", body: "BBB" });
    expect(pushB.status).toBe(200);

    const readData = await req(`/read_async`);
    expect(readData.status).toBe(200);
    expect(readData.text).toBe("AAABBB");

    const flush2 = await req(`/flush_async`, { method: "POST" });
    expect(flush2.status).toBe(200);

    const readAfterFlush = await req(`/read_async`);
    expect(readAfterFlush.status).toBe(200);
    expect(readAfterFlush.text).toBe("");
  });
});
