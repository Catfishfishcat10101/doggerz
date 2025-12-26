// src/pages/Faq.jsx
import React from "react";
import { Link } from "react-router-dom";
import PageShell from "@/components/PageShell.jsx";

const linkClass =
  "text-emerald-700 underline-offset-2 hover:text-emerald-600 hover:underline dark:text-emerald-300 dark:hover:text-emerald-200";

function nodeToText(node) {
  if (node == null || node === false) return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(nodeToText).join(" ");
  if (React.isValidElement(node)) return nodeToText(node.props?.children);
  return "";
}

function normalize(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

const FAQ_SECTIONS = [
  {
    id: "getting-started",
    title: "Getting started",
    items: [
      {
        q: "What is Doggerz?",
        a: (
          <>
            Doggerz is a real-time virtual pup sim. You adopt a mischievous
            little troublemaker, then you feed, train, and bond over time.
          </>
        ),
      },
      {
        q: "Do I need an account?",
        a: (
          <>
            You can explore without an account, but you’ll typically need to
            sign in to save progress across devices.
          </>
        ),
      },
      {
        q: "How do I adopt a dog?",
        a: (
          <>
            Head to <Link to="/adopt" className={linkClass}>Adopt</Link>,
            pick a name, and you’re in.
          </>
        ),
      },
      {
        q: "Is Doggerz a real pet?",
        a: (
          <>
            Sadly no—this is a virtual pup. Please continue feeding your real
            dog.
          </>
        ),
      },
    ],
  },
  {
    id: "accounts-and-saving",
    title: "Accounts & saving",
    items: [
      {
        q: "Where is my progress saved?",
        a: (
          <>
            Doggerz can run in “local-only” mode (saved in your browser) and in
            account mode (saved to your account when configured). If you clear
            site data, local-only saves can be wiped.
          </>
        ),
      },
      {
        q: "What’s the difference between local-only mode and account mode?",
        a: (
          <>
            Local-only mode keeps everything on this device. Account mode lets
            you sync your pup across devices (when sign-in/backing services are
            configured). If you’re not sure which you’re using, check whether
            sign-in is available on the <Link to="/login" className={linkClass}>Login</Link> page.
          </>
        ),
      },
      {
        q: "Why can’t I log in?",
        a: (
          <>
            First check your connection. If the app is running in offline/local
            mode, sign-in may be disabled until the backend is configured.
          </>
        ),
      },
      {
        q: "Can I have multiple dogs?",
        a: (
          <>
            Not yet. Right now it’s a one-dog show. Multi-dog “kennels” are on
            the roadmap.
          </>
        ),
      },
      {
        q: "I switched devices—why is my dog missing?",
        a: (
          <>
            If you were using local-only mode, your save lives on that device.
            Signing in is what enables cross-device sync.
          </>
        ),
      },
    ],
  },
  {
    id: "gameplay",
    title: "Gameplay",
    items: [
      {
        q: "Does time pass when I’m away?",
        a: (
          <>
            Yes. Doggerz is designed around real time. Your pup’s needs can
            drift while you’re gone—check in like you would with a real dog.
          </>
        ),
      },
      {
        q: "What are the life stages (Puppy, Adult, Senior)?",
        a: (
          <>
            Doggerz buckets your pup into life stages (Puppy → Adult → Senior)
            based on their age. You’ll see the vibe shift as they grow.
          </>
        ),
      },
      {
        q: "How fast does my dog age?",
        a: (
          <>
            Doggerz uses accelerated time. In the current build, multiple
            in‑game days can pass per real day—so checking in matters.
          </>
        ),
      },
      {
        q: "What happens if I ignore my dog for days?",
        a: (
          <>
            Neglect has consequences. Expect drops in happiness/energy and other
            issues. Your pup will forgive you… eventually.
          </>
        ),
      },
      {
        q: "What are cleanliness tiers?",
        a: (
          <>
            Cleanliness is grouped into tiers so it’s easy to understand at a
            glance. In Doggerz you’ll see tiers like <b>FRESH</b>, <b>DIRTY</b>,
            <b>FLEAS</b>, and <b>MANGE</b>. The lower the tier, the more your
            pup’s mood/energy can suffer.
          </>
        ),
      },
      {
        q: "How do I improve cleanliness (and avoid fleas/mange)?",
        a: (
          <>
            Keep up with baths/cleaning actions in-game. If you notice your pup
            sliding into DIRTY/FLEAS/MANGE, prioritize cleaning before long play
            sessions—dirty dogs get grumpy.
          </>
        ),
      },
      {
        q: "How does potty training work?",
        a: (
          <>
            Successful potty trips improve training over time. The more you do
            it, the fewer “oops” moments you’ll see.
          </>
        ),
      },
      {
        q: "What are training streaks?",
        a: (
          <>
            Doggerz tracks streak-like progress so consistency feels rewarding.
            Some streaks are based on daily activity/check-ins; others are tied
            to completing training goals over time.
          </>
        ),
      },
      {
        q: "How does aging work?",
        a: (
          <>
            Time is accelerated in-game. Your pup progresses through life
            stages, and some behaviors change as they grow.
          </>
        ),
      },
      {
        q: "Can I rename my dog later?",
        a: (
          <>
            Currently the name is set during adoption. A rename option is
            planned.
          </>
        ),
      },
    ],
  },
  {
    id: "tech",
    title: "Tech, performance & installs",
    items: [
      {
        q: "Can I install Doggerz like an app?",
        a: (
          <>
            Yes—Doggerz supports an installable experience in supported
            browsers. Look for the install prompt or “Install app” in your
            browser menu.
          </>
        ),
      },
      {
        q: "Why does the app look weird after an update?",
        a: (
          <>
            If you installed Doggerz, your browser may be serving cached files.
            A hard refresh or reinstall usually fixes it.
          </>
        ),
      },
      {
        q: "Does Doggerz work offline?",
        a: (
          <>
            Basic navigation can work offline when installed, but features that
            rely on network services (like account sync) require a connection.
          </>
        ),
      },
      {
        q: "What happens in offline/local-only mode?",
        a: (
          <>
            You can still play, but anything that depends on signing in or cloud
            storage won’t work until the backend is configured. Your save stays
            on this device.
          </>
        ),
      },
      {
        q: "Why does the background change from day to night?",
        a: (
          <>
            Doggerz uses a day/night background system. By default it follows
            your device clock. If weather settings are configured, it can also
            use sunrise/sunset timing for your ZIP.
          </>
        ),
      },
      {
        q: "Can I configure day/night using real sunrise and sunset?",
        a: (
          <>
            Yes (optional). If you provide <code>VITE_OPENWEATHER_API_KEY</code>
            and a default ZIP, Doggerz can fetch sunrise/sunset and blend into
            dawn/dusk vibes.
          </>
        ),
      },
      {
        q: "Is Doggerz mobile-friendly?",
        a: (
          <>
            Yes—Doggerz is designed to be usable on phones and desktop.
            If something feels cramped, tell us (with your device + browser).
          </>
        ),
      },
    ],
  },
  {
    id: "privacy",
    title: "Privacy & policy",
    items: [
      {
        q: "Where can I read the policy?",
        a: (
          <>
            Visit <Link to="/privacy" className={linkClass}>Policy</Link>.
          </>
        ),
      },
      {
        q: "Do you sell my data?",
        a: (
          <>
            The goal is to collect as little as possible and keep things simple.
            For the exact details, always refer to the Policy page.
          </>
        ),
      },
    ],
  },
  {
    id: "support",
    title: "Support",
    items: [
      {
        q: "Where can I get help?",
        a: (
          <>
            Start with <Link to="/help" className={linkClass}>Help</Link>,
            or reach out via <Link to="/contact" className={linkClass}>Contact Us</Link>.
          </>
        ),
      },
      {
        q: "How do I report a bug?",
        a: (
          <>
            Send what you expected vs what happened, plus your device, browser,
            and (if possible) a screenshot.
          </>
        ),
      },
      {
        q: "Can I suggest a feature?",
        a: (
          <>
            Please do. Doggerz is built to evolve—especially if the idea is
            funny and slightly chaotic.
          </>
        ),
      },
    ],
  },
];

function FaqItem({ q, a, defaultOpen = false }) {
  return (
    <details
      className="group rounded-xl border border-zinc-200 bg-white/80 p-4 shadow-sm shadow-black/5 dark:border-zinc-800 dark:bg-zinc-950/50 dark:shadow-none"
      defaultOpen={defaultOpen}
    >
      <summary className="cursor-pointer list-none text-sm font-semibold text-zinc-900 outline-none dark:text-zinc-100">
        <div className="flex items-start justify-between gap-3">
          <span>{q}</span>
          <span
            aria-hidden
            className="mt-0.5 text-zinc-500 transition group-open:rotate-45"
          >
            +
          </span>
        </div>
      </summary>
      <div className="mt-3 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">{a}</div>
    </details>
  );
}

export default function FaqPage() {
  const [query, setQuery] = React.useState("");
  const qn = normalize(query);

  const filteredSections = React.useMemo(() => {
    if (!qn) return FAQ_SECTIONS;

    return FAQ_SECTIONS.map((section) => {
      const sectionHaystack = normalize(section.title);
      const items = section.items.filter((item) => {
        const haystack = normalize(`${item.q} ${nodeToText(item.a)} ${sectionHaystack}`);
        return haystack.includes(qn);
      });

      return { ...section, items };
    }).filter((s) => s.items.length > 0);
  }, [qn]);

  const matchCount = React.useMemo(() => {
    if (!qn) return null;
    return filteredSections.reduce((acc, s) => acc + s.items.length, 0);
  }, [filteredSections, qn]);

  return (
    <PageShell>
      <div className="mx-auto w-full max-w-4xl space-y-8">
        <header id="top" className="space-y-3">
          <p className="text-[11px] uppercase tracking-[0.26em] text-emerald-700 dark:text-emerald-300/90">
            Help
          </p>
          <h1 className="text-4xl font-black tracking-tight">FAQs</h1>
          <p className="text-sm text-zinc-700 dark:text-zinc-300 max-w-2xl">
            Quick answers for curious humans. If you don’t see your question,
            hit up <Link to="/contact" className={linkClass}>Contact Us</Link>.
          </p>

          <div className="rounded-2xl border border-zinc-200 bg-white/80 p-4 dark:border-zinc-800 dark:bg-zinc-950/60">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 flex-1">
                <label htmlFor="faq-search" className="sr-only">
                  Search FAQs
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="faq-search"
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search FAQs (try: fleas, offline, sunrise, streak…)"
                    className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-500 outline-none focus:border-emerald-500/70 dark:border-zinc-800 dark:bg-black/40 dark:text-zinc-100"
                    aria-describedby={qn ? "faq-search-results" : undefined}
                  />
                  {qn && (
                    <button
                      type="button"
                      onClick={() => setQuery("")}
                      className="shrink-0 rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-700 hover:border-emerald-500/60 hover:text-emerald-700 dark:border-zinc-800 dark:bg-zinc-950/60 dark:text-zinc-200 dark:hover:text-emerald-200"
                      aria-label="Clear search"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {qn && (
                  <p id="faq-search-results" className="mt-2 text-xs text-zinc-500">
                    Showing <span className="font-semibold text-zinc-900 dark:text-zinc-200">{matchCount}</span> result
                    {matchCount === 1 ? "" : "s"} for “{query.trim()}”.
                  </p>
                )}
              </div>

              {qn && (
                <a
                  href="#top"
                  className="text-xs text-zinc-500 hover:text-emerald-700 dark:hover:text-emerald-200"
                >
                  Back to top
                </a>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {(qn ? filteredSections : FAQ_SECTIONS).map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="rounded-full border border-zinc-200 bg-white/70 px-3 py-1 text-xs text-zinc-700 hover:border-emerald-500/70 hover:text-emerald-700 dark:border-zinc-800 dark:bg-zinc-950/60 dark:text-zinc-300 dark:hover:text-emerald-200"
              >
                {s.title}
              </a>
            ))}
          </div>
        </header>

        <div className="space-y-10">
          {qn && matchCount === 0 ? (
            <div className="rounded-2xl border border-zinc-200 bg-white/80 p-5 dark:border-zinc-800 dark:bg-zinc-950/60">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">No matches</h2>
              <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">
                Try different keywords (for example: <b>cleanliness</b>, <b>offline</b>, <b>install</b>, <b>login</b>, <b>sunrise</b>),
                or reach out via <Link to="/contact" className={linkClass}>Contact Us</Link>.
              </p>
            </div>
          ) : (
            (qn ? filteredSections : FAQ_SECTIONS).map((section) => (
              <section key={section.id} id={section.id} className="scroll-mt-24">
                <div className="mb-4 flex items-end justify-between gap-3">
                  <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                    {section.title}
                  </h2>
                  <a
                    href="#top"
                    className="text-xs text-zinc-500 hover:text-emerald-700 dark:hover:text-emerald-200"
                  >
                    Back to top
                  </a>
                </div>

                <div className="grid gap-3">
                  {section.items.map((item) => (
                    <FaqItem
                      key={`${item.q}-${qn || "all"}`}
                      q={item.q}
                      a={item.a}
                      defaultOpen={Boolean(qn)}
                    />
                  ))}
                </div>
              </section>
            ))
          )}
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white/80 p-5 dark:border-zinc-800 dark:bg-zinc-950/60">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Still stuck?</h2>
          <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">
            No worries. We can help faster if you include your device + browser
            and what you were trying to do.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              to="/help"
              className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-black hover:bg-emerald-400"
            >
              Help
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center rounded-full border border-zinc-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-zinc-900 hover:border-emerald-400/80 hover:text-emerald-700 dark:border-zinc-700 dark:bg-black/40 dark:text-zinc-100 dark:hover:text-emerald-300"
            >
              Contact Us
            </Link>
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-full border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-zinc-700 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950/60 dark:text-zinc-300 dark:hover:text-zinc-100"
            >
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
