// src/pages/Help.jsx
<<<<<<< HEAD
// @ts-nocheck

import React, { useCallback, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useToast } from "@/components/toast/ToastProvider.jsx";

const SURFACE =
  "rounded-3xl border border-emerald-500/15 bg-black/35 backdrop-blur-md shadow-[0_0_60px_rgba(16,185,129,0.10)]";
const CARD = "rounded-2xl border border-white/10 bg-black/25";
const LINK =
  "text-emerald-300 hover:text-emerald-200 underline underline-offset-4";

const DOG_STORAGE_KEY = "doggerz:dogState";
const USER_STORAGE_KEY = "doggerz:userState";
const WORKFLOW_STORAGE_KEY = "doggerz:workflows";

function safeJson(value) {
  try {
    return JSON.stringify(value, null, 2);
  } catch (e) {
    return String(value);
  }
}

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (e) {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch (e2) {
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

function Q({ q, children, tags = "" }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="font-bold text-emerald-100">{q}</div>
        {tags ? (
          <div className="text-[11px] text-zinc-400 shrink-0">{tags}</div>
        ) : null}
      </div>
      <div className="mt-2 text-sm text-zinc-200/85 leading-relaxed">
        {children}
      </div>
    </div>
  );
}

export default function HelpPage() {
  const toast = useToast();
  const [query, setQuery] = useState("");

  const [notice, setNotice] = useState(null);

  const diagnostics = useMemo(() => {
    const now = new Date();
    return {
      app: "Doggerz",
      time: now.toISOString(),
      url: typeof window !== "undefined" ? window.location.href : undefined,
      mode: import.meta.env.MODE,
      online: typeof navigator !== "undefined" ? navigator.onLine : undefined,
      userAgent:
        typeof navigator !== "undefined" ? navigator.userAgent : undefined,
      platform:
        typeof navigator !== "undefined" ? navigator.platform : undefined,
      language:
        typeof navigator !== "undefined" ? navigator.language : undefined,
      serviceWorker: {
        supported:
          typeof navigator !== "undefined" && "serviceWorker" in navigator,
        controlled:
          typeof navigator !== "undefined"
            ? Boolean(navigator.serviceWorker?.controller)
            : false,
      },
    };
  }, []);

  const repoUrl = "https://github.com/Catfishfishcat10101/doggerz";

  const setNoticeAuto = useCallback((n) => {
    setNotice(n);
    window.setTimeout(() => setNotice(null), 4500);
  }, []);

  const handleClearCache = useCallback(async () => {
    try {
      if (typeof window === "undefined") return;

      // Clear Cache Storage (PWA/static assets)
      if ("caches" in window) {
        const keys = await window.caches.keys();
        await Promise.all(keys.map((k) => window.caches.delete(k)));
      }

      // Ask SW to update (if present). Not all browsers support this cleanly.
      if ("serviceWorker" in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map((r) => r.update().catch(() => null)));
      }

      setNoticeAuto({ kind: "success", text: "Cache cleared. Reloading…" });
      window.setTimeout(() => window.location.reload(), 450);
    } catch (e) {
      console.warn("[Help] clearCache failed", e);
      setNoticeAuto({
        kind: "error",
        text: "Couldn’t clear cache. Try a hard refresh or reinstall the app.",
      });
    }
  }, [setNoticeAuto]);

  const handleUnregisterSW = useCallback(async () => {
    try {
      if (typeof window === "undefined") return;
      if (!("serviceWorker" in navigator)) {
        setNoticeAuto({ kind: "info", text: "Service workers aren’t supported here." });
        return;
      }
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map((r) => r.unregister()));
      setNoticeAuto({ kind: "success", text: "Service worker unregistered. Reloading…" });
      window.setTimeout(() => window.location.reload(), 450);
    } catch (e) {
      console.warn("[Help] unregisterSW failed", e);
      setNoticeAuto({ kind: "error", text: "Couldn’t unregister the service worker." });
    }
  }, [setNoticeAuto]);

  const handleResetLocalData = useCallback(async () => {
    try {
      const ok = window.confirm(
        "Reset local Doggerz data on this device? This clears your pup + settings and cannot be undone.",
      );
      if (!ok) return;

      // Remove known Doggerz keys (avoid nuking unrelated sites' storage)
      try {
        window.localStorage.removeItem(DOG_STORAGE_KEY);
        window.localStorage.removeItem(USER_STORAGE_KEY);
        window.localStorage.removeItem(WORKFLOW_STORAGE_KEY);
        window.localStorage.removeItem("theme");
      } catch (e) {
        // ignore storage permissions
      }

      // Also clear caches if available (optional but helpful)
      if ("caches" in window) {
        const keys = await window.caches.keys();
        await Promise.all(keys.map((k) => window.caches.delete(k)));
      }

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
            tags: "cache • pwa",
            a: (
              <>
                <p>
                  If you installed Doggerz as an app (PWA), caching can make you
                  see an older build.
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Hard refresh the page.</li>
                  <li>Close the installed app completely and reopen it.</li>
                  <li>
                    If you’re developing: stop and restart the dev server.
                  </li>
                  <li>
                    If it persists: use the actions below (clear cache or
                    unregister the service worker).
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
                  Go to <Link to="/settings" className={LINK}>Settings</Link>.
                </p>
              </>
            ),
          },
          {
            q: "I see a blank/black screen",
            tags: "render • cache",
            a: (
              <>
                <p>
                  Reload first. If it persists, clear cached assets and reload.
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
                    Go to <Link to="/adopt" className={LINK}>Adopt</Link> and pick your pup.
                  </li>
                  <li>
                    Head to <Link to="/game" className={LINK}>Play</Link> to care, potty train, and progress.
                  </li>
                </ol>
              </>
            ),
          },
        ],
      },
      {
        id: "pwa",
        title: "Install & offline (PWA)",
        items: [
          {
            q: "How do I install Doggerz as an app?",
            tags: "install • pwa",
            a: (
              <>
                <p>
                  On desktop, look for an “Install” button in the address bar.
                  On mobile, use the browser menu → “Add to Home Screen”.
                </p>
                <p className="text-xs text-zinc-400">
                  Doggerz can be offline-first once cached.
                </p>
              </>
            ),
          },
          {
            q: "Offline: what works and what won’t?",
            tags: "offline",
            a: (
              <>
                <p>
                  Core gameplay should run once cached. Anything requiring the
                  network (sign-in/sync) may be unavailable.
                </p>
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
                  Potty training is an early “gate” — it unlocks more actions and
                  progression.
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
                    <Link to="/login" className={LINK}>/login</Link>
                  </span>
                  <span className="ml-2">
                    <Link to="/signup" className={LINK}>/signup</Link>
                  </span>
                </p>
                <p className="text-xs text-zinc-400">
                  (Auth may still be “stubbed” depending on your Firebase config.)
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
                  This is a Vite + React app. Use <code>npm install</code> then <code>npm run dev</code>.
                </p>
                <p>
                  Environment variables go in <code>.env.local</code> (start from <code>.env.example</code>).
                </p>
                <p className="text-xs text-zinc-400">
                  If your UI looks stale in production, it’s usually service-worker caching.
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
                  Yep. Doggerz is designed to work offline-first. Firebase powers
                  sign-in/sync features when configured.
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
                    <Link to="/potty" className={LINK}>/potty</Link>
                  </span>
                </p>
                <p>
                  Temperament reveal:
                  <span className="ml-2">
                    <Link to="/temperament" className={LINK}>/temperament</Link>
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
                  Here you go: <a className={LINK} href={repoUrl} target="_blank" rel="noreferrer">{repoUrl}</a>
                </p>
                <p className="text-xs text-zinc-400">
                  Tip: if you hit a bug, open an issue and paste the diagnostics below.
                </p>
              </>
            ),
          },
        ],
      },
    ],
    []
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
                  FAQs, troubleshooting, and developer info
                </h1>
                <p className="mt-3 text-sm text-zinc-300 max-w-2xl">
                  This page is your “what broke and how do I fix it” hub — plus
                  setup notes if you’re running Doggerz locally.
                </p>
              </div>

              <div className="w-full md:w-[380px]">
                <label className="text-xs text-zinc-400 font-semibold">
                  Search
                </label>
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Try: cache, firebase, potty, mobile…"
                  className="mt-1 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                />
              </div>
            </div>

            {notice ? (
              <div
                className={
                  [
                    "mt-6 rounded-2xl border px-4 py-3 text-sm",
                    notice.kind === "success"
                      ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-100"
                      : notice.kind === "error"
                        ? "border-red-500/25 bg-red-500/10 text-red-100"
                        : "border-sky-500/25 bg-sky-500/10 text-sky-100",
                  ].join(" ")
                }
                role="status"
                aria-live="polite"
              >
                {notice.text}
              </div>
            ) : null}

            <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={handleClearCache}
                className="rounded-2xl border border-white/10 bg-black/25 p-4 text-left hover:bg-black/35 transition"
              >
                <div className="text-sm font-extrabold text-emerald-200">
                  Clear cache + reload
                </div>
                <div className="mt-1 text-xs text-zinc-400">
                  Fixes stale assets after updates.
                </div>
              </button>

              <button
                type="button"
                onClick={handleUnregisterSW}
                className="rounded-2xl border border-white/10 bg-black/25 p-4 text-left hover:bg-black/35 transition"
              >
                <div className="text-sm font-extrabold text-emerald-200">
                  Unregister service worker
                </div>
                <div className="mt-1 text-xs text-zinc-400">
                  Nuclear option for stubborn PWA caching.
                </div>
              </button>

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
              <Section title="Diagnostics (copy/paste for bug reports)">
                <p className="text-sm text-zinc-300">
                  This is safe to share. It helps debug caching, platform issues,
                  and environment problems.
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

              <Section title="Need something added?">
                <p>
                  Want more FAQs, a feature, or a UI tweak? Drop it on GitHub and
                  we’ll ship it.
                </p>
                <p>
                  Repo: <a className={LINK} href={repoUrl} target="_blank" rel="noreferrer">{repoUrl}</a>
                </p>
                <p className="text-sm text-zinc-400">
                  (If you want a dedicated “Developer” page too, say the word —
                  we can split this into Help + Dev Docs.)
                </p>
              </Section>
            </div>
          </div>
        </div>

        <div className="mt-6 text-xs text-zinc-500">
          Tip: For the best mobile experience, consider installing Doggerz as an
          app (PWA) via your browser’s “Install” / “Add to Home Screen” option.
        </div>
      </div>
    </div>
