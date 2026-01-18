// src/pages/Developers.jsx
import React from "react";
import { Link } from "react-router-dom";
import { SOCIAL_LINKS } from "@/config/links.js";
import PageShell from "@/components/PageShell.jsx";

function asGithubRepoBase(url) {
  if (!url) return null;
  try {
    const u = new URL(url);
    // Expect: https://github.com/{owner}/{repo}
    const parts = u.pathname.split("/").filter(Boolean);
    if (u.hostname !== "github.com" || parts.length < 2) return null;
    return `https://github.com/${parts[0]}/${parts[1]}`;
  } catch {
    return null;
  }
}

function ExternalLink({ href, children, className }) {
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={
        className ||
        "text-emerald-300 underline-offset-2 hover:text-emerald-200 hover:underline"
      }
    >
      {children}
    </a>
  );
}

function Badge({ children }) {
  return (
    <span className="inline-flex items-center rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-200">
      {children}
    </span>
  );
}

async function copyToClipboard(text) {
  const value = String(text || "");
  if (!value) return false;

  // Modern clipboard API
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return true;
    }
  } catch {
    // fall through
  }

  // Fallback: execCommand
  try {
    const el = document.createElement("textarea");
    el.value = value;
    el.setAttribute("readonly", "");
    el.style.position = "fixed";
    el.style.top = "-9999px";
    el.style.left = "-9999px";
    document.body.appendChild(el);
    el.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(el);
    return !!ok;
  } catch {
    return false;
  }
}

function CopyCodeBlock({ title, code }) {
  const [status, setStatus] = React.useState("idle");
  const codeText = String(code || "");

  const onCopy = async () => {
    setStatus("copying");
    const ok = await copyToClipboard(codeText);
    setStatus(ok ? "copied" : "failed");
    window.setTimeout(() => setStatus("idle"), ok ? 1200 : 1800);
  };

  const label =
    status === "copied"
      ? "Copied"
      : status === "failed"
        ? "Copy failed"
        : "Copy";

  return (
    <div className="mt-4 rounded-xl border border-zinc-800 bg-black/40">
      <div className="flex items-center justify-between gap-3 border-b border-zinc-800 px-4 py-2">
        <div className="text-xs font-semibold text-zinc-300">
          {title || "Commands"}
        </div>
        <button
          type="button"
          onClick={onCopy}
          className="inline-flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-950/50 px-2.5 py-1.5 text-xs font-semibold text-zinc-200 hover:border-emerald-500/50 hover:text-emerald-200 disabled:opacity-60"
          disabled={!codeText || status === "copying"}
          aria-label="Copy commands to clipboard"
        >
          <span>{label}</span>
        </button>
      </div>
      <pre className="whitespace-pre-wrap px-4 py-3 text-xs leading-relaxed text-zinc-200">
        {codeText}
      </pre>
    </div>
  );
}

