// src/pages/Developers.jsx
import React from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { SOCIAL_LINKS } from "@/app/config/links.js";
import DogAIEngine from "@/components/dog/DogAIEngine.jsx";
import Fireball from "@/components/dog/renderers/Fireball.jsx";
import { OBEDIENCE_COMMANDS } from "@/features/training/obedienceCommands.js";
import PageShell from "@/components/layout/PageShell.jsx";
import {
  useDog,
  useDogActions,
  useDogLife,
  useDogVitals,
} from "@/hooks/useDogState.js";
import { selectSettings } from "@/store/settingsSlice.js";

function shouldReduceEffects(perfMode) {
  const mode = String(perfMode || "auto").toLowerCase();
  if (mode === "on") return true;
  if (mode === "off") return false;
  if (typeof window === "undefined") return false;
  try {
    if (navigator?.connection?.saveData) return true;
    const mem = Number(navigator?.deviceMemory || 0);
    if (mem && mem <= 4) return true;
    const cores = Number(navigator?.hardwareConcurrency || 0);
    if (cores && cores <= 4) return true;
  } catch {
    // ignore capability probes
  }
  return false;
}

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

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function getAgeLabel(life) {
  if (life?.ageBucketLabel) return life.ageBucketLabel;
  const days = Math.max(0, Math.floor(Number(life?.ageDays || 0)));
  return `${days}d`;
}

