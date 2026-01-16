import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { startNginx, stopNginx, cleanupRuntime, TEST_URL } from "../harness.js";

const MODULE = "http_join_subrequests";

describe("join subrequests", () => {
    beforeAll(async () => {
        await startNginx(`dist/${MODULE}/nginx.conf`, MODULE);
    });

    afterAll(async () => {
        await stopNginx();
        cleanupRuntime(MODULE);
    });

    describe("joined response", () => {
        test("outputs joined text", async () => {
            const res = await fetch(`${TEST_URL}/join`);
            expect(res.status).toBe(200);
            const body = await res.text();
            const json = JSON.parse(body);
            expect(json[0].uri).toBe("/foo");
            expect(json[0].code).toBe(200);
            expect(json[0].body).toBe("FOO");
            expect(json[1].uri).toBe("/bar");
            expect(json[1].code).toBe(200);
            expect(json[1].body).toBe("BAR");
        });
    });
});
