import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import net from "node:net";
import {
  startNginx,
  stopNginx,
  cleanupRuntime,
  waitForTCPPort,
} from "../harness.js";

const MODULE = "stream_detect_http";

const connectAndSend = async (port, payload) =>
  new Promise((resolve, reject) => {
    const client = net.createConnection({ port, host: "127.0.0.1" }, () => {
      client.write(payload);
    });
    let data = "";
    client.on("data", (chunk) => {
      data += chunk.toString();
    });
    client.on("end", () => resolve(data));
    client.on("error", reject);
  });

describe("stream_detect_http", () => {
  beforeAll(async () => {
    await startNginx(`dist/${MODULE}/nginx.conf`, MODULE);
    await waitForTCPPort(8888);
  });

  afterAll(async () => {
    await stopNginx();
    cleanupRuntime(MODULE);
  });

  test("routes HTTP traffic to httpback", async () => {
    const response = await connectAndSend(
      8888,
      "GET / HTTP/1.1\r\nHost: example\r\n\r\n",
    );
    expect(response).toContain("HTTPBACK");
  });

  test("routes non-HTTP traffic to tcpback", async () => {
    const response = await connectAndSend(8888, "PING\n");
    expect(response).toContain("TCPBACK");
  });
});
