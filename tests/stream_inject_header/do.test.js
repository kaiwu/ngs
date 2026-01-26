import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import net from "node:net";
import {
  startNginx,
  stopNginx,
  cleanupRuntime,
  waitForTCPPort,
} from "../harness.js";

const MODULE = "stream_inject_header";

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

describe("stream_inject_header", () => {
  beforeAll(async () => {
    await startNginx(`dist/${MODULE}/nginx.conf`, MODULE);
    await waitForTCPPort(8888);
  });

  afterAll(async () => {
    await stopNginx();
    cleanupRuntime(MODULE);
  });

  test("injects Foo header for upstream", async () => {
    const response = await connectAndSend(
      8888,
      "GET / HTTP/1.1\r\nHost: example\r\nConnection: close\r\n\r\n",
    );
    expect(response).toContain("my_foo");
  });
});
