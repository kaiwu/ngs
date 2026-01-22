import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { startNginx, stopNginx, cleanupRuntime, TEST_URL } from "../harness.js";
import crypto from "crypto";

const MODULE = "http_authorization_auth_request";
const SECRET_KEY = "my_secret_key";

// Generate HMAC-SHA1 signature for URI + args
function generateSignature(uri, args = "") {
  const data = uri + args;
  return crypto.createHmac("sha1", SECRET_KEY).update(data).digest("base64");
}

describe("http authorization auth_request", () => {
  beforeAll(async () => {
    await startNginx(`dist/${MODULE}/nginx.conf`, MODULE);
  });

  afterAll(async () => {
    await stopNginx();
    cleanupRuntime(MODULE);
  });

  describe("valid signatures", () => {
    test("accepts valid signature for URI without args", async () => {
      const uri = "/secure/resource";
      const signature = generateSignature(uri);

      const res = await fetch(`${TEST_URL}${uri}`, {
        headers: { Signature: signature },
      });

      expect(res.status).toBe(200);
      const body = await res.text();
      expect(body).toContain("BACKEND OK");
    });

    test("accepts valid signature for URI with query args", async () => {
      const uri = "/secure/data";
      const args = "foo=bar&baz=123";
      const signature = generateSignature(uri, args);

      const res = await fetch(`${TEST_URL}${uri}?${args}`, {
        headers: { Signature: signature },
      });

      expect(res.status).toBe(200);
      const body = await res.text();
      expect(body).toContain("BACKEND OK");
    });

    test("accepts valid signature for nested path", async () => {
      const uri = "/secure/api/v1/users";
      const signature = generateSignature(uri);

      const res = await fetch(`${TEST_URL}${uri}`, {
        headers: { Signature: signature },
      });

      expect(res.status).toBe(200);
    });
  });

  describe("invalid signatures", () => {
    test("rejects request without Signature header", async () => {
      const res = await fetch(`${TEST_URL}/secure/resource`);

      expect(res.status).toBe(401);
    });

    test("rejects request with wrong signature", async () => {
      const res = await fetch(`${TEST_URL}/secure/resource`, {
        headers: { Signature: "invalid_signature" },
      });

      expect(res.status).toBe(401);
    });

    test("rejects request with signature for different URI", async () => {
      const signature = generateSignature("/secure/other");

      const res = await fetch(`${TEST_URL}/secure/resource`, {
        headers: { Signature: signature },
      });

      expect(res.status).toBe(401);
    });

    test("rejects request with signature missing query args", async () => {
      // Signature computed without args
      const signature = generateSignature("/secure/data");

      // But request has args
      const res = await fetch(`${TEST_URL}/secure/data?foo=bar`, {
        headers: { Signature: signature },
      });

      expect(res.status).toBe(401);
    });
  });

  describe("method restrictions", () => {
    test("rejects POST requests", async () => {
      const uri = "/secure/resource";
      const signature = generateSignature(uri);

      const res = await fetch(`${TEST_URL}${uri}`, {
        method: "POST",
        headers: { Signature: signature },
      });

      expect(res.status).toBe(401);
    });

    test("rejects PUT requests", async () => {
      const uri = "/secure/resource";
      const signature = generateSignature(uri);

      const res = await fetch(`${TEST_URL}${uri}`, {
        method: "PUT",
        headers: { Signature: signature },
      });

      expect(res.status).toBe(401);
    });
  });
});