export default function DevelopersPage() {
  const repoBase = asGithubRepoBase(SOCIAL_LINKS.github);
  const issuesUrl = repoBase ? `${repoBase}/issues` : null;
  const pullsUrl = repoBase ? `${repoBase}/pulls` : null;
  const securityUrl = repoBase ? `${repoBase}/blob/main/SECURITY.md` : null;
  const readmeUrl = repoBase ? `${repoBase}#readme` : null;
  const contributingUrl = repoBase ? `${repoBase}/blob/main/README.md` : null;

  return (
    <PageShell mainClassName="px-6 py-10" containerClassName="w-full max-w-5xl">
      <div className="w-full space-y-10">
        {/* Hero */}
        <section className="rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-950 via-zinc-950 to-emerald-950/30 p-8 md:p-10">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="space-y-3">
              <h1 className="text-4xl md:text-5xl font-black tracking-tight">
                Developers
              </h1>
              <p className="max-w-2xl text-zinc-300">
                Build features, fix bugs, and ship delightful chaos. This page
                is a practical starting point for contributing to Doggerz.
              </p>

              <div className="flex flex-wrap gap-2 pt-1">
                <Badge>React + Vite</Badge>
                <Badge>Redux Toolkit</Badge>
                <Badge>Tailwind</Badge>
                <Badge>Offline-first</Badge>
                <Badge>Firebase optional</Badge>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <ExternalLink
                href={repoBase || SOCIAL_LINKS.github}
                className="inline-flex items-center justify-center rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-emerald-400"
              >
                View repo
              </ExternalLink>
              <ExternalLink
                href={issuesUrl}
                className="inline-flex items-center justify-center rounded-xl border border-zinc-800 bg-zinc-950/40 px-4 py-2 text-sm font-semibold text-zinc-100 hover:border-emerald-500/50 hover:text-emerald-200"
              >
                Report an issue
              </ExternalLink>
              <Link
                to="/help"
                className="inline-flex items-center justify-center rounded-xl border border-zinc-800 bg-zinc-950/40 px-4 py-2 text-sm font-semibold text-zinc-100 hover:border-emerald-500/50 hover:text-emerald-200"
              >
                Need help?
              </Link>
            </div>
          </div>
        </section>

        {/* Quick links */}
        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-6">
            <h2 className="text-lg font-bold">Links</h2>
            <p className="mt-1 text-sm text-zinc-400">
              Everything you need in one place.
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <span className="text-zinc-400">Repository: </span>
                {SOCIAL_LINKS.github ? (
                  <ExternalLink href={SOCIAL_LINKS.github}>
                    {repoBase || SOCIAL_LINKS.github}
                  </ExternalLink>
                ) : (
                  <span className="text-zinc-500">Not configured yet</span>
                )}
              </li>
              <li>
                <span className="text-zinc-400">Issues: </span>
                {issuesUrl ? (
                  <ExternalLink href={issuesUrl}>{issuesUrl}</ExternalLink>
                ) : (
                  <span className="text-zinc-500">Unavailable</span>
                )}
              </li>
              <li>
                <span className="text-zinc-400">Pull requests: </span>
                {pullsUrl ? (
                  <ExternalLink href={pullsUrl}>{pullsUrl}</ExternalLink>
                ) : (
                  <span className="text-zinc-500">Unavailable</span>
                )}
              </li>
              <li>
                <span className="text-zinc-400">Readme: </span>
                {readmeUrl ? (
                  <ExternalLink href={readmeUrl}>{readmeUrl}</ExternalLink>
                ) : (
                  <span className="text-zinc-500">Unavailable</span>
                )}
              </li>
              <li>
                <span className="text-zinc-400">Security: </span>
                {securityUrl ? (
                  <ExternalLink href={securityUrl}>{securityUrl}</ExternalLink>
                ) : (
                  <span className="text-zinc-500">See SECURITY.md in repo</span>
                )}
              </li>
              <li>
                <span className="text-zinc-400">Privacy: </span>
                <Link
                  to="/privacy"
                  className="text-emerald-300 underline-offset-2 hover:text-emerald-200 hover:underline"
                >
                  /privacy
                </Link>
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-6">
            <h2 className="text-lg font-bold">Run locally</h2>
            <p className="mt-1 text-sm text-zinc-400">
              Doggerz runs great in offline mode. Firebase is optional.
            </p>

            <CopyCodeBlock
              title="Install / run"
              code={`# install
npm install

# start dev server
npm run dev

# build
npm run build`}
            />

            <p className="mt-3 text-xs text-zinc-500">
              Tip: if you see Firebase missing-env warnings in development, add
              values to <span className="font-semibold">.env.local</span> or set
              <span className="font-semibold">
                {" "}
                VITE_SUPPRESS_ENV_MISSING_WARNINGS=true
              </span>
              .
            </p>
          </div>
        </section>

        {/* Architecture */}
        <section className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-6">
          <h2 className="text-lg font-bold">Architecture overview</h2>
          <p className="mt-1 text-sm text-zinc-400">
            Where to look when you want to change behavior, UI, or game logic.
          </p>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-zinc-800/70 bg-zinc-950/30 p-5">
              <h3 className="font-semibold">Game loop</h3>
              <p className="mt-2 text-sm text-zinc-300">
                The headless engine lives in
                <span className="font-semibold text-zinc-200">
                  {" "}
                  src/features/game/DogAIEngine.jsx
                </span>
                . It hydrates from localStorage, runs ticks, and optionally
                syncs to Firebase when configured.
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800/70 bg-zinc-950/30 p-5">
              <h3 className="font-semibold">State & rules</h3>
              <p className="mt-2 text-sm text-zinc-300">
                Core state and reducers live in
                <span className="font-semibold text-zinc-200">
                  {" "}
                  src/redux/dogSlice.js
                </span>
                . This is where stats decay, cleanliness tiers, moods, and
                training are applied.
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800/70 bg-zinc-950/30 p-5">
              <h3 className="font-semibold">UI</h3>
              <p className="mt-2 text-sm text-zinc-300">
                Page routes live in
                <span className="font-semibold text-zinc-200"> src/pages</span>,
                reusable components in
                <span className="font-semibold text-zinc-200">
                  {" "}
                  src/components
                </span>
                , and game UI in
                <span className="font-semibold text-zinc-200">
                  {" "}
                  src/features/game
                </span>
                .
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800/70 bg-zinc-950/30 p-5">
              <h3 className="font-semibold">Config & env</h3>
              <p className="mt-2 text-sm text-zinc-300">
                Firebase env handling is in
                <span className="font-semibold text-zinc-200">
                  {" "}
                  src/config/env.js
                </span>
                . If keys are missing, the app stays playable locally.
              </p>
            </div>
          </div>
        </section>

        {/* Env vars */}
        <section className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-6">
          <h2 className="text-lg font-bold">Firebase (optional)</h2>
          <p className="mt-1 text-sm text-zinc-400">
            Cloud sync is disabled unless these vars exist in
            <span className="font-semibold text-zinc-200"> .env.local</span>.
            Offline mode is the default.
          </p>

          <div className="mt-4 rounded-xl border border-zinc-800 bg-black/40 p-4">
            <pre className="whitespace-pre-wrap text-xs leading-relaxed text-zinc-200">
              {`VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

# optional
VITE_FIREBASE_MEASUREMENT_ID=`}
            </pre>
          </div>

          <p className="mt-3 text-xs text-zinc-500">
            If you’re contributing and don’t need Firebase, you can safely leave
            these empty.
          </p>
        </section>

        {/* Contributing */}
        <section className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-6">
          <h2 className="text-lg font-bold">Contributing</h2>
          <p className="mt-1 text-sm text-zinc-400">
            We love clean PRs and clear bug reports.
          </p>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-zinc-800/70 bg-zinc-950/30 p-5">
              <h3 className="font-semibold">PR checklist</h3>
              <ul className="mt-2 list-disc list-inside space-y-1 text-sm text-zinc-300">
                <li>Keep changes focused and easy to review.</li>
                <li>
                  Prefer reducer-safe updates (no direct state mutation in
                  components).
                </li>
                <li>
                  Test in dev and run a production build before submitting.
                </li>
                <li>Include screenshots for UI changes (mobile + desktop).</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-zinc-800/70 bg-zinc-950/30 p-5">
              <h3 className="font-semibold">Where to start</h3>
              <ul className="mt-2 space-y-2 text-sm text-zinc-300">
                <li>
                  Look for small wins: UI polish, copy fixes, a11y improvements,
                  and performance tweaks.
                </li>
                <li>
                  For bigger changes, open an issue first so we can align on the
                  approach.
                </li>
                <li>
                  {contributingUrl ? (
                    <>
                      See{" "}
                      <ExternalLink href={contributingUrl}>README</ExternalLink>{" "}
                      for more project details.
                    </>
                  ) : (
                    <span className="text-zinc-400">
                      See README.md in the repo.
                    </span>
                  )}
                </li>
              </ul>
            </div>
          </div>
        </section>

        <div className="pt-2 text-sm">
          <Link
            to="/"
            className="text-emerald-300 underline-offset-2 hover:text-emerald-200 hover:underline"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </PageShell>
  );
}