=======
import { Link } from "react-router-dom";

import { SUPPORT_CONTACT_URL } from "@/config/links.js";

import Header from "@/components/Header.jsx";
import Footer from "@/components/Footer.jsx";

export default function HelpPage() {
  return (
    <>
      <Header />
      <div className="flex-1 px-6 py-10 flex justify-center">
        <div className="max-w-3xl w-full space-y-6">
          <h1 className="text-3xl font-black tracking-tight">Help</h1>

          <p className="text-sm text-zinc-300">
            Need a hand? Here are the quickest ways to get unstuck.
          </p>

          <section className="space-y-2 text-sm text-zinc-300">
            <h2 className="font-semibold text-zinc-100">Common fixes</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>Try refreshing the page if something looks frozen.</li>
              <li>If you installed the app, restarting it can clear stale state.</li>
              <li>Check your connection if sign-in isn’t working.</li>
            </ul>
          </section>

          <section className="space-y-2 text-sm text-zinc-300">
            <h2 className="font-semibold text-zinc-100">Need support?</h2>
            <p>
              Reach out via <Link to={SUPPORT_CONTACT_URL} className="text-emerald-300 hover:text-emerald-200">Contact Us</Link>.
            </p>
          </section>

          <div className="pt-2 text-sm">
            <Link to="/" className="text-emerald-300 hover:text-emerald-200">← Back to home</Link>
          </div>
        </div>
      </div>

      <Footer />
    </>
>>>>>>> master
  );
}
