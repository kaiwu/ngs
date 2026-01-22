import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { startNginx, stopNginx, cleanupRuntime, TEST_URL } from "../harness.js";

const MODULE = "http_authorization_request_body";

describe("http authorization request_body", () => {
  beforeAll(async () => {
    await startNginx(`dist/${MODULE}/nginx.conf`, MODULE);
  });

  afterAll(async () => {
    await stopNginx();
    cleanupRuntime(MODULE);
  });

  describe("valid request body", () => {
    test("accepts valid JSON with token field", async () => {
      const res = await fetch(`${TEST_URL}/secure/resource`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: "valid-token-123" }),
      });

      expect(res.status).toBe(200);
      const body = await res.text();
      expect(body).toContain("BACKEND OK");
    });

    test("accepts token with additional fields in body", async () => {
      const res = await fetch(`${TEST_URL}/secure/data`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: "my-auth-token",
          data: { key: "value" },
          extra: 123,
        }),
      });

      expect(res.status).toBe(200);
      const body = await res.text();
      expect(body).toContain("BACKEND OK");
    });
  });

  describe("invalid request body", () => {
    test("rejects empty request body", async () => {
      const res = await fetch(`${TEST_URL}/secure/resource`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "",
      });

      expect(res.status).toBe(403);
      const body = await res.text();
      expect(body).toContain("Forbidden");
      expect(body).toContain("Empty request body");
    });

    test("rejects invalid JSON", async () => {
      const res = await fetch(`${TEST_URL}/secure/resource`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "not valid json",
      });

      expect(res.status).toBe(403);
      const body = await res.text();
      expect(body).toContain("Forbidden");
      expect(body).toContain("Invalid JSON");
    });

    test("rejects JSON without token field", async () => {
      const res = await fetch(`${TEST_URL}/secure/resource`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: "alice", action: "read" }),
      });

      expect(res.status).toBe(403);
      const body = await res.text();
      expect(body).toContain("Forbidden");
    });

    test("rejects JSON with empty token", async () => {
      const res = await fetch(`${TEST_URL}/secure/resource`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: "" }),
      });

      expect(res.status).toBe(403);
      const body = await res.text();
      expect(body).toContain("Forbidden");
      expect(body).toContain("Token is empty");
    });

    test("rejects JSON with null token", async () => {
      const res = await fetch(`${TEST_URL}/secure/resource`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: null }),
      });

      expect(res.status).toBe(403);
      const body = await res.text();
      expect(body).toContain("Forbidden");
    });

    test("rejects JSON with non-string token", async () => {
      const res = await fetch(`${TEST_URL}/secure/resource`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: 12345 }),
      });

      expect(res.status).toBe(403);
      const body = await res.text();
      expect(body).toContain("Forbidden");
    });
  });
});
