const { chromium } = require("playwright");
const fs = require("fs");
const { spawn } = require("child_process");
const http = require("http");

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

(async () => {
  const outDir = "screens";
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const base = process.env.BASE_URL || "http://localhost:5173";
  const startServer = process.argv.includes("--start-server");
  let serverProc = null;

  try {
    if (startServer) {
      console.log("Starting dev server (npm run dev)...");
      // Start vite via npm script so environment is consistent
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

      // Wait for the dev server to accept connections
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

    async function capture(path, file, opts = {}) {
      const url = base + path;
      console.log("Navigating to", url);
      await page.goto(url, { waitUntil: "load", timeout: 20000 });
      // small delay to allow animations and lazy images to settle
      await page.waitForTimeout(600);
      await page.screenshot({
        path: `${outDir}/${file}`,
        fullPage: opts.fullPage ?? true,
      });
      console.log("Saved", `${outDir}/${file}`);
    }

    try {
      // Capture across multiple viewports: desktop, tablet, mobile
      const viewports = [
        { name: "desktop", width: 1280, height: 900 },
        { name: "tablet", width: 768, height: 1024 },
        { name: "mobile", width: 375, height: 812 },
      ];

      for (const vp of viewports) {
        console.log(
          `\n=== Capturing viewport: ${vp.name} (${vp.width}x${vp.height}) ===`,
        );
        try {
          await page.setViewportSize({ width: vp.width, height: vp.height });
        } catch (e) {
          // ignore if not supported
        }

        // Landing
        await capture("/", `landing-${vp.name}.png`);

        // Attempt to open HowItWorks modal and capture if present
        try {
          console.log("Attempting to open HowItWorks modal...");
          await page.click('text="Learn More?"', { timeout: 3000 });
          await page.waitForSelector('text="How Doggerz works"', {
            timeout: 5000,
          });
          await page.waitForTimeout(300);
          await page.screenshot({
            path: `${outDir}/landing-howitworks-${vp.name}.png`,
            fullPage: false,
          });
          console.log("Saved", `${outDir}/landing-howitworks-${vp.name}.png`);
        } catch (err) {
          console.warn(
            "Could not open HowItWorks modal for",
            vp.name,
            ":",
            err.message,
          );
        }

        // About
        await capture("/about", `about-${vp.name}.png`);

        // Settings
        await capture("/settings", `settings-${vp.name}.png`);
      }
    } catch (err) {
      console.error("Screenshot run failed:", err);
      process.exitCode = 2;
    } finally {
      await browser.close();
    }
  } catch (err) {
    console.error("Error during screenshots run:", err);
    process.exitCode = 2;
  } finally {
    if (serverProc) {
      console.log("Stopping dev server...");
      try {
        serverProc.kill("SIGINT");
      } catch (e) {
        // best effort
      }
    }
  }
})();
