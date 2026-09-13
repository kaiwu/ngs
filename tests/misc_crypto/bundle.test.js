// Build-time tests run in Bun; these helpers are never bundled into nginx handlers.
import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { build } from "esbuild";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

describe("crypto stays external in ngs bundles", () => {
    let directory;
    let entry;
    let builder;
    let builderURL;
    const sentinel = "NGS_CRYPTO_PACKAGE_COLLISION";

    beforeAll(async () => {
        directory = mkdtempSync(join(tmpdir(), "ngs-crypto-bundle-"));
        // Copy compiled modules so the conflicting package is in their resolution path.
        cpSync("build/dev/javascript", join(directory, "javascript"), { recursive: true });
        entry = join(directory, "javascript/ngs/app/misc_crypto/misc_crypto.mjs");
        const packageDir = join(directory, "node_modules/crypto");
        mkdirSync(packageDir, { recursive: true });
        writeFileSync(join(packageDir, "package.json"), JSON.stringify({
            name: "crypto", version: "0.0.0", type: "module", main: "index.js",
        }));
        writeFileSync(join(packageDir, "index.js"), `
            export default {
                createHash() { throw new Error("${sentinel}"); },
                createHmac() { throw new Error("${sentinel}"); }
            };
        `);
        builderURL = pathToFileURL(resolve("build/dev/javascript/ngs/ngs_ffi.mjs")).href;
        builder = await import(builderURL);
    });

    afterAll(() => {
        if (directory) rmSync(directory, { recursive: true, force: true });
    });

    function checkBundle(output) {
        const source = readFileSync(output, "utf8");
        expect(source).toMatch(/import\s+\w+\s+from\s*["']crypto["']/);
        expect(source).not.toContain(sentinel);
        expect(source).not.toMatch(/(?:globalThis\.)?require\(["']crypto["']\)/);
        expect(source).not.toMatch(/(?:from\s*|import\s*)["']node:/);
    }

    test("the collision fixture is resolvable when crypto is not external", async () => {
        const result = await build({
            entryPoints: [entry], bundle: true, format: "esm", target: ["es2020"],
            external: ["querystring", "fs", "xml", "zlib"],
            write: false, metafile: true,
        });
        expect(result.outputFiles[0].text).toContain(sentinel);
        expect(Object.keys(result.metafile.inputs).some(path => path.endsWith("node_modules/crypto/index.js"))).toBe(true);
    });

    test("bundle_build preserves the native ESM import", async () => {
        const output = join(directory, "build.js");
        expect((await builder.bundle_build(entry, output)).isOk()).toBe(true);
        checkBundle(output);
    });

    test("bundle_watch preserves the native ESM import", async () => {
        const output = join(directory, "watch.js");
        const runner = join(directory, "watch.mjs");
        writeFileSync(runner, `
            import { bundle_watch } from ${JSON.stringify(builderURL)};
            import { stop } from ${JSON.stringify(import.meta.resolve("esbuild"))};
            process.on("SIGTERM", () => { stop(); process.exit(0); });
            const result = await bundle_watch(process.argv[2], process.argv[3]);
            if (!result.isOk()) process.exit(1);
        `);
        // The existing watch API owns its context; isolate it so teardown stops watching.
        const child = Bun.spawn([process.execPath, runner, entry, output], {
            stdout: "ignore", stderr: "inherit",
        });
        try {
            const deadline = Date.now() + 4000;
            while (!existsSync(output) && Date.now() < deadline) await Bun.sleep(25);
            expect(existsSync(output)).toBe(true);
            checkBundle(output);
        } finally {
            child.kill();
            await child.exited;
        }
    });
});
