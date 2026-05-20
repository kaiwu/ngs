import net from "node:net";
import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import {
  startNginx,
  stopNginx,
  cleanupRuntime,
  waitForTCPPort,
  TEST_URL,
} from "../harness.js";

const MODULE = "http_js_var_names";

const tcpRead = (port) =>
  new Promise((resolve, reject) => {
    const client = net.createConnection({ port, host: "127.0.0.1" }, () => {});
    let data = "";
    client.on("data", (chunk) => {
      data += chunk.toString();
      client.end();
    });
    client.on("end", () => resolve(data));
    client.on("error", reject);
    client.setTimeout(2000, () => resolve(data));
  });

describe("http_js_var_names", () => {
  beforeAll(async () => {
    await startNginx(`dist/${MODULE}/nginx.conf`, MODULE);
    await waitForTCPPort(8889);
    await waitForTCPPort(8890);
  });

  afterAll(async () => {
    await stopNginx();
    cleanupRuntime(MODULE);
  });

  describe("HTTP r.jsVarNames()", () => {
    test("all js_var names are returned sorted", async () => {
      const res = await fetch(`${TEST_URL}/all`);
      expect(res.status).toBe(200);
      expect(await res.text()).toBe("meta_name,meta_version,other_flag");
    });

    test("prefix filter returns only matching names", async () => {
      const res = await fetch(`${TEST_URL}/prefix`);
      expect(res.status).toBe(200);
      expect(await res.text()).toBe("meta_name,meta_version");
    });

    test("prefix with no match returns 0", async () => {
      const res = await fetch(`${TEST_URL}/no-match`);
      expect(res.status).toBe(200);
      expect(await res.text()).toBe("0");
    });
  });

  describe("stream s.jsVarNames()", () => {
    test("all stream js_var names are returned sorted", async () => {
      const data = await tcpRead(8889);
      expect(data).toBe("s_alpha,s_beta,s_gamma");
    });

    test("prefix filter on stream session", async () => {
      const data = await tcpRead(8890);
      expect(data).toBe("s_alpha,s_beta,s_gamma");
    });
  });
});
