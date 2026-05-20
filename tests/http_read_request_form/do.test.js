import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { startNginx, stopNginx, cleanupRuntime, TEST_URL } from "../harness.js";

const MODULE = "http_read_request_form";

describe("http_read_request_form", () => {
  beforeAll(async () => {
    await startNginx(`dist/${MODULE}/nginx.conf`, MODULE);
  });

  afterAll(async () => {
    await stopNginx();
    cleanupRuntime(MODULE);
  });

  test("urlencoded form: get, has, getAll, hasFiles", async () => {
    const res = await fetch(`${TEST_URL}/urlencoded`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: "a=hello&b=one&b=two",
    });
    expect(res.status).toBe(200);
    expect(await res.text()).toBe(
      "a=hello has_b=true b_all=one,two has_files=false upload=none"
    );
  });

  test("multipart form: text fields, file detection, and FormFile name", async () => {
    const body = new FormData();
    body.append("a", "world");
    body.append("b", "only");
    body.append("upload", new Blob(["data"]), "test.txt");

    const res = await fetch(`${TEST_URL}/multipart`, {
      method: "POST",
      body,
    });
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toContain("a=world");
    expect(text).toContain("has_b=true");
    expect(text).toContain("has_files=true");
    expect(text).toContain("upload=test.txt");
  });

  test("maxKeys parses successfully within limit", async () => {
    const res = await fetch(`${TEST_URL}/max-keys`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: "a=only",
    });
    expect(res.status).toBe(200);
    expect(await res.text()).toBe("a=only b=null");
  });

  test("maxKeys throws when limit exceeded", async () => {
    const res = await fetch(`${TEST_URL}/max-keys`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: "a=first&b=second",
    });
    expect(res.status).toBe(500);
  });
});
