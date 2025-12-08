// scripts/analytical-lifespan.mjs
// Analytic estimator for expected lifespan under the death model in src/redux/dogSlice.js
// Computes expected lifespan (in years) and percentile estimates by aggregating daily
// survival probabilities rather than Monte Carlo sampling.

import {
  TARGET_EXPECTED_YEARS,
  AGE_RISK_WINDOW_DAYS,
  MULTIPLIER,
  BASE_PROB_FACTOR,
} from "../src/config/lifespan.js";

const expectedGameDays = TARGET_EXPECTED_YEARS * 365;

function dailyDeathProbability(ageDays, health) {
  const ageOver = Math.max(0, ageDays - expectedGameDays);
  const ageFactor = Math.min(1, ageOver / AGE_RISK_WINDOW_DAYS);
  const healthFactor = Math.min(1, Math.max(0, (100 - health) / 100));
  const baseProb = 1 / (expectedGameDays * BASE_PROB_FACTOR);
  const prob =
    baseProb + baseProb * MULTIPLIER * ageFactor * (0.5 + healthFactor);
  return Math.min(1, Math.max(0, prob));
}

function analyze({ health = 100, maxDays = 20000 }) {
  let survival = 1.0;
  const survivalByDay = [];
  for (let day = 0; day <= maxDays; day++) {
    survivalByDay.push(survival);
    const prob = dailyDeathProbability(day, health);
    survival *= 1 - prob;
    if (survival <= 1e-12) break; // negligible survival
  }

  // Expected lifespan (in days) = sum_{t>=0} S(t)
  const expectedDays = survivalByDay.reduce((a, b) => a + b, 0);

  // Build distribution CDF by day (1 - S(t)) is cumulative death probability up to t
  const cdf = survivalByDay.map((s) => 1 - s);

  const percentileOf = (p) => {
    const target = p / 100;
    for (let i = 0; i < cdf.length; i++) {
      if (cdf[i] >= target) return i;
    }
    return cdf.length - 1;
  };

  return {
    health,
    expectedYears: expectedDays / 365,
    medianYears: percentileOf(50) / 365,
    p10Years: percentileOf(10) / 365,
    p90Years: percentileOf(90) / 365,
  };
}

function runAll() {
  const healthScenarios = [100, 90, 80, 70, 60, 50, 30];
  const results = healthScenarios.map((h) =>
    analyze({ health: h, maxDays: 30000 }),
  );
  console.log("Analytical lifespan estimates (years):");
  console.table(
    results.map((r) => ({
      health: r.health,
      expected: r.expectedYears.toFixed(2),
      median: r.medianYears.toFixed(2),
      p10: r.p10Years.toFixed(2),
      p90: r.p90Years.toFixed(2),
    })),
  );
}

if (require.main === module) {
  runAll();
}
