import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { startNginx, stopNginx, cleanupRuntime, TEST_URL } from "../harness.js";

const MODULE = "http_authorization_gen_hs_jwt";

// Helper to verify JWT structure and decode payload
function decodeJWT(token) {
  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new Error("Invalid JWT format");
  }
  const [headerB64, payloadB64, signature] = parts;
  const header = JSON.parse(Buffer.from(headerB64, "base64url").toString());
  const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString());
  return { header, payload, signature };
}

// Helper to verify HMAC signature
function verifyHMAC(token, secret) {
  const crypto = require("crypto");
  const parts = token.split(".");
  const signingInput = `${parts[0]}.${parts[1]}`;
  const expectedSig = crypto
    .createHmac("sha256", secret)
    .update(signingInput)
    .digest("base64url");
  return parts[2] === expectedSig;
}

describe("http authorization gen_hs_jwt", () => {
  beforeAll(async () => {
    await startNginx(`dist/${MODULE}/nginx.conf`, MODULE);
  });

  afterAll(async () => {
    await stopNginx();
    cleanupRuntime(MODULE);
  });

  describe("JWT generation", () => {
    test("generates valid JWT structure", async () => {
      const res = await fetch(`${TEST_URL}/jwt`);
      expect(res.status).toBe(200);
      
      const jwt = await res.text();
      const parts = jwt.split(".");
      expect(parts.length).toBe(3);
    });

    test("JWT has correct header", async () => {
      const res = await fetch(`${TEST_URL}/jwt`);
      const jwt = await res.text();
      const { header } = decodeJWT(jwt);
      
      expect(header.typ).toBe("JWT");
      expect(header.alg).toBe("HS256");
    });

    test("JWT has default payload with sub and iss", async () => {
      const res = await fetch(`${TEST_URL}/jwt`);
      const jwt = await res.text();
      const { payload } = decodeJWT(jwt);
      
      expect(payload.sub).toBe("user");
      expect(payload.iss).toBe("nginx");
    });

    test("JWT uses custom subject from X-Subject header", async () => {
      const res = await fetch(`${TEST_URL}/jwt`, {
        headers: {
          "X-Subject": "alice@example.com",
        },
      });
      const jwt = await res.text();
      const { payload } = decodeJWT(jwt);
      
      expect(payload.sub).toBe("alice@example.com");
    });

    test("JWT uses custom issuer from X-Issuer header", async () => {
      const res = await fetch(`${TEST_URL}/jwt`, {
        headers: {
          "X-Issuer": "my-auth-server",
        },
      });
      const jwt = await res.text();
      const { payload } = decodeJWT(jwt);
      
      expect(payload.iss).toBe("my-auth-server");
    });

    test("JWT signature is valid HMAC-SHA256", async () => {
      const res = await fetch(`${TEST_URL}/jwt`);
      const jwt = await res.text();
      
      // The secret is hardcoded as "secret_key" in the implementation
      const isValid = verifyHMAC(jwt, "secret_key");
      expect(isValid).toBe(true);
    });
  });
});