function getTrainingHudModel(dog) {
  const potty =
    dog?.training?.potty && typeof dog.training.potty === "object"
      ? dog.training.potty
      : null;
  const obedience =
    dog?.training?.obedience && typeof dog.training.obedience === "object"
      ? dog.training.obedience
      : null;
  const pottyGoal = Math.max(1, Number(potty?.goal || 1));
  const pottySuccessCount = clamp(
    Math.floor(Number(potty?.successCount || 0)),
    0,
    pottyGoal
  );
  const pottyComplete = Boolean(potty?.completedAt);
  const pottyPct = Math.round((pottySuccessCount / pottyGoal) * 100);
  const unlockedIds = Array.isArray(obedience?.unlockedIds)
    ? obedience.unlockedIds.map((id) => String(id || "")).filter(Boolean)
    : [];
  const totalCommands = Math.max(1, OBEDIENCE_COMMANDS.length);
  const obediencePct = Math.round((unlockedIds.length / totalCommands) * 60);
  const pottyWeight = pottyComplete ? 40 : Math.round(pottyPct * 0.4);
  const score = clamp(pottyWeight + obediencePct, 0, 100);
  const focusCommandId = unlockedIds[0] || "sit";
  const focusCommandLabel =
    OBEDIENCE_COMMANDS.find((command) => command.id === focusCommandId)
      ?.label || "Sit";

  return {
    score,
    pottyComplete,
    focusCommandId,
    focusCommandLabel,
    detail: pottyComplete
      ? `${unlockedIds.length}/${totalCommands} obedience commands unlocked`
      : `${pottySuccessCount}/${pottyGoal} potty wins before tricks unlock`,
  };
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
  const settings = useSelector(selectSettings);
  const stageRef = React.useRef(null);
  const dog = useDog();
  const vitals = useDogVitals();
  const life = useDogLife();
  const { petDog, quickFeed, trainObedience } = useDogActions();
  const repoBase = asGithubRepoBase(SOCIAL_LINKS.github);
  const issuesUrl = repoBase ? `${repoBase}/issues` : null;
  const pullsUrl = repoBase ? `${repoBase}/pulls` : null;
  const securityUrl = repoBase ? `${repoBase}/blob/main/SECURITY.md` : null;
  const readmeUrl = repoBase ? `${repoBase}#readme` : null;
  const contributingUrl = repoBase ? `${repoBase}/blob/main/README.md` : null;
  const perfReduced = shouldReduceEffects(settings?.perfMode);
  const reduceMotion =
    settings?.reduceMotion === "on" ||
    (settings?.reduceMotion !== "off" &&
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const pauseFireball = perfReduced || settings?.batterySaver === true;
  const hud = React.useMemo(() => getTrainingHudModel(dog), [dog]);
  const ageLabel = getAgeLabel(life);

  const handlePetDog = React.useCallback(() => {
    petDog({ now: Date.now(), source: "developers_fireball_demo" });
  }, [petDog]);

  const handleQuickFeed = React.useCallback(() => {
    quickFeed({ now: Date.now(), source: "developers_fireball_demo" });
  }, [quickFeed]);

  const handlePracticeCommand = React.useCallback(() => {
    trainObedience({
      now: Date.now(),
      source: "developers_fireball_demo",
      input: "button",
      commandId: hud.focusCommandId,
    });
  }, [hud.focusCommandId, trainObedience]);

  return (
    <PageShell mainClassName="px-6 py-10" containerClassName="w-full max-w-5xl">
      <DogAIEngine enableAudio={false} enableWeather={false} />
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
                  src/components/dog/DogAIEngine.jsx
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
                Firebase bootstrap and env validation live in
                <span className="font-semibold text-zinc-200">
                  {" "}
                  src/firebase.js
                </span>
                . If keys are missing, the app stays playable locally.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-lg font-bold">Fireball DOM FSM demo</h2>
              <p className="mt-1 max-w-3xl text-sm text-zinc-400">
                This sandbox keeps the lightweight DOM FSM for motion, but the
                sprite playback is now manifest-driven so each JR sheet uses its
                real frame count instead of a brittle one-size-fits-none strip.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.18em] text-zinc-300">
              <Badge>useRef brain</Badge>
              <Badge>translate3d</Badge>
              <Badge>manifest-driven</Badge>
            </div>
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(280px,0.75fr)]">
            <div
              ref={stageRef}
              className="relative min-h-[360px] overflow-hidden rounded-[28px] border border-emerald-500/20 bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,0.09),transparent_30%),linear-gradient(180deg,#7fb069_0%,#5f8b52_58%,#42673d_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_18px_48px_rgba(0,0,0,0.3)]"
            >
              <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-sky-200/20 to-transparent" />
              <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/20 to-transparent" />

              <div className="absolute left-5 top-5 z-10 rounded-full border border-white/15 bg-black/25 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-100 backdrop-blur-sm">
                Live yard sandbox
              </div>

              <div className="absolute left-5 top-16 z-20 w-[min(300px,calc(100%-2.5rem))] rounded-2xl border border-white/10 bg-black/55 p-4 text-zinc-100 shadow-[0_20px_48px_rgba(0,0,0,0.28)] backdrop-blur-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.2em] text-emerald-200/85">
                      Fireball&apos;s HUD
                    </div>
                    <h3 className="mt-1 text-lg font-black">Redux test yard</h3>
                  </div>
                  <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-200">
                    Age {ageLabel}
                  </div>
                </div>

                {!vitals ? (
                  <div className="mt-4 text-sm text-zinc-300">
                    Loading dog state…
                  </div>
                ) : (
                  <>
                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                      <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                        <div className="text-[11px] uppercase tracking-[0.16em] text-zinc-400">
                          Bond
                        </div>
                        <div className="mt-1 text-xl font-black text-emerald-200">
                          {vitals.bondValue}/100
                        </div>
                      </div>
                      <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                        <div className="text-[11px] uppercase tracking-[0.16em] text-zinc-400">
                          Training
                        </div>
                        <div className="mt-1 text-xl font-black text-sky-200">
                          {hud.score}/100
                        </div>
                      </div>
                      <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                        <div className="text-[11px] uppercase tracking-[0.16em] text-zinc-400">
                          Hunger need
                        </div>
                        <div className="mt-1 text-xl font-black text-amber-200">
                          {vitals.hunger}/100
                        </div>
                      </div>
                      <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                        <div className="text-[11px] uppercase tracking-[0.16em] text-zinc-400">
                          Energy
                        </div>
                        <div className="mt-1 text-xl font-black text-fuchsia-200">
                          {vitals.energy}/100
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-zinc-300">
                      {hud.detail}
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={handleQuickFeed}
                        className="rounded-xl border border-amber-300/30 bg-amber-500/15 px-3 py-2 text-xs font-semibold text-amber-100 hover:bg-amber-500/25"
                      >
                        Quick feed
                      </button>
                      <button
                        type="button"
                        onClick={handlePracticeCommand}
                        disabled={!dog?.adoptedAt}
                        className="rounded-xl border border-sky-300/30 bg-sky-500/15 px-3 py-2 text-xs font-semibold text-sky-100 hover:bg-sky-500/25"
                      >
                        Practice {hud.focusCommandLabel}
                      </button>
                    </div>
                  </>
                )}
              </div>

              <Fireball
                boundsRef={stageRef}
                lifeStage={life?.stage}
                reduceMotion={reduceMotion}
                paused={pauseFireball}
                renderSize={96}
                speed={2}
                padding={56}
                onInteract={handlePetDog}
              />

              <div className="absolute bottom-4 left-4 right-4 z-10 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-xs text-zinc-200 backdrop-blur-sm">
                {pauseFireball
                  ? "Battery saver or perf reduction is active, so Fireball is politely parked to protect mobile smoothness."
                  : reduceMotion
                    ? "Reduced motion is enabled, so Fireball keeps the lightweight DOM layer but pauses roaming."
                    : "Tap Fireball to stop the wander loop, play the interact sheet, and dispatch the real Redux pet action into the dog engine."}
              </div>
            </div>

            <div className="space-y-4 rounded-2xl border border-zinc-800/70 bg-zinc-950/30 p-5">
              <h3 className="font-semibold">Guardrails enforced</h3>
              <ul className="space-y-2 text-sm text-zinc-300">
                <li>
                  <span className="font-semibold text-zinc-100">
                    No coordinate re-render trap:
                  </span>{" "}
                  X/Y, target coordinates, timers, and RAF ids live in a ref.
                </li>
                <li>
                  <span className="font-semibold text-zinc-100">
                    GPU movement only:
                  </span>{" "}
                  movement writes directly to
                  <code className="px-1 text-zinc-100">
                    transform: translate3d()
                  </code>
                  instead of mutating{" "}
                  <code className="px-1 text-zinc-100">left</code>
                  or <code className="px-1 text-zinc-100">top</code> every
                  frame.
                </li>
                <li>
                  <span className="font-semibold text-zinc-100">
                    Transform collision avoided:
                  </span>{" "}
                  the parent element owns movement while the child sprite owns
                  flip and sheet playback.
                </li>
                <li>
                  <span className="font-semibold text-zinc-100">
                    Real frame metadata:
                  </span>{" "}
                  the DOM renderer reads adult and pup sheet dimensions,
                  columns, and frame counts from a shared JR manifest before it
                  animates.
                </li>
                <li>
                  <span className="font-semibold text-zinc-100">
                    Mobile-safe cleanup:
                  </span>{" "}
                  idle timers and animation frames are canceled on unmount.
                </li>
                <li>
                  <span className="font-semibold text-zinc-100">
                    Redux-backed dog logic:
                  </span>{" "}
                  petting, feeding, energy, bond, age, and training state all
                  come from the existing engine selectors and reducers.
                </li>
              </ul>

              <div className="rounded-xl border border-zinc-800 bg-black/30 p-4 text-xs leading-relaxed text-zinc-400">
                Asset note: this demo now resolves JR sprite URLs, frame counts,
                and grid dimensions from a shared manifest. Changing the dog to
                pup or adult swaps the whole sprite family automatically, no
                magic <code className="px-1 text-zinc-200">steps(16)</code>
                incantations required.
              </div>
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
