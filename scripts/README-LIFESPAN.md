Lifespan tuning and analysis

This project exposes small helper scripts to estimate and simulate expected dog
lifespans under the in-game death model.

Files

- `src/config/lifespan.js` — single source of tuning constants used by the
  runtime and scripts. Edit `TARGET_EXPECTED_YEARS`, `AGE_RISK_WINDOW_YEARS`,
  `MULTIPLIER`, and `BASE_PROB_FACTOR` to change behavior.

- `scripts/analytical-lifespan.mjs` — fast, deterministic estimator that
  aggregates daily survival probabilities and reports expected/median/p10/p90
  lifespans for various health assumptions.

- `scripts/simulate-lifespans.mjs` — Monte Carlo sampler (default 10k trials)
  which runs many random trials and summarizes the distribution. Use this to
  validate the analytical estimates.

How to run

1. Install dependencies (if needed):

```bash
npm install
```

2. Run the analytical estimator (fast):

```bash
node scripts/analytical-lifespan.mjs
```

3. Run the Monte Carlo simulation (may take longer depending on trials):

```bash
node scripts/simulate-lifespans.mjs 10000
```

Tuning suggestions

- To change the target expected lifespan, edit `TARGET_EXPECTED_YEARS` in
  `src/config/lifespan.js` and rerun the scripts.

- To make the risk window wider or narrower, edit `AGE_RISK_WINDOW_YEARS`.

- `MULTIPLIER` controls how strongly age+health amplify the base probability.

- `BASE_PROB_FACTOR` affects the adaptive base probability. Larger values make
  the base per-day death probability smaller (longer expected lifespan).

If you run the scripts locally and paste the results back here, I will iterate
on the constants and update `src/redux/dogSlice.js` to better match the
results you want.
