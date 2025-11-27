import {
  r as l,
  j as e,
  D as E,
  R as M,
  L as T,
  u as S,
  s as O,
  a as L,
  b as Y,
  P as _,
} from "./index-ClZwlZUg.js";
import { g as A, E as R, l as D, u as $ } from "./settings-BW652Eiz.js";
import { s as B } from "./dogSlice-VptOyUWJ.js";
async function F(i) {
  return null;
}
function W({ zip: i, useRealTime: a }) {
  const [u, m] = l.useState(A()),
    [c, s] = l.useState("clear");
  (l.useEffect(() => {
    const f = setInterval(() => m(A()), 3e4);
    return () => clearInterval(f);
  }, []),
    l.useEffect(() => {
      let p = !0;
      return (
        (async () => {
          if (a) {
            const d = await F();
            if (!p) return;
            if (d && d.weather && d.weather[0]) {
              const g = (d.weather[0].main || "").toLowerCase();
              g.includes("rain") ||
              g.includes("drizzle") ||
              g.includes("thunder")
                ? s("rain")
                : g.includes("snow")
                  ? s("snow")
                  : g.includes("cloud")
                    ? s("clouds")
                    : s("clear");
            } else s("clear");
          } else s("clear");
        })(),
        () => {
          p = !1;
        }
      );
    }, [i, a]));
  const r = {
    morning: "linear-gradient(180deg,#0f1724 0%,#0b1020 60%,#081025 100%)",
    afternoon: "linear-gradient(180deg,#071028 0%,#07122f 60%,#021025 100%)",
    dusk: "linear-gradient(180deg,#061026 0%,#071226 60%,#031126 100%)",
    evening: "linear-gradient(180deg,#04121a 0%,#041225 60%,#001119 100%)",
    night: "linear-gradient(180deg,#020614 0%,#00101a 60%,#000814 100%)",
    dawn: "linear-gradient(180deg,#08131a 0%,#071226 60%,#031126 100%)",
  };
  return e.jsxs("div", {
    "aria-hidden": !0,
    className: "pointer-events-none absolute inset-0 -z-10",
    style: {
      background: r[u] || r.afternoon,
      transition: "background 800ms ease",
    },
    children: [
      c === "rain" &&
        e.jsx("div", {
          className: "absolute inset-0 pointer-events-none",
          style: {
            opacity: 0.22,
            backgroundImage: "url('/sprites/rain.png')",
            backgroundSize: "cover",
          },
        }),
      c === "snow" &&
        e.jsx("div", {
          className: "absolute inset-0 pointer-events-none",
          style: {
            opacity: 0.18,
            backgroundImage: "url('/sprites/snow.png')",
            backgroundSize: "cover",
          },
        }),
      c === "clouds" &&
        e.jsx("div", {
          className: "absolute inset-0 pointer-events-none",
          style: {
            opacity: 0.28,
            backgroundImage: "url('/sprites/clouds.png')",
            backgroundSize: "cover",
          },
        }),
    ],
  });
}
function G({ open: i, onClose: a }) {
  const [u, m] = l.useState("Pup"),
    c = () => {
      try {
        const s = Date.now(),
          r = {
            id: `local-${s}`,
            name: u || "Pup",
            adoptedAt: s,
            level: 1,
            xp: 0,
            stats: {
              hunger: 100,
              happiness: 100,
              energy: 100,
              cleanliness: 100,
              pottyProgress: 0,
            },
            lifeStage: "PUPPY",
          };
        (window.localStorage.setItem(E, JSON.stringify(r)),
          window.location.reload());
      } catch (s) {
        (console.error("Adopt failed", s),
          alert("Adoption failed. Check console."));
      }
    };
  return i
    ? e.jsxs("div", {
        className: "fixed inset-0 z-60 flex items-center justify-center",
        role: "dialog",
        "aria-modal": "true",
        "aria-labelledby": "adopt-modal-title",
        children: [
          e.jsx("div", {
            className: "absolute inset-0 bg-black/60",
            onClick: a,
          }),
          e.jsxs("div", {
            className:
              "relative z-10 mx-4 w-full max-w-2xl rounded-2xl bg-zinc-900/95 border border-zinc-800 p-6 shadow-2xl",
            children: [
              e.jsxs("header", {
                className: "flex items-start justify-between gap-4",
                children: [
                  e.jsxs("div", {
                    children: [
                      e.jsx("h3", {
                        id: "adopt-modal-title",
                        className: "text-2xl font-bold text-emerald-300",
                        children: "Adopt a pup",
                      }),
                      e.jsx("p", {
                        className: "mt-1 text-sm text-zinc-300",
                        children:
                          "Create a local pup save on this device. You can enable cloud sync later in Settings.",
                      }),
                    ],
                  }),
                  e.jsx("button", {
                    onClick: a,
                    "aria-label": "Close adopt dialog",
                    className:
                      "rounded-md bg-zinc-800/60 px-3 py-1 text-sm text-zinc-200 hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-400",
                    children: "Close",
                  }),
                ],
              }),
              e.jsxs("div", {
                className: "mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3",
                children: [
                  e.jsx("div", {
                    className: "flex items-center justify-center sm:col-span-1",
                    children: e.jsx("div", {
                      className:
                        "rounded-2xl bg-gradient-to-br from-emerald-500/10 via-emerald-500/6 to-zinc-900 p-4 shadow-inner",
                      children: e.jsx("div", {
                        className:
                          "w-40 h-40 flex items-center justify-center rounded-lg bg-zinc-800",
                        children: e.jsx(R, {}),
                      }),
                    }),
                  }),
                  e.jsxs("div", {
                    className: "sm:col-span-2",
                    children: [
                      e.jsxs("div", {
                        children: [
                          e.jsx("label", {
                            className: "block text-xs text-zinc-300",
                            children: "Name",
                          }),
                          e.jsx("input", {
                            value: u,
                            onChange: (s) => m(s.target.value),
                            className:
                              "mt-2 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400",
                          }),
                        ],
                      }),
                      e.jsx("div", {
                        className: "mt-4 text-sm text-zinc-300",
                        children: e.jsx("p", {
                          children:
                            "Your pup will be saved locally unless you enable cloud sync. Adoption is instant — you can always adopt another pup later.",
                        }),
                      }),
                      e.jsxs("div", {
                        className: "mt-6 flex items-center justify-end gap-3",
                        children: [
                          e.jsx("button", {
                            onClick: a,
                            className:
                              "rounded-md px-3 py-2 text-sm bg-zinc-800 text-zinc-200 hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-emerald-400",
                            children: "Cancel",
                          }),
                          e.jsx("button", {
                            onClick: c,
                            className:
                              "rounded-md bg-gradient-to-r from-emerald-500 to-emerald-400 px-4 py-2 text-sm font-semibold text-black shadow hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-emerald-300",
                            children: "Adopt",
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
      })
    : null;
}
function H({
  primaryHref: i = "/adopt",
  primaryLabel: a = "Adopt a pup",
  onLearnMore: u = null,
}) {
  const [m, c] = l.useState(!1),
    [s, r] = l.useState(!1);
  return e.jsxs("div", {
    className: "relative",
    onMouseEnter: () => c(!0),
    onMouseLeave: () => c(!1),
    children: [
      e.jsx("button", {
        onClick: () => r(!0),
        className:
          "inline-flex items-center justify-center rounded-md border border-emerald-400 bg-emerald-400 px-3 py-2 text-sm font-medium uppercase tracking-wide text-slate-950 transition-transform hover:-translate-y-0.5",
        children: m ? "Start Caring" : a,
      }),
      e.jsxs("div", {
        className: `absolute top-full mt-2 left-0 w-64 rounded-lg bg-zinc-900/90 border border-zinc-800 p-3 text-sm transition transform ${m ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"}`,
        "aria-hidden": !m,
        style: { transformOrigin: "top left" },
        children: [
          e.jsx("div", {
            className: "font-semibold text-white",
            children: "Ready to adopt?",
          }),
          e.jsx("div", {
            className: "text-zinc-400 text-xs mt-1",
            children:
              "One pup per device for now. You keep their story locally.",
          }),
          e.jsxs("div", {
            className: "mt-3 flex items-center gap-2",
            children: [
              e.jsx("button", {
                onClick: () => r(!0),
                className:
                  "px-3 py-1 rounded bg-emerald-500 text-black font-semibold text-sm",
                children: "Adopt now",
              }),
              u
                ? e.jsx("button", {
                    onClick: () => u(),
                    className:
                      "px-3 py-1 rounded border border-zinc-700 text-zinc-200 text-sm",
                    children: "Learn more",
                  })
                : e.jsx("a", {
                    href: i,
                    className:
                      "px-3 py-1 rounded border border-zinc-700 text-zinc-200 text-sm",
                    children: "Learn more",
                  }),
            ],
          }),
        ],
      }),
      e.jsx(G, { open: s, onClose: () => r(!1) }),
    ],
  });
}
const J = [
  "3,421 pups adopted",
  "Today's top trainer: @ginger",
  "Potty training streak: 12 days",
  "New trick unlocked: Sit",
];
function K({ messages: i = J }) {
  const [a, u] = l.useState(0);
  l.useEffect(() => {
    const c = setInterval(() => u((s) => (s + 1) % i.length), 3500);
    return () => clearInterval(c);
  }, [i.length]);
  const m = (c) =>
    c
      .split(/(@[^\s]+)/g)
      .map((r, p) =>
        r.startsWith("@")
          ? e.jsx(
              "span",
              { className: "font-medium text-emerald-300", children: r },
              p,
            )
          : e.jsx("span", { children: r }, p),
      );
  return e.jsx("div", {
    className: "w-full overflow-hidden",
    children: e.jsx("div", {
      className: "text-sm text-zinc-300 text-center py-2 leading-5",
      children: m(i[a]),
    }),
  });
}
const C = [0, 1, 2, 3],
  U = 4,
  P = [5, 6, 7],
  I = [8, 9, 10],
  q = 11,
  Z = 13,
  V = 14;
function Q({ onFinish: i }) {
  const a = "doggerz:seenIntro",
    [u, m] = l.useState(() => {
      try {
        const t = D();
        return t.reducedMotion
          ? !1
          : t.replayCinematic
            ? !0
            : !(
                window &&
                window.localStorage &&
                window.localStorage.getItem(a)
              );
      } catch {
        return !0;
      }
    }),
    { spriteSrc: c, frameSize: s, cols: r, rows: p } = $(),
    [f, d] = l.useState("0px 0px"),
    [g, j] = l.useState(0),
    [v, y] = l.useState(!1),
    w = M.useMemo(
      () =>
        Array.from({ length: 8 }).map((t, n) => {
          const b = 10 + ((n * 9) % 80),
            N = 20 + ((n * 13) % 50),
            k = (n % 4) * 120,
            h = 4 + (n % 3) * 2;
          return { left: b, top: N, delay: k, size: h };
        }),
      [],
    );
  return (
    l.useEffect(() => {
      if (!u || !c) return;
      const t = (h) => {
        const o = h % r,
          x = Math.floor(h / r);
        return `${-o * s}px ${-x * s}px`;
      };
      let n = !0;
      const b = 100,
        N = 200;
      return (
        (async () => {
          for (let o = 0; o < 2 && n; o++) {
            for (let x = 0; x < C.length && n; x++)
              (d(t(C[x])), await new Promise((z) => setTimeout(z, b)));
            await new Promise((x) => setTimeout(x, 120));
          }
          if (!n || (d(t(U)), await new Promise((o) => setTimeout(o, 550)), !n))
            return;
          const h = 10;
          for (let o = 0; o < h && n; o++) {
            const x = P[o % P.length];
            (d(t(x)),
              await new Promise((z) => setTimeout(z, Math.max(140, N - 40))));
          }
          if (n) {
            for (let o = 0; o < I.length && n; o++)
              (d(t(I[o])), await new Promise((x) => setTimeout(x, 120)));
            if (
              n &&
              (d(t(q)),
              await new Promise((o) => setTimeout(o, 600)),
              !!n &&
                (d(t(Z)),
                await new Promise((o) => setTimeout(o, 500)),
                d(t(V)),
                await new Promise((o) => setTimeout(o, 400)),
                !!n))
            )
              if (v) y(!1);
              else {
                try {
                  window.localStorage.setItem(a, "1");
                } catch {}
                (m(!1), typeof i == "function" && i());
              }
          }
        })(),
        () => {
          n = !1;
        }
      );
    }, [u, c, s, r, g]),
    l.useEffect(() => {}, [g]),
    u
      ? e.jsxs("div", {
          className:
            "fixed inset-0 z-50 flex items-center justify-center pointer-events-auto",
          children: [
            e.jsx("div", { className: "absolute inset-0 bg-black/70" }),
            e.jsxs("div", {
              className: "relative w-full max-w-2xl mx-auto px-4",
              children: [
                e.jsx("style", {
                  children: `
          @keyframes particle-drift { 0% { transform: translateY(0) scale(1); opacity: 1 } 100% { transform: translateY(-18px) scale(0.9); opacity: 0 } }
          @keyframes vignette-pulse { 0%{ opacity: .9 } 50%{ opacity: .95 } 100%{ opacity: .9 } }
        `,
                }),
                e.jsxs("div", {
                  className:
                    "relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900 to-slate-800 p-6 shadow-card",
                  children: [
                    e.jsx("div", {
                      className: "absolute inset-0 pointer-events-none",
                      style: {
                        background:
                          "radial-gradient(ellipse at center, rgba(255,255,255,0.02), rgba(0,0,0,0.6))",
                        mixBlendMode: "overlay",
                      },
                    }),
                    e.jsx("div", {
                      className: "absolute inset-0 pointer-events-none",
                      children: w.map((t, n) =>
                        e.jsx(
                          "div",
                          {
                            style: {
                              position: "absolute",
                              left: `${t.left}%`,
                              top: `${t.top}%`,
                              width: t.size,
                              height: t.size,
                              background: "rgba(255,255,255,0.06)",
                              borderRadius: 9999,
                              animation: `particle-drift 1800ms ease ${t.delay}ms forwards`,
                            },
                          },
                          n,
                        ),
                      ),
                    }),
                    e.jsx("div", {
                      className:
                        "absolute inset-0 flex items-center justify-center",
                      children: e.jsx("div", {
                        className: "intro-run-container",
                        style: { transformOrigin: "left center" },
                        children: e.jsx("div", {
                          className: "transform-gpu",
                          children: e.jsx("div", {
                            className:
                              "w-48 h-48 mx-auto rounded-lg bg-black/0 shadow-2xl",
                            style: {
                              imageRendering: "pixelated",
                              backgroundImage: `url(${c})`,
                              backgroundSize: `${s * r}px ${s * p}px`,
                              backgroundPosition: f,
                              boxShadow: "0 24px 48px rgba(0,0,0,0.6)",
                              borderRadius: 12,
                            },
                          }),
                        }),
                      }),
                    }),
                    e.jsxs("div", {
                      className: "relative z-10 text-center mt-4",
                      children: [
                        e.jsx("h3", {
                          className: "text-2xl font-bold text-white",
                          children: "Welcome to Doggerz",
                        }),
                        e.jsx("p", {
                          className: "text-sm text-zinc-300 mt-2",
                          children:
                            "Meet your Jack Russell. Adopt, train, and bond.",
                        }),
                      ],
                    }),
                    e.jsxs("div", {
                      className:
                        "absolute right-4 bottom-4 z-20 flex items-center gap-3",
                      children: [
                        e.jsx("button", {
                          onClick: () => {
                            (y(!0), j((t) => t + 1));
                          },
                          className:
                            "rounded-md bg-zinc-800/70 px-3 py-1 text-sm text-zinc-200 hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-emerald-400",
                          children: "Replay",
                        }),
                        e.jsx("button", {
                          onClick: () => {
                            try {
                              window.localStorage.setItem(a, "1");
                            } catch {}
                            (m(!1), typeof i == "function" && i());
                          },
                          className:
                            "rounded-md bg-zinc-700/80 px-3 py-1 text-sm text-zinc-200 hover:bg-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-400",
                          children: "Skip",
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
          ],
        })
      : null
  );
}
function X({ open: i = !1, onClose: a = () => {} }) {
  return i
    ? e.jsxs("div", {
        className: "fixed inset-0 z-50 flex items-center justify-center",
        children: [
          e.jsx("div", {
            className: "absolute inset-0 bg-black/70",
            onClick: a,
          }),
          e.jsxs("div", {
            className:
              "relative mx-4 max-w-3xl rounded-2xl bg-zinc-900/95 p-6 shadow-2xl border border-zinc-800",
            children: [
              e.jsxs("header", {
                className: "flex items-start justify-between gap-4",
                children: [
                  e.jsxs("div", {
                    children: [
                      e.jsx("h3", {
                        className: "text-xl font-bold text-emerald-300",
                        children: "How Doggerz works",
                      }),
                      e.jsx("p", {
                        className: "mt-1 text-sm text-zinc-300",
                        children:
                          "A short overview — hit “Learn more” for the full guide.",
                      }),
                    ],
                  }),
                  e.jsx("button", {
                    "aria-label": "Close",
                    onClick: a,
                    className:
                      "ml-auto rounded-md bg-zinc-800/60 px-3 py-1 text-sm text-zinc-200 hover:bg-zinc-800",
                    children: "Close",
                  }),
                ],
              }),
              e.jsxs("div", {
                className: "mt-4 grid gap-4 sm:grid-cols-2",
                children: [
                  e.jsxs("div", {
                    className:
                      "rounded-xl border border-zinc-800 bg-zinc-950/60 p-3",
                    children: [
                      e.jsx("h4", {
                        className: "font-semibold text-zinc-100",
                        children: "Core loop",
                      }),
                      e.jsx("p", {
                        className: "mt-1 text-xs text-zinc-300",
                        children:
                          "Feed, play, train, and rest — short daily check-ins keep your pup happy.",
                      }),
                    ],
                  }),
                  e.jsxs("div", {
                    className:
                      "rounded-xl border border-zinc-800 bg-zinc-950/60 p-3",
                    children: [
                      e.jsx("h4", {
                        className: "font-semibold text-zinc-100",
                        children: "Aging & life",
                      }),
                      e.jsx("p", {
                        className: "mt-1 text-xs text-zinc-300",
                        children:
                          "Your pup advances through Puppy → Adult → Senior. Care affects growth and longevity.",
                      }),
                    ],
                  }),
                  e.jsxs("div", {
                    className:
                      "rounded-xl border border-zinc-800 bg-zinc-950/60 p-3",
                    children: [
                      e.jsx("h4", {
                        className: "font-semibold text-zinc-100",
                        children: "Potty training",
                      }),
                      e.jsx("p", {
                        className: "mt-1 text-xs text-zinc-300",
                        children:
                          "Outdoor successes build training; consistency reduces accidents.",
                      }),
                    ],
                  }),
                  e.jsxs("div", {
                    className:
                      "rounded-xl border border-zinc-800 bg-zinc-950/60 p-3",
                    children: [
                      e.jsx("h4", {
                        className: "font-semibold text-zinc-100",
                        children: "Privacy",
                      }),
                      e.jsx("p", {
                        className: "mt-1 text-xs text-zinc-300",
                        children:
                          "Your pup is stored locally by default. Cloud sync is optional and gated in Settings.",
                      }),
                    ],
                  }),
                ],
              }),
              e.jsxs("footer", {
                className: "mt-6 flex items-center justify-end gap-3",
                children: [
                  e.jsx(T, {
                    to: "/about#how-it-works",
                    onClick: a,
                    className:
                      "rounded-md px-4 py-2 text-sm font-semibold text-emerald-300 ring-1 ring-emerald-400/20 hover:bg-emerald-500/5",
                    children: "Learn more",
                  }),
                  e.jsx("button", {
                    onClick: a,
                    className:
                      "rounded-md bg-zinc-800/60 px-4 py-2 text-sm text-zinc-200",
                    children: "Close",
                  }),
                ],
              }),
            ],
          }),
        ],
      })
    : null;
}
function ne() {
  S(O);
  const i = S(B),
    a = !!(i && i.adoptedAt),
    u = "/adopt",
    m = "Adopt a pup",
    c = "Learn More?",
    [s, r] = l.useState(!1),
    [p, f] = l.useState(!0),
    [d, g] = l.useState("Pup"),
    [j, v] = l.useState(!0),
    y = L(),
    w = Y();
  return e.jsxs(e.Fragment, {
    children: [
      e.jsxs(_, {
        className: "px-4 pb-16 pt-10",
        children: [
          e.jsx(Q, {}),
          e.jsx(W, {
            zip:
              typeof window < "u"
                ? (() => {
                    try {
                      const t = window.localStorage.getItem("doggerz:settings");
                      if (t) return JSON.parse(t).zip;
                    } catch {}
                  })()
                : void 0,
            useRealTime:
              typeof window < "u"
                ? (() => {
                    try {
                      const t = window.localStorage.getItem("doggerz:settings");
                      if (t) return JSON.parse(t).useRealTime;
                    } catch {}
                    return !1;
                  })()
                : !1,
          }),
          e.jsx(K, {}),
          e.jsxs("div", {
            className:
              "mx-auto flex flex-col gap-10 md:flex-row md:items-center md:justify-between lg:gap-24",
            "aria-label": "Landing hero layout",
            children: [
              e.jsxs("section", {
                className: "flex-1 space-y-6",
                "aria-label": "Marketing intro",
                children: [
                  e.jsxs("div", {
                    children: [
                      e.jsx("div", {
                        className: "inline-flex flex-col",
                        "aria-label": "Doggerz brand",
                        children: e.jsx("span", {
                          className:
                            "text-6xl font-extrabold tracking-tight text-emerald-400 drop-shadow-[0_8px_24px_rgba(0,0,0,0.6)]",
                          children: "DOGGERZ",
                        }),
                      }),
                      e.jsx("h2", {
                        className:
                          "mt-3 max-w-md text-sm font-medium leading-snug text-slate-300 md:text-base",
                        children: a
                          ? "Your pup’s still ticking. Jump back in and keep them thriving."
                          : "Adopt your pup & keep them thriving in real time.",
                      }),
                    ],
                  }),
                  e.jsxs("div", {
                    className: "mt-6 flex items-center gap-3",
                    "aria-label": "Primary calls to action",
                    children: [
                      e.jsx(H, {
                        primaryHref: u,
                        primaryLabel: m,
                        onLearnMore: () => r(!0),
                      }),
                      e.jsx("button", {
                        onClick: () => r(!0),
                        className:
                          "inline-flex items-center justify-center rounded-md border border-zinc-700 bg-zinc-900/60 px-3 py-2 text-sm font-medium uppercase tracking-wide text-zinc-200 transition hover:-translate-y-0.5",
                        children: c,
                      }),
                    ],
                  }),
                ],
              }),
              e.jsxs("section", {
                className: "flex-1",
                "aria-label": "Sprite showcase",
                children: [
                  e.jsx("style", {
                    children: `
            @keyframes pup-jump { 0% { transform: translateY(0) } 30% { transform: translateY(-40px) } 70% { transform: translateY(6px) } 100% { transform: translateY(0) } }
            .pup-jump { animation: pup-jump 700ms ease; }
            .name-board { min-width: 160px; max-width: 260px; }
          `,
                  }),
                  e.jsxs("div", {
                    className:
                      "relative mx-auto flex max-w-lg items-center justify-center rounded-3xl border border-zinc-800 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 px-8 py-10 shadow-[0_18px_60px_rgba(0,0,0,0.7)]",
                    children: [
                      e.jsx("div", {
                        className:
                          "pointer-events-none absolute -top-10 flex items-center justify-center w-full",
                        children: e.jsx("div", {
                          className:
                            "name-board rounded-md bg-zinc-900/80 border border-zinc-800 px-3 py-2 text-sm text-emerald-200 text-center shadow",
                          children: d,
                        }),
                      }),
                      e.jsx("div", {
                        className: `relative flex items-center justify-center ${j ? "pup-jump" : ""}`,
                        children: e.jsx(R, {}),
                      }),
                      e.jsx("div", {
                        className:
                          "absolute bottom-4 left-1/2 -translate-x-1/2 w-full flex items-center justify-center",
                        children: p
                          ? e.jsx("input", {
                              value: d,
                              onChange: (t) => g(t.target.value),
                              onKeyDown: async (t) => {
                                if (t.key === "Enter")
                                  try {
                                    v(!0);
                                    try {
                                      w?.add(`${d || "Pup"}: BARK!`);
                                    } catch {}
                                    const n = Date.now(),
                                      b = {
                                        id: `local-${n}`,
                                        name: d || "Pup",
                                        adoptedAt: n,
                                        level: 1,
                                        xp: 0,
                                        stats: {
                                          hunger: 100,
                                          happiness: 100,
                                          energy: 100,
                                          cleanliness: 100,
                                          pottyProgress: 0,
                                        },
                                        lifeStage: "PUPPY",
                                      };
                                    (window.localStorage.setItem(
                                      E,
                                      JSON.stringify(b),
                                    ),
                                      setTimeout(() => {
                                        y("/game");
                                      }, 800));
                                  } catch (n) {
                                    console.error("Adopt flow failed", n);
                                  }
                              },
                              className:
                                "w-64 rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400",
                              placeholder: "Name your pup",
                            })
                          : e.jsx("button", {
                              onClick: () => f(!0),
                              className:
                                "rounded-md border border-zinc-800 px-3 py-2 text-sm text-zinc-200",
                              children: "Name your pup",
                            }),
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
      e.jsx(X, { open: s, onClose: () => r(!1) }),
    ],
  });
}
export { ne as default };
