import { j as e, P as a } from "./index-ClZwlZUg.js";
const t = [
  {
    q: "Is Doggerz always running?",
    a: "Stats decay over real time, but the game is tuned for short check-ins — a few minutes a day keeps most pups happy.",
  },
  {
    q: "What happens if I ignore my pup?",
    a: "Long neglect increases hunger, filth, and low energy. The app warns you and gives chances to recover, but repeated neglect shortens life expectancy.",
  },
  {
    q: "Can I adopt again later?",
    a: "Yes. You can adopt a new pup at any time; each pup has its own story saved locally (or to the cloud if you enable sync).",
  },
  {
    q: "Is my pup stored in the cloud by default?",
    a: "No — by default your pup is stored locally. Cloud sync is optional and controlled in Settings under 'Allow Cloud Sync'.",
  },
  {
    q: "Are there in-app purchases?",
    a: "Doggerz is primarily free with optional purchases for cosmetics and convenience. Core gameplay and one pup remain usable offline.",
  },
  {
    q: "How long does a pup live in-game?",
    a: "Time is accelerated in Doggerz; life length depends on care. Good habits and training extend your pup's story.",
  },
];
function i() {
  return e.jsxs(a, {
    title: "How Doggerz works",
    subtitle:
      "Real-time virtual pup: stats decay, life stages, training, cleanliness tiers & temperament systems all ticking while you’re away.",
    metaDescription:
      "Doggerz gameplay overview: real-time stat decay, life stages, potty training, cleanliness tiers and long-term aging mechanics.",
    padding: "px-6 py-10",
    children: [
      e.jsx("a", { id: "how-it-works" }),
      e.jsxs("div", {
        className:
          "grid gap-10 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:items-start",
        children: [
          e.jsxs("div", {
            className: "space-y-8 text-base leading-relaxed text-zinc-200",
            children: [
              e.jsxs("section", {
                "aria-label": "Doggerz overview",
                className:
                  "space-y-3 rounded-2xl border border-emerald-500/20 bg-zinc-900/70 px-4 py-4 shadow-md shadow-black/40",
                children: [
                  e.jsx("p", {
                    className:
                      "text-xs font-semibold uppercase tracking-[0.25em] text-emerald-300",
                    children: "REAL-TIME VIRTUAL PUP",
                  }),
                  e.jsx("p", {
                    children:
                      "Doggerz is a one-pup virtual pet that keeps ticking even when you are not looking at the screen. Hunger, happiness, energy, and cleanliness drift over time; life stages advance; potty training remembers every outdoor success or missed routine.",
                  }),
                  e.jsx("p", {
                    className: "text-sm text-zinc-400",
                    children:
                      "The goal is not to grind. It is to drop in for short, meaningful check-ins that keep your pup's story going.",
                  }),
                ],
              }),
              e.jsxs("section", {
                className:
                  "space-y-3 rounded-2xl border border-zinc-800 bg-zinc-950/70 px-4 py-4",
                "aria-labelledby": "core-loop-heading",
                children: [
                  e.jsx("h2", {
                    id: "core-loop-heading",
                    className: "text-lg font-semibold text-zinc-50",
                    children: "Core loop",
                  }),
                  e.jsxs("ul", {
                    className:
                      "list-disc list-inside space-y-1.5 text-[0.95rem]",
                    children: [
                      e.jsx("li", {
                        children: "Play to keep happiness up (watch energy).",
                      }),
                      e.jsx("li", {
                        children: "Bathe regularly to avoid fleas & mange.",
                      }),
                      e.jsx("li", {
                        children:
                          "Pups auto-sleep when exhausted; let them recharge.",
                      }),
                      e.jsx("li", {
                        children:
                          "Take potty trips outside to train & reduce accidents.",
                      }),
                    ],
                  }),
                ],
              }),
              e.jsxs("section", {
                className:
                  "space-y-3 rounded-2xl border border-zinc-800 bg-zinc-950/70 px-4 py-4",
                "aria-labelledby": "aging-heading",
                children: [
                  e.jsx("h2", {
                    id: "aging-heading",
                    className: "text-lg font-semibold text-zinc-50",
                    children: "Aging & life",
                  }),
                  e.jsx("p", {
                    className: "text-[0.95rem]",
                    children:
                      "Time is accelerated: your dog ages faster than real time. Good care extends their story; neglect (hunger, filth, low energy) shortens lifespan. Senior years need extra attention and slower days, but also unlock calmer, more predictable routines.",
                  }),
                ],
              }),
              e.jsxs("section", {
                className:
                  "space-y-3 rounded-2xl border border-zinc-800 bg-zinc-950/70 px-4 py-4",
                "aria-labelledby": "potty-training-heading",
                children: [
                  e.jsx("h2", {
                    id: "potty-training-heading",
                    className: "text-lg font-semibold text-zinc-50",
                    children: "Potty training",
                  }),
                  e.jsx("p", {
                    className: "text-[0.95rem]",
                    children:
                      "Successful outdoor potty trips raise the training meter. At 100% they earn a trained badge and accidents become rare. Miss routines and progress slows, so consistency is rewarded. Streaks over multiple days unlock better odds of staying clean inside.",
                  }),
                ],
              }),
              e.jsxs("section", {
                className:
                  "space-y-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-4",
                "aria-label": "Life stages and temperament systems",
                children: [
                  e.jsx("h2", {
                    className: "text-lg font-semibold text-emerald-300",
                    children: "Life stages & temperament",
                  }),
                  e.jsx("p", {
                    className: "text-[0.95rem]",
                    children:
                      "Your pup moves through life stages—Puppy → Adult → Senior. Each stage tweaks how fast needs decay, how quickly they recover, and what training unlocks. Under the hood, temperament systems track how you care for them over time, nudging behavior toward playful, calm, or stubborn.",
                  }),
                  e.jsxs("dl", {
                    className:
                      "mt-2 grid gap-3 text-xs text-zinc-200 sm:grid-cols-3",
                    children: [
                      e.jsxs("div", {
                        className: "rounded-xl bg-zinc-900/80 px-3 py-2",
                        children: [
                          e.jsx("dt", {
                            className: "font-semibold text-emerald-300",
                            children: "Puppy",
                          }),
                          e.jsx("dd", {
                            children:
                              "Fast needs, fast growth. Big gains from consistent care.",
                          }),
                        ],
                      }),
                      e.jsxs("div", {
                        className: "rounded-xl bg-zinc-900/80 px-3 py-2",
                        children: [
                          e.jsx("dt", {
                            className: "font-semibold text-emerald-300",
                            children: "Adult",
                          }),
                          e.jsx("dd", {
                            children:
                              "Balanced decay and recovery. Training matters most here.",
                          }),
                        ],
                      }),
                      e.jsxs("div", {
                        className: "rounded-xl bg-zinc-900/80 px-3 py-2",
                        children: [
                          e.jsx("dt", {
                            className: "font-semibold text-emerald-300",
                            children: "Senior",
                          }),
                          e.jsx("dd", {
                            children:
                              "Slower days, gentler play. Needs more rest and steady routines.",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              e.jsxs("section", {
                className: "space-y-3 border-t border-zinc-800 pt-6",
                "aria-label": "Doggerz FAQ",
                children: [
                  e.jsx("h2", {
                    className: "text-lg font-semibold text-zinc-50",
                    children: "Quick questions",
                  }),
                  e.jsx("div", {
                    className: "grid gap-4 md:grid-cols-3",
                    children: t.map((s) =>
                      e.jsxs(
                        "article",
                        {
                          className: "space-y-1 text-[0.9rem]",
                          children: [
                            e.jsx("h3", {
                              className: "font-semibold text-zinc-100",
                              children: s.q,
                            }),
                            e.jsx("p", {
                              className: "text-zinc-300",
                              children: s.a,
                            }),
                          ],
                        },
                        s.q,
                      ),
                    ),
                  }),
                ],
              }),
            ],
          }),
          e.jsxs("aside", {
            "aria-label": "Virtual pup preview",
            className: "relative mt-2 lg:mt-0",
            children: [
              e.jsx("div", {
                className:
                  "pointer-events-none absolute -inset-5 -z-10 bg-emerald-500/10 blur-3xl",
              }),
              e.jsxs("div", {
                className:
                  "flex h-full flex-col justify-between rounded-3xl border border-emerald-500/40 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 p-5 shadow-2xl shadow-emerald-500/30",
                children: [
                  e.jsxs("header", {
                    className: "mb-4 flex items-center justify-between gap-3",
                    children: [
                      e.jsx("p", {
                        className:
                          "text-xs font-semibold uppercase tracking-[0.22em] text-emerald-300",
                        children: "YOUR VIRTUAL PUP",
                      }),
                      e.jsx("span", {
                        className:
                          "rounded-full bg-zinc-900 px-3 py-1 text-[11px] font-medium text-zinc-300",
                        children: "One pup per device",
                      }),
                    ],
                  }),
                  e.jsxs("div", {
                    className: "flex items-center gap-4",
                    children: [
                      e.jsx("div", {
                        className:
                          "flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 via-emerald-500 to-sky-500 text-5xl shadow-md",
                        children: e.jsx("span", {
                          "aria-hidden": "true",
                          children: "🐶",
                        }),
                      }),
                      e.jsxs("div", {
                        className: "space-y-1 text-sm text-zinc-200",
                        children: [
                          e.jsx("p", {
                            children:
                              "This is a stand-in for your Doggerz pup. In the main game, their sprite, mood, and needs update in real time as you care for them.",
                          }),
                          e.jsx("p", {
                            className: "text-xs text-zinc-400",
                            children:
                              "You can swap this card for real art later (e.g. a PNG or sprite pose) without changing the layout.",
                          }),
                        ],
                      }),
                    ],
                  }),
                  e.jsxs("footer", {
                    className: "mt-5 space-y-1 text-xs text-zinc-300",
                    children: [
                      e.jsxs("p", {
                        className: "flex items-center justify-between",
                        children: [
                          e.jsx("span", {
                            className: "text-zinc-400",
                            children: "Designed for",
                          }),
                          e.jsx("span", {
                            className:
                              "rounded-full bg-zinc-900 px-2 py-1 text-[11px] font-semibold text-emerald-300",
                            children: "Short check-ins",
                          }),
                        ],
                      }),
                      e.jsx("p", {
                        className: "text-zinc-400",
                        children:
                          "Doggerz is tuned so a few minutes each day keeps your pup happy, trained, and clean—without feeling like a second job.",
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });
}
export { i as default };
