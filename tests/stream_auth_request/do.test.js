import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import net from "node:net";
import {
  startNginx,
  stopNginx,
  cleanupRuntime,
  waitForTCPPort,
} from "../harness.js";

const MODULE = "stream_auth_request";

const connectAndSend = async (port, payload, timeoutMs = 2000) =>
  new Promise((resolve, reject) => {
    const client = net.createConnection({ port, host: "127.0.0.1" }, () => {
      client.write(payload);
    });
    let data = "";
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      resolve(data);
    };
    client.on("data", (chunk) => {
      data += chunk.toString();
      if (data.length > 0) {
        client.end();
      }
    });
    client.on("end", finish);
    client.on("close", finish);
    client.on("timeout", finish);
    client.on("error", (err) => {
      if (settled) return;
      settled = true;
      reject(err);
    });
    client.setTimeout(timeoutMs);
  });

describe("stream_auth_request", () => {
  beforeAll(async () => {
    await startNginx(`dist/${MODULE}/nginx.conf`, MODULE);
    await waitForTCPPort(8888);
  });

  afterAll(async () => {
    await stopNginx();
    cleanupRuntime(MODULE);
  });

  test("allows MAGIC + QZ to reach backend", async () => {
    const response = await connectAndSend(8888, "MAGiKQZ");
    expect(response).toContain("BACKEND");
  });

  test("denies non-matching payload", async () => {
    const response = await connectAndSend(8888, "MAGiKNO");
    expect(response).toBe("");
  });
});
