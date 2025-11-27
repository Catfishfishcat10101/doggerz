const { chromium } = require("playwright");
const fs = require("fs");
const { spawn } = require("child_process");
const http = require("http");

const DOG_STORAGE_KEY = "doggerz:dogState";

function waitForServer(url, timeout = 20000, interval = 500) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    (function check() {
      const req = http.get(url, (res) => {
        res.destroy();
        resolve(true);
      });
      req.on("error", () => {
        if (Date.now() - start > timeout)
          return reject(new Error("Timeout waiting for server"));
        setTimeout(check, interval);
      });
      req.setTimeout(2000, () => req.abort());
    })();
  });
}

async function run() {
  const outDir = "screens/visual";
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const base = process.env.BASE_URL || "http://localhost:5173";
  const startServer = process.argv.includes("--start-server");
  let serverProc = null;

  try {
    if (startServer) {
      console.log("Starting dev server (npm run dev)...");
      serverProc = spawn(
        process.platform === "win32" ? "npm.cmd" : "npm",
        ["run", "dev", "--", "--host", "127.0.0.1"],
        {
          cwd: process.cwd(),
          env: Object.assign({}, process.env),
          stdio: ["ignore", "pipe", "pipe"],
        },
      );

      serverProc.stdout.on("data", (d) => process.stdout.write(`[vite] ${d}`));
      serverProc.stderr.on("data", (d) =>
        process.stderr.write(`[vite:err] ${d}`),
      );

      const urlToCheck = base + "/";
      console.log("Waiting for dev server at", urlToCheck);
      await waitForServer(urlToCheck, 30000, 500);
      console.log("Dev server is responding");
    }

    const browser = await chromium.launch();
    const context = await browser.newContext({
      viewport: { width: 1280, height: 900 },
    });
    const page = await context.newPage();

    // Test matrix: life stages x cleanliness tiers
    const stages = ["puppy", "adult", "senior"];
    const cleanliness = [
      { key: "FRESH", value: 100 },
      { key: "DIRTY", value: 60 },
      { key: "FLEAS", value: 30 },
      { key: "MANGE", value: 10 },
    ];

    for (const stage of stages) {
      for (const cl of cleanliness) {
        const name = `${stage.toLowerCase()}-${cl.key.toLowerCase()}`;
        const payload = {
          // Minimal payload: ensure reducer merges and keeps lifeStage
          lifeStage: stage,
          lifeStageLabel: stage[0].toUpperCase() + stage.slice(1),
          cleanlinessTier: cl.key,
          stats: { cleanliness: cl.value },
          name: `Pup ${name}`,
          // leave adoptedAt undefined so hydrate keeps provided lifeStage
        };

        console.log("Setting localStorage for", name);
        await page.goto(base + "/", { waitUntil: "load" });
        await page.evaluate(
          (k, p) => localStorage.setItem(k, JSON.stringify(p)),
          DOG_STORAGE_KEY,
          payload,
        );

        const url = base + "/game";
        console.log("Navigating to", url, "for", name);
        await page.goto(url, { waitUntil: "load", timeout: 20000 });

        // Wait for a visible dog sprite container (role=img)
        try {
          await page.waitForSelector('div[role="img"]', { timeout: 5000 });
        } catch (e) {
          console.warn("Dog sprite not found for", name);
        }

        // Let animations settle
        await page.waitForTimeout(500);

        const file = `${outDir}/${name}.png`;
        await page.screenshot({ path: file, fullPage: true });
        console.log("Saved", file);
      }
    }

    await browser.close();
  } catch (err) {
    console.error("Visual screenshot run failed:", err);
    process.exitCode = 2;
  } finally {
    if (serverProc) {
      console.log("Stopping dev server...");
      try {
        serverProc.kill("SIGINT");
      } catch (e) {}
    }
  }
}

run();
