import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { startNginx, stopNginx, cleanupRuntime, TEST_URL } from "../harness.js";

const MODULE = "http_api_set_keyval";

const req = async (path, init = {}) => {
  const res = await fetch(`${TEST_URL}${path}`, init);
  const text = await res.text();
  return { status: res.status, text };
};

describe("http_api_set_keyval", () => {
  beforeAll(async () => {
    await startNginx(`dist/${MODULE}/nginx.conf`, MODULE);
  });

  afterAll(async () => {
    await stopNginx();
    cleanupRuntime(MODULE);
  });

  test("creates and reads a value", async () => {
    const create = await req(`/keyval?key=foo&value=bar`, { method: "POST" });
    expect(create.status).toBe(201);
    expect(create.text).toBe("created\n");

    const read = await req(`/keyval?method=GET&key=foo`);
    expect(read.status).toBe(200);
    expect(read.text).toBe("bar\n");
  });

  test("conflicts on duplicate create", async () => {
    const first = await req(`/keyval?key=dup&value=one`, { method: "POST" });
    expect(first.status).toBe(201);

    const second = await req(`/keyval?key=dup&value=two`, { method: "POST" });
    expect(second.status).toBe(409);
    expect(second.text).toBe("exists\n");
  });

  test("updates existing with PATCH", async () => {
    const create = await req(`/keyval?key=patchme&value=one`, { method: "POST" });
    expect(create.status).toBe(201);

    const patch = await req(`/keyval?method=PATCH&key=patchme&value=two`, {
      method: "POST",
    });
    expect(patch.status).toBe(200);
    expect(patch.text).toBe("updated\n");

    const read = await req(`/keyval?method=GET&key=patchme`);
    expect(read.status).toBe(200);
    expect(read.text).toBe("two\n");
  });

  test("deletes existing key", async () => {
    const create = await req(`/keyval?key=deleteme&value=gone`, { method: "POST" });
    expect(create.status).toBe(201);

    const del = await req(`/keyval?method=DELETE&key=deleteme`, { method: "POST" });
    expect(del.status).toBe(200);
    expect(del.text).toBe("deleted\n");

    const read = await req(`/keyval?method=GET&key=deleteme`);
    expect(read.status).toBe(404);
  });

  test("returns 400 on missing params", async () => {
    const missingKey = await req(`/keyval`);
    expect(missingKey.status).toBe(400);

    const missingValue = await req(`/keyval?method=PATCH&key=novalue`, {
      method: "POST",
    });
    expect(missingValue.status).toBe(400);
  });
});
