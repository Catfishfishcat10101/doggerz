// scripts/simulate-lifespans.mjs
// Simple Monte Carlo simulation for the death probability model
// Mirrors the logic added in src/redux/dogSlice.js (targeting 17 years)

import {
  TARGET_EXPECTED_YEARS,
  AGE_RISK_WINDOW_DAYS,
  MULTIPLIER,
  BASE_PROB_FACTOR,
} from "../src/config/lifespan.js";

const DEFAULT_TRIALS = 10000;
const expectedGameDays = TARGET_EXPECTED_YEARS * 365;
const baseProb = 1 / (expectedGameDays * BASE_PROB_FACTOR);

function runTrial({ health = 100, maxDays = 20000 }) {
  for (let day = 0; day < maxDays; day++) {
    const ageDays = day;
    if (health <= 1) return ageDays;

    const ageOver = Math.max(0, ageDays - expectedGameDays);
    const ageFactor = Math.min(1, ageOver / AGE_RISK_WINDOW_DAYS);
    const healthFactor = Math.min(1, Math.max(0, (100 - health) / 100));
    const prob =
      baseProb + baseProb * MULTIPLIER * ageFactor * (0.5 + healthFactor);

    if (Math.random() < prob) return ageDays;

    // optional: small chance health drifts down over time (simulate neglect)
    // For simplicity, keep health constant here. Users can rerun with lower health.
  }
  return maxDays; // survived full window
}

function percentile(arr, p) {
  if (!arr.length) return 0;
  const sorted = arr.slice().sort((a, b) => a - b);
  const idx = Math.floor((p / 100) * sorted.length);
  return sorted[Math.min(idx, sorted.length - 1)];
}

async function run({ trials = DEFAULT_TRIALS }) {
  const healthScenarios = [100, 85, 70, 50, 30];
  const results = {};

  for (const health of healthScenarios) {
    const ages = [];
    for (let i = 0; i < trials; i++) {
      const days = runTrial({ health });
      ages.push(days / 365); // convert to years
    }
    const avg = ages.reduce((a, b) => a + b, 0) / ages.length;
    results[health] = {
      trials,
      avgYears: avg,
      medianYears: percentile(ages, 50),
      p10: percentile(ages, 10),
      p90: percentile(ages, 90),
    };
  }

  console.log("Monte Carlo lifespan simulation results (years):");
  console.table(
    Object.entries(results).map(([health, v]) => ({
      health,
      trials: v.trials,
      avg: v.avgYears.toFixed(2),
      median: v.medianYears.toFixed(2),
      p10: v.p10.toFixed(2),
      p90: v.p90.toFixed(2),
    })),
  );
}

const argTrials = Number(process.argv[2]) || DEFAULT_TRIALS;
run({ trials: argTrials }).catch((err) => {
  console.error(err);
  process.exit(1);
});
