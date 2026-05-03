// src/pages/Help.jsx

import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PageShell from "@/components/layout/PageShell.jsx";
import { useToast } from "@/state/toastContext.js";
import { DOG_STORAGE_KEY } from "@/store/dogSlice.js";
import { SETTINGS_STORAGE_KEY } from "@/store/settingsSlice.js";
import { USER_STORAGE_KEY } from "@/store/userSlice.js";
import {
  getStoredValue,
  listStoredKeys,
  removeStoredValues,
  removeStoredValuesByPrefix,
} from "@/utils/nativeStorage.js";
import { REMINDER_STORAGE_KEY } from "@/utils/reminders.js";
import { APP_VERSION } from "@/utils/assetUtils.js";

const SURFACE =
  "rounded-3xl border border-emerald-500/15 bg-black/35 backdrop-blur-md shadow-[0_0_60px_rgba(16,185,129,0.10)]";
const CARD = "rounded-2xl border border-white/10 bg-black/25";
const LINK =
  "text-emerald-300 hover:text-emerald-200 underline underline-offset-4";

const WORKFLOW_STORAGE_KEY = "doggerz:workflows";

function safeJson(value) {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.left = "20px";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }
}

function Section({ title, children, id }) {
  return (
    <section id={id} className={`${CARD} p-5 sm:p-6`}>
      <h2 className="text-lg sm:text-xl font-extrabold text-emerald-200">
        {title}
      </h2>
      <div className="mt-3 text-sm text-zinc-200/90 leading-relaxed space-y-3">
        {children}
      </div>
    </section>
  );
}

function Q({ q, tags, children }) {
  return (
    <details className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <summary className="cursor-pointer select-none">
        <div className="flex items-start justify-between gap-4">
          <div className="font-semibold text-zinc-100">{q}</div>
          {tags ? (
            <div className="shrink-0 text-[11px] text-zinc-400">{tags}</div>
          ) : null}
        </div>
      </summary>
      <div className="mt-3 space-y-3 text-sm text-zinc-200/90 leading-relaxed">
        {children}
      </div>
    </details>
  );
}

