// src/pages/Help.jsx
import React, { useCallback, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PageShell from "@/components/PageShell.jsx";

const LINK_CLASS =
  "text-emerald-700 underline-offset-2 hover:text-emerald-600 hover:underline dark:text-emerald-300 dark:hover:text-emerald-200";

const SURFACE =
  "rounded-2xl border border-zinc-200/70 bg-white/80 dark:border-white/10 dark:bg-black/20";
const CARD =
  "rounded-xl border border-zinc-200/70 bg-white/70 dark:border-white/10 dark:bg-white/5";
const PANEL =
  "rounded-lg border border-zinc-200/70 bg-white/70 dark:border-white/10 dark:bg-black/30";
const TITLE = "text-zinc-900 dark:text-white/90";
const BODY = "text-zinc-700 dark:text-white/70";
const MUTED = "text-zinc-600 dark:text-white/55";
const BTN =
  "rounded-xl border border-zinc-200/70 bg-white/70 text-left text-sm text-zinc-900 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-white/90 dark:hover:bg-white/10";

function toTextSafe(v) {
  try {
    return typeof v === "string" ? v : JSON.stringify(v, null, 2);
  } catch {
    return String(v);
  }
}

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers / denied permissions.
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
    } catch {
      return false;
    }
  }
}

function getDisplayMode() {
  try {
    const standalone =
      window.matchMedia?.("(display-mode: standalone)")?.matches ||
      window.navigator.standalone === true;
    return standalone ? "standalone" : "browser";
  } catch {
    return "unknown";
  }
}

