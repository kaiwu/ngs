import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { startNginx, stopNginx, cleanupRuntime, TEST_URL } from "../harness.js";
import crypto from "crypto";

const MODULE = "http_authorization_secure_link_hash";
const SECRET_KEY = "my_secure_secret";

function generateSecureLink(uri) {
  return crypto.createHash("md5").update(uri + SECRET_KEY).digest("base64url");
}

describe("http authorization secure_link_hash", () => {
  beforeAll(async () => {
    await startNginx(`dist/${MODULE}/nginx.conf`, MODULE);
  });

  afterAll(async () => {
    await stopNginx();
    cleanupRuntime(MODULE);
  });

  describe("without cookie", () => {
    test("redirects with Set-Cookie header", async () => {
      const res = await fetch(`${TEST_URL}/secure/resource`, {
        redirect: "manual",
      });

      expect(res.status).toBe(302);
      const setCookie = res.headers.get("Set-Cookie");
      expect(setCookie).toBeTruthy();
      expect(setCookie).toContain("secure_link=");
    });

    test("redirect location matches original URI", async () => {
      const res = await fetch(`${TEST_URL}/secure/data`, {
        redirect: "manual",
      });

      expect(res.status).toBe(302);
      // njs r.return(302, uri) produces absolute URL
      expect(res.headers.get("Location")).toBe(`${TEST_URL}/secure/data`);
    });
  });

  describe("with valid cookie", () => {
    test("allows access to backend with correct hash", async () => {
      const uri = "/secure/resource";
      const hash = generateSecureLink(uri);

      const res = await fetch(`${TEST_URL}${uri}`, {
        headers: { Cookie: `secure_link=${hash}` },
      });

      expect(res.status).toBe(200);
      const body = await res.text();
      expect(body).toContain("BACKEND OK");
    });

    test("allows access with cookie among other cookies", async () => {
      const uri = "/secure/api/data";
      const hash = generateSecureLink(uri);

      const res = await fetch(`${TEST_URL}${uri}`, {
        headers: { Cookie: `session=abc123; secure_link=${hash}; other=value` },
      });

      expect(res.status).toBe(200);
    });
  });

  describe("with invalid cookie", () => {
    test("redirects with wrong hash value", async () => {
      const res = await fetch(`${TEST_URL}/secure/resource`, {
        redirect: "manual",
        headers: { Cookie: "secure_link=invalid_hash" },
      });

      expect(res.status).toBe(302);
    });

    test("redirects when hash is for different URI", async () => {
      const hash = generateSecureLink("/secure/other");

      const res = await fetch(`${TEST_URL}/secure/resource`, {
        redirect: "manual",
        headers: { Cookie: `secure_link=${hash}` },
      });

      expect(res.status).toBe(302);
    });

    test("redirects with empty cookie value", async () => {
      const res = await fetch(`${TEST_URL}/secure/resource`, {
        redirect: "manual",
        headers: { Cookie: "secure_link=" },
      });

      expect(res.status).toBe(302);
    });
  });

  describe("cookie flow", () => {
    test("full redirect flow works", async () => {
      const uri = "/secure/protected";

      const firstRes = await fetch(`${TEST_URL}${uri}`, {
        redirect: "manual",
      });
      expect(firstRes.status).toBe(302);

      const setCookie = firstRes.headers.get("Set-Cookie");
      const cookieValue = setCookie.split(";")[0];

      const secondRes = await fetch(`${TEST_URL}${uri}`, {
        headers: { Cookie: cookieValue },
      });
      expect(secondRes.status).toBe(200);
      expect(await secondRes.text()).toContain("BACKEND OK");
    });
  });
});
