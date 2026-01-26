import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import {
  startNginx,
  stopNginx,
  cleanupRuntime,
  TEST_URL,
} from "../harness.js";

const MODULE = "http_certs_fetch_https";

describe("http_certs_fetch_https", () => {
  beforeAll(async () => {
    await startNginx(`dist/${MODULE}/nginx.conf`, MODULE);
  });

  afterAll(async () => {
    await stopNginx();
    cleanupRuntime(MODULE);
  });

  test("fetches nginx.org over HTTPS", async () => {
    const res = await fetch(`${TEST_URL}/`);
    const text = await res.text();
    expect(res.status).toBe(200);
    expect(text).toContain("NGINX.ORG");
  });
});
