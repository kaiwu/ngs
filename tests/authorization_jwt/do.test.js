import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { startNginx, stopNginx, cleanupRuntime, TEST_URL } from "../harness.js";

const MODULE = "http_authorization_jwt";

// Helper to create a simple JWT (header.payload.signature)
// This creates a valid structure but with a dummy signature
function createTestJWT(payload) {
  const header = { typ: "JWT", alg: "HS256" };
  const headerB64 = Buffer.from(JSON.stringify(header)).toString("base64url");
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  // Dummy signature - in real use this would be HMAC-SHA256
  const signatureB64 = "dummy_signature";
  return `${headerB64}.${payloadB64}.${signatureB64}`;
}

describe("http authorization jwt", () => {
  beforeAll(async () => {
    await startNginx(`dist/${MODULE}/nginx.conf`, MODULE);
  });

  afterAll(async () => {
    await stopNginx();
    cleanupRuntime(MODULE);
  });

  describe("jwt_payload_sub extraction", () => {
    test("extracts sub claim from valid JWT", async () => {
      const jwt = createTestJWT({ sub: "alice", iss: "nginx", foo: 123 });
      const res = await fetch(`${TEST_URL}/jwt`, {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      });
      expect(res.status).toBe(200);
      const body = await res.text();
      expect(body).toBe("alice");
    });

    test("extracts different sub claim values", async () => {
      const jwt = createTestJWT({ sub: "bob@example.com", role: "admin" });
      const res = await fetch(`${TEST_URL}/jwt`, {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      });
      expect(res.status).toBe(200);
      const body = await res.text();
      expect(body).toBe("bob@example.com");
    });

    test("returns empty string when no Authorization header", async () => {
      const res = await fetch(`${TEST_URL}/jwt`);
      expect(res.status).toBe(200);
      const body = await res.text();
      expect(body).toBe("");
    });

    test("returns empty string for malformed JWT", async () => {
      const res = await fetch(`${TEST_URL}/jwt`, {
        headers: {
          Authorization: "Bearer invalid.token",
        },
      });
      expect(res.status).toBe(200);
      const body = await res.text();
      expect(body).toBe("");
    });
  });
});