export default function HelpPage() {
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState(null);
  const q = query.trim().toLowerCase();

  const diagnostics = useMemo(() => {
    const swSupported = typeof navigator !== "undefined" && "serviceWorker" in navigator;
    const online = typeof navigator !== "undefined" ? navigator.onLine : undefined;
    const ua = typeof navigator !== "undefined" ? navigator.userAgent : undefined;

    return {
      app: "Doggerz",
      mode: import.meta.env.MODE,
      time: new Date().toISOString(),
      url: typeof window !== "undefined" ? window.location.href : undefined,
      online,
      displayMode: typeof window !== "undefined" ? getDisplayMode() : undefined,
      userAgent: ua,
      language: typeof navigator !== "undefined" ? navigator.language : undefined,
      platform: typeof navigator !== "undefined" ? navigator.platform : undefined,
      serviceWorker: {
        supported: swSupported,
        controlled: swSupported ? Boolean(navigator.serviceWorker?.controller) : false,
      },
      storage: undefined,
    };
  }, []);

  const TOPICS = useMemo(
    () => [
      {
        id: "fast-fixes",
        title: "Fast fixes",
        blurb: "Most issues are solved in 60 seconds.",
        items: [
          {
            q: "The screen looks stuck / loading forever",
            a: (
              <div className="space-y-2">
                <p>
                  Try a hard refresh first. If you installed Doggerz as an app, fully close it and reopen.
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Refresh the page.</li>
                  <li>Toggle Airplane Mode on/off (forces a clean network handshake).</li>
                  <li>
                    If it's still stuck, use the "Clear cache" button below (safe) or the "Reset local data"
                    option (destructive).
                  </li>
                </ul>
              </div>
            ),
            search:
              "stuck loading forever hard refresh close reopen clear cache reset local data",
          },
          {
            q: "Buttons feel hard to tap (mobile)",
            a: (
              <div className="space-y-2">
                <p>
                  If taps feel "finicky", turn on larger hit targets and focus rings in Settings.
                </p>
                <p>
                  Go to <Link to="/settings" className={LINK_CLASS}>Settings</Link> → Accessibility.
                </p>
              </div>
            ),
            search: "mobile tap hard to tap hit targets focus rings accessibility",
          },
          {
            q: "I'm seeing weird layout / fonts",
            a: (
              <div className="space-y-2">
                <p>
                  That's usually cached CSS from an older version. Clear the app cache, then reload.
                </p>
                <p className={`text-sm ${BODY}`}>
                  Tip: If you use browser extensions that modify pages (font replacers, dark-mode injectors),
                  try disabling them for Doggerz.
                </p>
              </div>
            ),
            search: "layout fonts css cached dark mode extension",
          },
        ],
      },
      {
        id: "account",
        title: "Account & sign-in",
        blurb: "Login, signup, sync, and recovery.",
        items: [
          {
            q: "I can't log in",
            a: (
              <div className="space-y-2">
                <p>
                  Doggerz supports an offline-first mode, but full account sign-in requires Firebase to be configured.
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Confirm you're online.</li>
                  <li>Try a different browser (or disable strict privacy extensions temporarily).</li>
                  <li>
                    If you're the developer: confirm your Firebase keys are present and correct.
                  </li>
                </ul>
                <p>
                  Still stuck? Send us a note via <Link to="/contact" className={LINK_CLASS}>Contact Us</Link> and include your
                  diagnostics (copy button below).
                </p>
              </div>
            ),
            search: "can't log in login signup firebase keys auth offline",
          },
          {
            q: "I lost progress / my dog reset",
            a: (
              <div className="space-y-2">
                <p>
                  On most devices, Doggerz stores your pup locally for offline play. Clearing browser storage,
                  using incognito, or switching devices/browsers can look like a reset.
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Check that you're using the same browser/profile as before.</li>
                  <li>Check if you're logged into the same account (if enabled).</li>
                  <li>Avoid Private/Incognito mode for long-term play.</li>
                </ul>
              </div>
            ),
            search: "lost progress dog reset local storage incognito",
          },
        ],
      },
      {
        id: "pwa-offline",
        title: "Install & offline",
        blurb: "Using Doggerz as an app + offline behavior.",
        items: [
          {
            q: "How do I install Doggerz as an app?",
            a: (
              <div className="space-y-2">
                <p>
                  On desktop, look for an "Install" button in your browser's address bar. On mobile,
                  use the browser menu and choose "Add to Home Screen".
                </p>
                <p className={`text-sm ${BODY}`}>
                  Once installed, Doggerz launches faster and can work offline for core gameplay.
                </p>
              </div>
            ),
            search: "install app add to home screen pwa",
          },
          {
            q: "Offline: what works and what doesn't?",
            a: (
              <div className="space-y-2">
                <p>
                  Core gameplay is designed to be resilient offline, but anything that needs the network (like
                  some sign-in or live data) may be unavailable.
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Game screens: should load once cached.</li>
                  <li>Account sync: may require an active connection.</li>
                  <li>Updates: require going online and reloading.</li>
                </ul>
              </div>
            ),
            search: "offline works doesn't cached update",
          },
          {
            q: "I updated but I'm still seeing old assets",
            a: (
              <div className="space-y-2">
                <p>
                  That's almost always service worker caching. Clear cache and reload.
                </p>
                <p className={`text-sm ${BODY}`}>
                  If you're in development mode, Doggerz intentionally does not register the service worker.
                </p>
              </div>
            ),
            search: "update old assets service worker cache",
          },
        ],
      },
      {
        id: "gameplay",
        title: "Gameplay",
        blurb: "What to do, what things mean, and how to progress.",
        items: [
          {
            q: "What should I do first?",
            a: (
              <div className="space-y-2">
                <ol className="list-decimal list-inside space-y-1">
                  <li>
                    Start at <Link to="/adopt" className={LINK_CLASS}>Adopt</Link> to pick your pup.
                  </li>
                  <li>
                    Head to the <Link to="/game" className={LINK_CLASS}>Game</Link> and keep Hunger/Energy/Happiness healthy.
                  </li>
                  <li>
                    Train a little each day for streaks, coins, and skill growth.
                  </li>
                </ol>
              </div>
            ),
            search: "first steps adopt game hunger energy happiness train",
          },
          {
            q: "My dog's mood keeps dropping",
            a: (
              <div className="space-y-2">
                <p>
                  Mood is influenced by basic needs (hunger, energy, cleanliness, happiness) and recent interactions.
                  Try a simple loop: feed → play → rest → quick clean.
                </p>
                <p>
                  If you want a structured plan, the <Link to="/potty" className={LINK_CLASS}>Potty</Link> page also includes
                  consistency tips that help overall behavior.
                </p>
              </div>
            ),
            search: "mood dropping hunger energy cleanliness happiness",
          },
        ],
      },
      {
        id: "performance",
        title: "Performance & crashes",
        blurb: "Lag, freezes, black screens, and stability.",
        items: [
          {
            q: "Doggerz feels laggy",
            a: (
              <div className="space-y-2">
                <ul className="list-disc list-inside space-y-1">
                  <li>Close other heavy tabs/apps.</li>
                  <li>
                    Turn on reduced motion in <Link to="/settings" className={LINK_CLASS}>Settings</Link>.
                  </li>
                  <li>Reload the page after long sessions.</li>
                </ul>
                <p className={`text-sm ${BODY}`}>
                  If you're on a low-power device, using Doggerz as an installed app can improve stability.
                </p>
              </div>
            ),
            search: "laggy slow performance reduced motion",
          },
          {
            q: "I'm seeing a blank screen",
            a: (
              <div className="space-y-2">
                <p>
                  Try reloading. If it persists, clear cached assets and reload.
                </p>
                <p>
                  If you can, include a screenshot + your diagnostics when you contact us.
                </p>
              </div>
            ),
            search: "blank screen black screen reload clear cache",
          },
        ],
      },
      {
        id: "privacy",
        title: "Privacy & data control",
        blurb: "What's stored locally and how to reset it.",
        items: [
          {
            q: "What data is stored on my device?",
            a: (
              <div className="space-y-2">
                <p>
                  Doggerz stores your pup and preferences locally so the game can work smoothly (including offline).
                  If you clear your browser data, that local progress may be removed.
                </p>
                <p>
                  For more details, see <Link to="/privacy" className={LINK_CLASS}>Policy</Link>.
                </p>
              </div>
            ),
            search: "privacy stored data local device policy",
          },
          {
            q: "How do I delete/reset my local data?",
            a: (
              <div className="space-y-2">
                <p>
                  Use the "Reset local data" button below. This clears your local pup + settings on this device.
                </p>
                <p className="text-sm text-amber-200/90">
                  Warning: this action cannot be undone.
                </p>
              </div>
            ),
            search: "delete reset local data clear storage",
          },
        ],
      },
    ],
    []
  );

  const filteredTopics = useMemo(() => {
    if (!q) return TOPICS;
    return TOPICS.map((t) => {
      const items = (t.items || []).filter((it) => {
        const hay = `${it.q} ${it.search || ""}`.toLowerCase();
        return hay.includes(q);
      });
      return { ...t, items };
    }).filter((t) => (t.items || []).length > 0);
  }, [TOPICS, q]);

  const handleCopyDiagnostics = useCallback(async () => {
    const ok = await copyToClipboard(toTextSafe(diagnostics));
    setNotice(
      ok
        ? { kind: "success", text: "Diagnostics copied. Paste them into your message." }
        : { kind: "error", text: "Couldn't copy diagnostics. Your browser may block clipboard access." }
    );
    window.setTimeout(() => setNotice(null), 4500);
  }, [diagnostics]);

  const handleClearCache = useCallback(async () => {
    try {
      if (!("caches" in window)) {
        setNotice({ kind: "info", text: "Cache API not available in this browser." });
        window.setTimeout(() => setNotice(null), 4500);
        return;
      }
      const keys = await window.caches.keys();
      await Promise.all(keys.map((k) => window.caches.delete(k)));
      setNotice({ kind: "success", text: "Cache cleared. Reloading…" });
      window.setTimeout(() => window.location.reload(), 500);
    } catch (e) {
      console.warn("[Help] clearCache failed", e);
      setNotice({ kind: "error", text: "Couldn't clear cache. Try reloading or reinstalling the app." });
      window.setTimeout(() => setNotice(null), 4500);
    }
  }, []);

  const handleResetLocalData = useCallback(async () => {
    const ok = window.confirm(
      "Reset local Doggerz data on this device? This clears your pup + settings and cannot be undone."
    );
    if (!ok) return;

    const KEYS = ["doggerz:dogState", "doggerz:userState", "doggerz:settingsState"]; // keep in sync with redux slices
    try {
      for (const k of KEYS) {
        try {
          window.localStorage.removeItem(k);
        } catch {
          // ignore
        }
      }
      try {
        window.sessionStorage.clear();
      } catch {
        // ignore
      }
      setNotice({ kind: "success", text: "Local data reset. Reloading…" });
      window.setTimeout(() => window.location.reload(), 500);
    } catch (e) {
      console.warn("[Help] resetLocalData failed", e);
      setNotice({ kind: "error", text: "Couldn't reset local data." });
      window.setTimeout(() => setNotice(null), 4500);
    }
  }, []);

  const handleUnregisterSW = useCallback(async () => {
    try {
      if (!("serviceWorker" in navigator)) {
        setNotice({ kind: "info", text: "Service workers aren't supported in this browser." });
        window.setTimeout(() => setNotice(null), 4500);
        return;
      }
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map((r) => r.unregister()));
      setNotice({ kind: "success", text: "Service worker unregistered. Reloading…" });
      window.setTimeout(() => window.location.reload(), 500);
    } catch (e) {
      console.warn("[Help] unregisterSW failed", e);
      setNotice({ kind: "error", text: "Couldn't unregister the service worker." });
      window.setTimeout(() => setNotice(null), 4500);
    }
  }, []);

  const noticeStyles =
    notice?.kind === "success"
      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-950 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-100"
      : notice?.kind === "error"
        ? "border-rose-500/30 bg-rose-500/10 text-rose-950 dark:border-rose-400/30 dark:bg-rose-400/10 dark:text-rose-100"
        : "border-zinc-200/70 bg-white/80 text-zinc-900 dark:border-white/10 dark:bg-black/20 dark:text-white/80";

  return (
    <PageShell mainClassName="px-4 py-10">
      <div className="mx-auto w-full max-w-6xl">
        <header className="space-y-3">
          <p className="text-[11px] uppercase tracking-[0.26em] text-emerald-700 dark:text-emerald-300/90">
            Help
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
                Get unstuck
              </h1>
              <p className={`max-w-2xl text-sm ${BODY}`}>
                A practical guide to fixing common issues, understanding the basics, and sharing useful info when
                you need support.
              </p>
            </div>

            <div className="w-full sm:w-[360px]">
              <label htmlFor="help-search" className="sr-only">
                Search help topics
              </label>
              <div className="relative">
                <input
                  id="help-search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder='Search: "login", "offline", "lag", "install"'
                  className="w-full rounded-xl border border-zinc-300/60 bg-white/70 px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-500 shadow-sm outline-none focus:border-emerald-500/40 focus:ring-2 focus:ring-emerald-500/20 dark:border-white/10 dark:bg-black/25 dark:text-white dark:placeholder:text-white/40 dark:focus:border-emerald-400/40 dark:focus:ring-emerald-400/20"
                />
                {query ? (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs text-zinc-700 hover:bg-zinc-900/5 hover:text-zinc-900 dark:text-white/70 dark:hover:bg-white/10 dark:hover:text-white"
                    aria-label="Clear search"
                  >
                    Clear
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </header>

        {notice ? (
          <div className={`mt-6 rounded-2xl border p-4 text-sm ${noticeStyles}`} role="status">
            {notice.text}
          </div>
        ) : null}

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12">
          <aside className="lg:col-span-4">
            <div className="space-y-4 lg:sticky lg:top-24">
              <section className={`${SURFACE} p-5`}>
                <h2 className={`text-base font-semibold ${TITLE}`}>Quick actions</h2>
                <p className={`mt-1 text-sm ${BODY}`}>
                  Safe buttons for the classic "why is it being weird" moments.
                </p>

                <div className="mt-4 grid grid-cols-1 gap-2">
                  <button type="button" onClick={() => window.location.reload()} className={BTN}>
                    Reload
                    <div className={`text-xs ${MUTED}`}>
                      Good for temporary hiccups.
                    </div>
                  </button>

                  <button type="button" onClick={handleClearCache} className={BTN}>
                    Clear cache + reload
                    <div className={`text-xs ${MUTED}`}>
                      Fixes stale assets after updates.
                    </div>
                  </button>

                  <button type="button" onClick={handleUnregisterSW} className={BTN}>
                    Unregister offline worker
                    <div className={`text-xs ${MUTED}`}>
                      If caching gets stubborn (advanced).
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={handleResetLocalData}
                    className="rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-2.5 text-left text-sm text-amber-950 hover:bg-amber-500/15 dark:border-amber-400/25 dark:bg-amber-400/10 dark:text-amber-100 dark:hover:bg-amber-400/15"
                  >
                    Reset local data
                    <div className="text-xs text-amber-950/70 dark:text-amber-100/70">
                      Clears local pup + settings on this device.
                    </div>
                  </button>
                </div>
              </section>

              <section className={`${SURFACE} p-5`}>
                <h2 className={`text-base font-semibold ${TITLE}`}>Need support?</h2>
                <p className={`mt-1 text-sm ${BODY}`}>
                  Tell us what happened and we'll help you faster.
                </p>

                <div className="mt-4 space-y-3">
                  <div className={`${CARD} p-4`}>
                    <div className={`text-sm font-semibold ${TITLE}`}>Contact</div>
                    <p className={`mt-1 text-sm ${BODY}`}>
                      Reach out via <Link to="/contact" className={LINK_CLASS}>Contact Us</Link>.
                    </p>
                  </div>

                  <div className={`${CARD} p-4`}>
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className={`text-sm font-semibold ${TITLE}`}>Diagnostics</div>
                        <p className={`mt-1 text-sm ${BODY}`}>
                          Copy device + app info to paste into your message.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleCopyDiagnostics}
                        className="shrink-0 rounded-xl border border-zinc-200/70 bg-white/70 px-3 py-2 text-sm text-zinc-900 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-white/90 dark:hover:bg-white/10"
                      >
                        Copy
                      </button>
                    </div>
                    <div className={`mt-3 ${PANEL} p-3 text-xs ${BODY}`}>
                      <div className="grid grid-cols-1 gap-1">
                        <div>
                          <span className="text-zinc-500 dark:text-white/50">Mode:</span> {diagnostics.mode}
                        </div>
                        <div>
                          <span className="text-zinc-500 dark:text-white/50">Online:</span> {String(diagnostics.online)}
                        </div>
                        <div>
                          <span className="text-zinc-500 dark:text-white/50">Display:</span> {diagnostics.displayMode}
                        </div>
                        <div>
                          <span className="text-zinc-500 dark:text-white/50">SW controlled:</span> {String(diagnostics.serviceWorker.controlled)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section className={`${SURFACE} p-5`}>
                <h2 className={`text-base font-semibold ${TITLE}`}>Topics</h2>
                <p className={`mt-1 text-sm ${BODY}`}>
                  Jump to a section.
                </p>
                <nav className="mt-3 space-y-1">
                  {(q ? filteredTopics : TOPICS).map((t) => (
                    <a
                      key={t.id}
                      href={`#${t.id}`}
                      className="block rounded-xl border border-zinc-200/70 bg-white/60 px-3 py-2 text-sm text-zinc-800 hover:bg-white dark:border-white/10 dark:bg-white/0 dark:text-white/80 dark:hover:bg-white/5"
                    >
                      <div className={`font-semibold ${TITLE}`}>{t.title}</div>
                      <div className={`text-xs ${MUTED}`}>{t.blurb}</div>
                    </a>
                  ))}
                </nav>
              </section>
            </div>
          </aside>

          <div className="lg:col-span-8">
            <div className="space-y-6">
              {filteredTopics.length === 0 ? (
                <section className={`${SURFACE} p-6`}>
                  <h2 className={`text-lg font-semibold ${TITLE}`}>No matches</h2>
                  <p className={`mt-2 text-sm ${BODY}`}>
                    Try searching for "login", "offline", "install", "lag", or "blank screen".
                    You can also browse the sections on the left.
                  </p>
                </section>
              ) : null}

              {filteredTopics.map((topic) => (
                <section
                  key={topic.id}
                  id={topic.id}
                  className={`scroll-mt-24 ${SURFACE} p-6`}
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
                    <div>
                      <h2 className={`text-lg font-semibold ${TITLE}`}>{topic.title}</h2>
                      <p className={`mt-1 text-sm ${BODY}`}>{topic.blurb}</p>
                    </div>
                    <div className={`text-xs ${MUTED}`}>
                      {topic.items.length} {topic.items.length === 1 ? "item" : "items"}
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    {topic.items.map((it) => {
                      const open = q ? `${it.q} ${it.search || ""}`.toLowerCase().includes(q) : false;
                      return (
                        <details
                          key={it.q}
                          open={open}
                          className={`group rounded-2xl border border-zinc-200/70 bg-white/70 p-4 dark:border-white/10 dark:bg-white/5`}
                        >
                          <summary className={`cursor-pointer list-none select-none text-sm font-semibold ${TITLE} outline-none`}>
                            <div className="flex items-start justify-between gap-4">
                              <span>{it.q}</span>
                              <span className={`mt-0.5 text-xs ${MUTED} group-open:hidden`}>Show</span>
                              <span className={`mt-0.5 hidden text-xs ${MUTED} group-open:block`}>Hide</span>
                            </div>
                          </summary>
                          <div className={`mt-3 text-sm leading-relaxed ${BODY}`}>
                            {it.a}
                          </div>
                        </details>
                      );
                    })}
                  </div>
                </section>
              ))}

              <section className={`${SURFACE} p-6`}>
                <h2 className={`text-lg font-semibold ${TITLE}`}>Still stuck?</h2>
                <p className={`mt-2 text-sm ${BODY}`}>
                  Two best next steps: check <Link to="/faq" className={LINK_CLASS}>FAQs</Link> for gameplay questions, or message us via{" "}
                  <Link to="/contact" className={LINK_CLASS}>Contact Us</Link> with what you were doing, what you expected, and what happened.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    to="/faq"
                    className="rounded-xl border border-zinc-200/70 bg-white/70 px-4 py-2 text-sm text-zinc-900 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-white/90 dark:hover:bg-white/10"
                  >
                    Go to FAQs
                  </Link>
                  <Link
                    to="/contact"
                    className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-950 hover:bg-emerald-500/15 dark:border-emerald-400/25 dark:bg-emerald-400/10 dark:text-emerald-100 dark:hover:bg-emerald-400/15"
                  >
                    Contact support
                  </Link>
                  <Link
                    to="/settings"
                    className="rounded-xl border border-zinc-200/70 bg-white/70 px-4 py-2 text-sm text-zinc-900 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-white/90 dark:hover:bg-white/10"
                  >
                    Settings
                  </Link>
                </div>
              </section>

              <div className="pt-2 text-sm">
                <Link to="/" className={LINK_CLASS}>
                  ← Back to home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