export default function HelpPage() {
  const toast = useToast();
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState(null);
  const [storageDiag, setStorageDiag] = useState({
    hasDogState: null,
    hasUserState: null,
    hasWorkflows: null,
    hasSettingsState: null,
  });

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        const keys = await listStoredKeys();
        const [userRaw, workflowRaw, settingsRaw] = await Promise.all([
          getStoredValue(USER_STORAGE_KEY),
          getStoredValue(WORKFLOW_STORAGE_KEY),
          getStoredValue(SETTINGS_STORAGE_KEY),
        ]);
        if (cancelled) return;
        setStorageDiag({
          hasDogState: keys.some(
            (key) =>
              key === DOG_STORAGE_KEY || key.startsWith(`${DOG_STORAGE_KEY}:`)
          ),
          hasUserState: Boolean(userRaw),
          hasWorkflows: Boolean(workflowRaw),
          hasSettingsState: Boolean(settingsRaw),
        });
      } catch {
        if (cancelled) return;
        setStorageDiag({
          hasDogState: null,
          hasUserState: null,
          hasWorkflows: null,
          hasSettingsState: null,
        });
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  const diagnostics = useMemo(() => {
    const hasWindow = typeof window !== "undefined";
    const hasNavigator = typeof navigator !== "undefined";

    return {
      generatedAt: new Date().toISOString(),
      mode: import.meta.env.MODE,
      url: hasWindow ? window.location.href : null,
      userAgent: hasNavigator ? navigator.userAgent : null,
      language: hasNavigator ? navigator.language : null,
      storage: storageDiag,
    };
  }, [storageDiag]);

  const repoUrl = "https://github.com/Catfishfishcat10101/doggerz";

  const setNoticeAuto = useCallback((n) => {
    setNotice(n);
    window.setTimeout(() => setNotice(null), 4500);
  }, []);

  const handleResetLocalData = useCallback(async () => {
    try {
      const ok = window.confirm(
        "Reset local Doggerz data on this device? This clears your pup + settings and cannot be undone."
      );
      if (!ok) return;

      await removeStoredValuesByPrefix([`${DOG_STORAGE_KEY}:`]);
      await removeStoredValues([
        DOG_STORAGE_KEY,
        USER_STORAGE_KEY,
        WORKFLOW_STORAGE_KEY,
        SETTINGS_STORAGE_KEY,
        REMINDER_STORAGE_KEY,
        "theme",
      ]);

      setNoticeAuto({ kind: "success", text: "Local data reset. Reloading…" });
      window.setTimeout(() => window.location.reload(), 450);
    } catch (e) {
      console.warn("[Help] resetLocalData failed", e);
      setNoticeAuto({ kind: "error", text: "Couldn’t reset local data." });
    }
  }, [setNoticeAuto]);

  const topics = useMemo(
    () => [
      {
        id: "fast",
        title: "Fast fixes (FAQ)",
        items: [
          {
            q: "Something looks stuck / old UI won’t update",
            tags: "refresh",
            a: (
              <>
                <p>
                  If something looks stale or stuck, refresh the app state and
                  make sure you are on the latest build.
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Hard refresh the page.</li>
                  <li>Close and reopen the app.</li>
                  <li>
                    If you’re developing: stop and restart the dev server.
                  </li>
                  <li>
                    If it persists: copy diagnostics and report the issue.
                  </li>
                </ul>
              </>
            ),
          },
          {
            q: "Buttons feel hard to tap on mobile",
            tags: "mobile",
            a: (
              <>
                <p>
                  Some devices need bigger hit targets. Start with Settings and
                  try toggling the options there.
                </p>
                <p>
                  Go to{" "}
                  <Link to="/settings" className={LINK}>
                    Settings
                  </Link>
                  .
                </p>
              </>
            ),
          },
          {
            q: "I see a blank/black screen",
            tags: "render",
            a: (
              <>
                <p>
                  Reload first. If it persists, reset local data and reopen.
                </p>
                <p className="text-xs text-zinc-400">
                  If you’re reporting a bug: include a screenshot and copy the
                  diagnostics below.
                </p>
              </>
            ),
          },
          {
            q: "Where do I start?",
            tags: "getting started",
            a: (
              <>
                <ol className="list-decimal list-inside space-y-1">
                  <li>
                    Go to{" "}
                    <Link to="/adopt" className={LINK}>
                      Adopt
                    </Link>{" "}
                    and pick your pup.
                  </li>
                  <li>
                    Head to{" "}
                    <Link to="/game" className={LINK}>
                      Play
                    </Link>{" "}
                    to care, potty train, and progress.
                  </li>
                </ol>
              </>
            ),
          },
        ],
      },
      {
        id: "game",
        title: "Gameplay",
        items: [
          {
            q: "What does potty training unlock?",
            tags: "progression",
            a: (
              <>
                <p>
                  Potty training is an early “gate” — it unlocks more actions
                  and progression.
                </p>
              </>
            ),
          },
          {
            q: "Why does my dog’s mood change?",
            tags: "needs",
            a: (
              <>
                <p>
                  Mood follows core needs like hunger, energy, cleanliness, and
                  happiness. Keeping stats balanced keeps your pup happy.
                </p>
              </>
            ),
          },
        ],
      },
      {
        id: "account",
        title: "Account & sign-in",
        items: [
          {
            q: "Where are Login/Signup?",
            tags: "auth",
            a: (
              <>
                <p>
                  They’re available as routes:
                  <span className="ml-2">
                    <Link to="/login" className={LINK}>
                      /login
                    </Link>
                  </span>
                  <span className="ml-2">
                    <Link to="/signup" className={LINK}>
                      /signup
                    </Link>
                  </span>
                </p>
                <p className="text-xs text-zinc-400">
                  (Auth may still be “stubbed” depending on your Firebase
                  config.)
                </p>
              </>
            ),
          },
          {
            q: "I lost progress / my dog reset",
            tags: "storage • offline",
            a: (
              <>
                <p>
                  Progress is stored locally for offline play. Clearing browser
                  storage, using private browsing, or switching devices can look
                  like a reset.
                </p>
                <p>
                  If you want to intentionally wipe local data, use the “Reset
                  local data” action below.
                </p>
              </>
            ),
          },
        ],
      },
      {
        id: "dev",
        title: "Developer / setup",
        items: [
          {
            q: "How do I run this locally?",
            tags: "dev",
            a: (
              <>
                <p>
                  This is a Vite + React app. Use <code>npm install</code> then{" "}
                  <code>npm run dev</code>.
                </p>
                <p>
                  Environment variables go in <code>.env.local</code> (start
                  from <code>.env.example</code>).
                </p>
                <p className="text-xs text-zinc-400">
                  For Android builds, sync web assets with{" "}
                  <code>npx cap copy android</code> after web build updates.
                </p>
              </>
            ),
          },
          {
            q: "Firebase is optional, right?",
            tags: "firebase",
            a: (
              <>
                <p>
                  Yep. Doggerz is designed to work offline-first. Firebase
                  powers sign-in/sync features when configured.
                </p>
              </>
            ),
          },
          {
            q: "Where are Potty and Temperament pages?",
            tags: "routes",
            a: (
              <>
                <p>
                  Potty training guide:
                  <span className="ml-2">
                    <Link to="/potty" className={LINK}>
                      /potty
                    </Link>
                  </span>
                </p>
                <p>
                  Temperament reveal:
                  <span className="ml-2">
                    <Link to="/temperament-reveal" className={LINK}>
                      /temperament-reveal
                    </Link>
                  </span>
                </p>
              </>
            ),
          },
          {
            q: "Where’s the GitHub repo?",
            tags: "github",
            a: (
              <>
                <p>
                  Here you go:{" "}
                  <a
                    className={LINK}
                    href={repoUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {repoUrl}
                  </a>
                </p>
                <p className="text-xs text-zinc-400">
                  Tip: if you hit a bug, open an issue and paste the diagnostics
                  below.
                </p>
              </>
            ),
          },
        ],
      },
    ],
    [repoUrl]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return topics;

    return topics
      .map((t) => {
        const items = t.items.filter((it) => {
          const hay = `${it.q} ${it.tags} ${it.search || ""}`.toLowerCase();
          return hay.includes(q);
        });
        return { ...t, items };
      })
      .filter((t) => t.items.length > 0);
  }, [query, topics]);

  const copyDiag = useCallback(async () => {
    const ok = await copyToClipboard(safeJson(diagnostics));
    if (ok) {
      toast.success("Diagnostics copied");
      setNoticeAuto({
        kind: "success",
        text: "Diagnostics copied. Paste them into your message.",
      });
    } else {
      toast.error("Couldn’t copy (clipboard blocked)");
      setNoticeAuto({
        kind: "error",
        text: "Couldn’t copy diagnostics. Your browser may block clipboard access.",
      });
    }
  }, [diagnostics, setNoticeAuto, toast]);

  return (
    <PageShell mainClassName="p-0" containerClassName="w-full max-w-none">
      <div className="min-h-[calc(100dvh-120px)] w-full">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className={`${SURFACE} overflow-hidden`}>
            <div className="p-8 sm:p-10">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5">
                <div>
                  <div className="text-emerald-700 font-extrabold tracking-[0.38em] text-xs">
                    H E L P
                  </div>
                  <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold text-emerald-200">
                    Support and troubleshooting
                  </h1>
                  <p className="mt-3 text-sm text-zinc-300 max-w-2xl">
                    This is the in-app help hub for bug recovery, support steps,
                    and quick diagnostics.
                  </p>
                </div>

                <div className="w-full md:w-[380px]">
                  <label className="text-xs text-zinc-400 font-semibold">
                    Search
                  </label>
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Try: firebase, potty, mobile…"
                    className="mt-1 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                  />
                </div>
              </div>

              {notice ? (
                <div
                  className={[
                    "mt-6 rounded-2xl border px-4 py-3 text-sm",
                    notice.kind === "success"
                      ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-100"
                      : notice.kind === "error"
                        ? "border-red-500/25 bg-red-500/10 text-red-100"
                        : "border-sky-500/25 bg-sky-500/10 text-sky-100",
                  ].join(" ")}
                  role="status"
                  aria-live="polite"
                >
                  {notice.text}
                </div>
              ) : null}

              <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Section id="guidebook" title="Guidebook">
                  <div className="space-y-4">
                    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                      <div className="text-sm font-extrabold text-amber-200">
                        1. Keep Fireball active
                      </div>
                      <p className="mt-2 text-sm text-zinc-300">
                        Watch Energy and Health. Feeding, play, sleep, and clean
                        care keep your pup out of a bad mood spiral.
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                      <div className="text-sm font-extrabold text-amber-200">
                        2. Expect terrier chaos
                      </div>
                      <p className="mt-2 text-sm text-zinc-300">
                        Jack Russells are chaos engines. Expect messy moods,
                        surprise bursts of energy, and a dog that does not
                        always cooperate on command.
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                      <div className="text-sm font-extrabold text-amber-200">
                        3. Real-world weather matters
                      </div>
                      <p className="mt-2 text-sm text-zinc-300">
                        Time of day and local weather can shift the yard mood,
                        ambience, and behavior cues.
                      </p>
                    </div>
                  </div>
                </Section>

                <Section id="build" title="Build">
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-5 text-center">
                    <div className="text-2xl font-black text-zinc-100">
                      Doggerz
                    </div>
                    <div className="mt-1 text-sm text-zinc-400">
                      Version {APP_VERSION} (Closed Alpha)
                    </div>
                    <div className="mt-4 text-sm text-zinc-200">
                      Designed and developed solo.
                    </div>
                    <div className="mt-1 text-xs text-zinc-500">
                      Built with Capacitor and Firebase.
                    </div>
                  </div>
                </Section>
              </div>

              <div className="mt-6 grid grid-cols-1 lg:grid-cols-1 gap-3">
                <button
                  type="button"
                  onClick={handleResetLocalData}
                  className="rounded-2xl border border-amber-500/25 bg-amber-500/10 p-4 text-left hover:bg-amber-500/15 transition"
                >
                  <div className="text-sm font-extrabold text-amber-100">
                    Reset local data
                  </div>
                  <div className="mt-1 text-xs text-amber-100/70">
                    Clears your pup + settings on this device.
                  </div>
                </button>
              </div>

              <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filtered.map((t) => (
                  <Section key={t.id} id={t.id} title={t.title}>
                    <div className="space-y-3">
                      {t.items.map((it) => (
                        <Q key={it.q} q={it.q} tags={it.tags}>
                          {it.a}
                        </Q>
                      ))}
                    </div>
                  </Section>
                ))}
              </div>

              <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Section
                  id="diagnostics"
                  title="Diagnostics (copy/paste for bug reports)"
                >
                  <p className="text-sm text-zinc-300">
                    This is safe to share. It helps debug platform issues and
                    environment problems.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={copyDiag}
                      className="rounded-2xl px-4 py-2 text-sm font-extrabold bg-emerald-400 text-black shadow-[0_0_25px_rgba(52,211,153,0.25)] hover:shadow-[0_0_35px_rgba(52,211,153,0.40)] transition"
                    >
                      Copy diagnostics
                    </button>
                    <a
                      href={repoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-2xl px-4 py-2 text-sm font-bold border border-emerald-500/25 bg-black/30 text-emerald-100 hover:bg-black/45 transition"
                    >
                      Open GitHub
                    </a>
                  </div>
                  <pre className="mt-4 max-h-64 overflow-auto rounded-2xl border border-white/10 bg-black/30 p-4 text-[11px] text-zinc-200/85">
                    {safeJson(diagnostics)}
                  </pre>
                </Section>

                <Section id="requests" title="Need something added?">
                  <p>
                    Want a feature or want to report a bug? Use the repo link
                    below with copied diagnostics.
                  </p>
                  <p>
                    Repo:{" "}
                    <a
                      className={LINK}
                      href={repoUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {repoUrl}
                    </a>
                  </p>
                </Section>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
