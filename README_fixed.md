# 🐶 Doggerz

Adopt a pixel pup and make choices that shape its behavior. Built with React, Redux Toolkit, Vite, Tailwind, and Firebase. Offline-ready PWA.

## Quick Links

- Run dev server: `npm run dev`
- Run tests: `npm test`
- Lifespan analysis scripts: `npm run lifespan:analytical` and `npm run lifespan:simulate -- <trials>`

## Getting Started

1. Clone and install:

```powershell
git clone git@github.com:Catfishfishcat10101/doggerz.git
cd doggerz
npm install
```

2. Create `.env.local` from `.env.example` and add your Firebase web app credentials.

3. Run the dev server:

```powershell
npm run dev
```

The app disables cloud features if Firebase keys are missing so you can still run locally.

## Testing

This project uses Jest + React Testing Library.

Important note: As of Jest v28+, the `jsdom` test environment is not bundled with Jest and must be installed separately. This repository includes `jest-environment-jsdom` in `devDependencies` and `jest.config.cjs` is configured to use it.

Install dependencies and run tests:

```powershell
npm install
npm test
```

If you see an error that says "Test environment jest-environment-jsdom cannot be found":

- Confirm the package is installed: `npm ls jest-environment-jsdom`.
- If it's missing, run: `npm install --save-dev jest-environment-jsdom`.
- If problems persist, remove `node_modules` and `package-lock.json` then run `npm install` again.

Also share `node -v` and `npm -v` in bug reports.

## Lifespan Analysis Scripts

Developer-facing scripts are provided to evaluate the in-game lifespan tuning:

- `npm run lifespan:analytical` — analytical estimator
- `npm run lifespan:simulate -- 10000` — Monte Carlo simulator (pass number of trials)

These scripts read from `src/config/lifespan.js` so you can tune constants and re-run locally.

## Contributing

See `CONTRIBUTING.md` (if present) or open an issue/PR. Be sure to run tests locally.

---

If you want, I can replace `README.md` with this cleaned version now (I can do it automatically), or I can leave this file for you to inspect and accept. Let me know which you prefer.