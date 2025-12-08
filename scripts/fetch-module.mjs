#!/usr/bin/env node
// scripts/fetch-module.mjs
// Simple helper to fetch a dev-server module URL and print the response body.
// Usage: node ./scripts/fetch-module.mjs <url>

import process from "process";

const url = process.argv[2];

if (!url) {
  console.error("Usage: node ./scripts/fetch-module.mjs <url>");
  process.exit(2);
}

async function getFetch() {
  if (typeof fetch === "function") return fetch;
  try {
    const mod = await import("node-fetch");
    return mod.default || mod;
  } catch (err) {
    return null;
  }
}

(async () => {
  const fetchFn = await getFetch();
  if (!fetchFn) {
    console.error("No fetch available. Use Node 18+ or install node-fetch.");
    process.exit(2);
  }

  try {
    console.log(`Fetching: ${url}`);
    const res = await fetchFn(url, { cache: "no-store" });
    console.log("Status:", res.status, res.statusText);

    console.log("--- Response headers ---");
    for (const [k, v] of res.headers.entries()) {
      console.log(`${k}: ${v}`);
    }

    const body = await res.text();
    console.log("--- Response body start ---");
    console.log(body);
    console.log("--- Response body end ---");

    if (!res.ok) process.exit(3);
  } catch (err) {
    console.error("Fetch failed:", err && err.stack ? err.stack : err);
    process.exit(1);
  }
})();
