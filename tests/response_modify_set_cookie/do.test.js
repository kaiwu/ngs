import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { startNginx, stopNginx, cleanupRuntime, TEST_URL } from "../harness.js";

const MODULE = "http_response_modify_set_cookie";

describe("http response modify_set_cookie", () => {
  beforeAll(async () => {
    await startNginx(`dist/${MODULE}/nginx.conf`, MODULE);
  });

  afterAll(async () => {
    await stopNginx();
    cleanupRuntime(MODULE);
  });

  test("filters out short Set-Cookie headers", async () => {
    // Without filter, upstream returns: XXXXXX (6), BB (2), YYYYYYY (7)
    // With ?len=5, only cookies longer than 5 chars should remain: XXXXXX, YYYYYYY
    const res = await fetch(`${TEST_URL}/modify_cookies?len=5`);
    expect(res.status).toBe(200);
    
    const cookies = res.headers.getSetCookie();
    expect(cookies).toContain("XXXXXX");
    expect(cookies).toContain("YYYYYYY");
    expect(cookies).not.toContain("BB");
  });

  test("keeps all cookies when len=0", async () => {
    const res = await fetch(`${TEST_URL}/modify_cookies?len=0`);
    expect(res.status).toBe(200);
    
    const cookies = res.headers.getSetCookie();
    expect(cookies.length).toBe(3);
  });

  test("filters all short cookies with high len", async () => {
    // With ?len=10, no cookies should remain (max is 7 chars)
    const res = await fetch(`${TEST_URL}/modify_cookies?len=10`);
    expect(res.status).toBe(200);
    
    const cookies = res.headers.getSetCookie();
    expect(cookies.length).toBe(0);
  });
});
