import {
  u as d,
  d as P,
  g as De,
  r as a,
  G as we,
  s as re,
  j as e,
  h as b,
  c as oe,
  i as Se,
  k as ke,
  l as Ce,
  m as Te,
  C as te,
  t as Ee,
  n as Pe,
  o as Ie,
  p as Ae,
  q as Re,
  v as Le,
  w as Me,
  e as Fe,
  f as Oe,
  D as se,
  x as _e,
  y as D,
  z as x,
  A as ne,
  B as H,
  E as Ue,
  P as Ye,
} from "./index-ClZwlZUg.js";
import { g as E, E as Be, l as Ge } from "./settings-BW652Eiz.js";
function $e() {
  const t = d(P),
    r = d(De),
    i = a.useMemo(() => {
      if (r && r.revealReady) return !0;
      if (!t || !t.adoptedAt) return !1;
      try {
        return ((Date.now() - t.adoptedAt) / 864e5) * (we || 4) >= 3;
      } catch {
        return !1;
      }
    }, [t, r]);
  return a.useMemo(() => ({ temperamentRevealReady: i }), [i]);
}
function He(t) {
  const {
    hunger: r = 50,
    happiness: i = 50,
    energy: s = 50,
    cleanliness: n = 50,
  } = t;
  return s <= 10
    ? "Exhausted"
    : r >= 80
      ? "Hungry"
      : n <= 25
        ? "Filthy"
        : i <= 25
          ? "Sad"
          : i >= 85
            ? "Ecstatic"
            : "Content";
}
function Ke(t) {
  switch (t) {
    case "Exhausted":
      return {
        label: "Exhausted",
        badgeClass: "bg-sky-900/70 text-sky-200 border-sky-500/60",
      };
    case "Hungry":
      return {
        label: "Hungry",
        badgeClass: "bg-amber-900/70 text-amber-200 border-amber-500/60",
      };
    case "Filthy":
      return {
        label: "Needs bath",
        badgeClass: "bg-lime-900/70 text-lime-200 border-lime-500/60",
      };
    case "Sad":
      return {
        label: "Sad",
        badgeClass: "bg-purple-900/70 text-purple-200 border-purple-500/60",
      };
    case "Ecstatic":
      return {
        label: "Ecstatic",
        badgeClass: "bg-emerald-900/70 text-emerald-200 border-emerald-500/70",
      };
    default:
      return {
        label: "Content",
        badgeClass: "bg-zinc-900/80 text-zinc-100 border-zinc-600/80",
      };
  }
}
function le({
  dogName: t = "Pup",
  level: r = 1,
  lifeStageLabel: i = "Puppy",
  lifeStageDay: s = 1,
  stats: n = {},
  pottyLevel: l = 0,
  pottyTraining: o = 0,
  isAsleep: u = !1,
}) {
  const m = d(re),
    I = d(P),
    f = t || I?.name || "Pup",
    A = He(n),
    h = Ke(A);
  return (
    m &&
      (m.displayName
        ? m.displayName.split(" ")[0]
        : m.email && m.email.split("@")[0]),
    e.jsxs("header", {
      className:
        "w-full bg-zinc-900/80 backdrop-blur-sm border-b border-zinc-800 px-3 py-2 sm:px-4 sm:py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2",
      role: "region",
      "aria-label": "Dog status bar",
      children: [
        e.jsxs("div", {
          className: "flex items-center gap-3",
          children: [
            e.jsxs("div", {
              className: "flex flex-col leading-tight",
              children: [
                e.jsx("span", {
                  className:
                    "text-[9px] uppercase tracking-[0.28em] text-emerald-400/90",
                }),
                "Doggerz • Yard",
              ],
            }),
            e.jsxs("div", {
              className: "flex items-baseline gap-2",
              children: [
                e.jsx("h1", {
                  className: "text-lg sm:text-xl font-bold text-white",
                  children: f,
                }),
                e.jsxs("span", {
                  className: "text-xs text-emerald-300 font-mono",
                  children: ["Lv ", r],
                }),
              ],
            }),
          ],
        }),
        e.jsxs("div", {
          className: "flex flex-col items-start sm:items-end gap-1",
          children: [
            e.jsxs("span", {
              className:
                "inline-flex items-center rounded-full bg-zinc-900 px-3 py-1 text-[11px] text-zinc-100 font-medium border border-zinc-700/80",
              children: [
                e.jsx("span", {
                  className: "uppercase tracking-[0.18em] text-zinc-400 mr-2",
                  children: "Stage",
                }),
                e.jsxs("span", {
                  className: "text-zinc-100",
                  children: [i, " • Day ", s],
                }),
              ],
            }),
            e.jsx("span", {
              className: "inline-flex items-center gap-2 text-xs text-zinc-100",
              "aria-live": "polite",
              children: u
                ? e.jsxs(e.Fragment, {
                    children: [
                      e.jsx("span", {
                        className:
                          "h-1.5 w-1.5 rounded-full bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.9)]",
                      }),
                      e.jsx("span", {
                        className: "text-sky-300 font-medium",
                        children: "Sleeping",
                      }),
                    ],
                  })
                : e.jsxs(e.Fragment, {
                    children: [
                      e.jsx("span", {
                        className:
                          "text-[10px] uppercase tracking-[0.22em] text-zinc-400",
                        children: "Mood",
                      }),
                      e.jsx("span", {
                        className: `inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${h.badgeClass}`,
                        children: h.label,
                      }),
                    ],
                  }),
            }),
          ],
        }),
      ],
    })
  );
}
le.propTypes = {
  dogName: b.string,
  level: b.number,
  lifeStageLabel: b.string,
  lifeStageDay: b.number,
  stats: b.object,
  pottyLevel: b.number,
  pottyTraining: b.number,
  isAsleep: b.bool,
};
function Ve({ zip: t } = {}) {
  const [r, i] = a.useState(E());
  return (
    a.useEffect(() => {
      const n = setInterval(() => i(E()), 6e4);
      return () => clearInterval(n);
    }, []),
    {
      style: a.useMemo(() => {
        try {
          const n = new URL(
              "/assets/backyard-day-CWIBoNbF.png",
              import.meta.url,
            ).href,
            l = new URL("/assets/backyard-night-CfWBTpM2.png", import.meta.url)
              .href;
          switch (r) {
            case "dawn":
            case "morning":
            case "afternoon":
              return {
                backgroundImage: `url(${n})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              };
            case "dusk":
            case "evening":
            case "night":
            default:
              return {
                backgroundImage: `url(${l})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              };
          }
        } catch {
          return {
            backgroundImage:
              "linear-gradient(180deg, #020617 0%, #000000 100%)",
            backgroundSize: "cover",
          };
        }
      }, [r, t]),
      timeOfDay: r,
    }
  );
}
const ae = {
  dawn: "linear-gradient(180deg, rgba(255,209,143,0.5) 0%, rgba(15,23,42,0.7) 100%)",
  morning:
    "linear-gradient(180deg, rgba(255,255,255,0.15) 0%, rgba(15,23,42,0.5) 100%)",
  afternoon:
    "linear-gradient(180deg, rgba(255,255,255,0.1) 0%, rgba(15,23,42,0.45) 65%, rgba(2,6,23,0.6) 100%)",
  dusk: "linear-gradient(180deg, rgba(255,164,119,0.4) 0%, rgba(2,6,23,0.8) 100%)",
  evening:
    "linear-gradient(180deg, rgba(15,23,42,0.2) 0%, rgba(2,6,23,0.85) 100%)",
  night: "linear-gradient(180deg, rgba(2,6,23,0.4) 0%, rgba(0,0,0,0.9) 100%)",
};
function We() {
  const t = oe(),
    { temperamentRevealReady: r } = $e(),
    i = d(re),
    s = d(P),
    n = d(Se),
    l = i?.zip || void 0,
    { style: o } = Ve({ zip: l }),
    u = d(ke),
    m = d(Ce),
    I = d(Te),
    [f, A] = a.useState(E()),
    [h, K] = a.useState(null),
    [qe, V] = a.useState(0),
    [y, w] = a.useState(null),
    v = a.useRef(null),
    N = a.useRef(null),
    S = a.useRef(null),
    R = m?.active || null,
    ie = s?.name || "Pup",
    ce = Number.isFinite(s?.level) ? s.level : 1,
    de = Number.isFinite(s?.coins) ? s.coins : 0,
    L = n?.stage || "PUPPY",
    ue = n?.label || (L === "PUPPY" ? "Puppy" : L),
    me = n?.days ?? 0,
    W = I || {},
    k = W.potty || {},
    M = k.goal ?? 8,
    J = k.successes ?? k.successCount ?? 0,
    Q = !!(k.completedAt || J >= M),
    Z = M ? Math.min(1, J / M) : Q ? 1 : 0,
    ge = W.adult || {},
    F = new Date().toISOString().slice(0, 10),
    O = ge.lastCompletedDate || null,
    q = O === F,
    X = L === "PUPPY",
    _ = Math.round(s?.stats?.hunger ?? 0),
    U = Math.round(s?.stats?.happiness ?? 0),
    Y = Math.round(s?.stats?.energy ?? 0),
    B = Math.round(s?.stats?.cleanliness ?? 0),
    pe = s?.mood?.label || "Calibrating vibe…",
    be = a.useMemo(
      () => ({ hunger: _, happiness: U, energy: Y, cleanliness: B }),
      [_, U, Y, B],
    ),
    G = s?.poopCount ?? 0,
    $ = Math.round(s?.pottyLevel ?? 0),
    xe =
      $ >= 75
        ? "Emergency walk NOW"
        : $ >= 50
          ? "Itching to go"
          : $ >= 25
            ? "Ready for a break"
            : "All good",
    fe =
      G === 0
        ? "Yard is spotless"
        : G === 1
          ? "One pile waiting"
          : `${G} piles waiting`,
    ee = te[u] || te.FRESH || {},
    he = ee.label || u || "Fresh",
    ye = ee.journalSummary || "Freshly pampered and glowing.",
    ve = { background: ae[f] || ae.afternoon },
    Ne = !!s,
    j = !!s?.adoptedAt;
  (a.useEffect(() => {
    const c = setInterval(() => A(E()), 6e4);
    return () => clearInterval(c);
  }, []),
    a.useEffect(
      () => () => {
        (v.current && clearTimeout(v.current),
          N.current && clearTimeout(N.current));
      },
      [],
    ),
    a.useEffect(() => {
      if (!R) {
        V(0);
        return;
      }
      const c = () => {
        const ze = Math.max(0, Math.round((R.expiresAt - Date.now()) / 1e3));
        V(ze);
      };
      c();
      const p = setInterval(c, 1e3);
      return () => clearInterval(p);
    }, [R]),
    a.useEffect(() => {
      if (!j) {
        ((S.current = null), y && w(null));
        return;
      }
      if (X || q) {
        ((S.current = null), y && w(null));
        return;
      }
      const c = `${F}-${O || "none"}`;
      S.current !== c &&
        ((S.current = c),
        N.current && clearTimeout(N.current),
        w("Adult training overdue — run a command to keep streaks alive."),
        (N.current = setTimeout(() => w(null), 6e3)));
    }, [j, X, q, F, O, y]));
  const g = a.useCallback((c) => {
      (v.current && clearTimeout(v.current),
        K(c),
        (v.current = setTimeout(() => K(null), 2500)));
    }, []),
    z = a.useCallback(
      (c) => {
        if (!s) return;
        const p = Date.now();
        switch (c) {
          case "feed":
            (t(Le({ now: p })), g("Nom nom nom."));
            break;
          case "play":
            (t(Re({ now: p, timeOfDay: f === "morning" ? "MORNING" : "DAY" })),
              g("Zoomies achieved!"));
            break;
          case "bathe":
            (t(Ae({ now: p })), g("Scrub-a-dub-dub."));
            break;
          case "potty":
            if ((s.pottyLevel ?? 0) < 25) {
              g("Not urgent yet.");
              break;
            }
            (t(Ie({ now: p })), g("Potty break complete."));
            break;
          case "scoop":
            if ((s.poopCount ?? 0) <= 0) {
              g("Yard is already spotless.");
              break;
            }
            (t(Pe({ now: p })), g("Yard cleaned up."));
            break;
          case "train":
            (t(Ee({ commandId: "sit", success: !0, xp: 8, now: p })),
              g("Practiced SIT command."));
            break;
        }
      },
      [t, s, g, f],
    );
  a.useCallback(
    (c) => {
      t(Me({ accepted: c, reason: c ? "ACCEPT" : "DECLINE", now: Date.now() }));
    },
    [t],
  );
  const je = a.useCallback(() => {
    (t(Fe("Buddy")), t(Oe(Date.now())));
  }, [t]);
  let C;
  return (
    Ne
      ? j
        ? (C = e.jsxs("section", {
            className: "grid gap-6 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]",
            children: [
              e.jsxs("div", {
                className:
                  "relative rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900",
                children: [
                  e.jsx("div", {
                    className: "absolute inset-0 bg-cover bg-center opacity-80",
                    style: o,
                  }),
                  e.jsx("div", {
                    className: "absolute inset-0 mix-blend-multiply",
                    style: ve,
                  }),
                  e.jsx("div", {
                    className:
                      "relative z-10 flex flex-col items-center justify-center h-64",
                    children: e.jsx(Be, {}),
                  }),
                  e.jsxs("div", {
                    className:
                      "relative z-10 flex justify-between items-center px-4 py-2 text-[0.7rem] bg-zinc-950/70 border-t border-zinc-800",
                    children: [
                      e.jsxs("span", {
                        className: "text-zinc-400",
                        children: [
                          "Potty: ",
                          e.jsx("span", {
                            className: "text-zinc-100",
                            children: xe,
                          }),
                        ],
                      }),
                      e.jsxs("span", {
                        className: "text-zinc-400",
                        children: [
                          "Yard: ",
                          e.jsx("span", {
                            className: "text-zinc-100",
                            children: fe,
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              e.jsxs("div", {
                className: "space-y-4",
                children: [
                  e.jsxs("div", {
                    className:
                      "rounded-2xl border border-zinc-800 bg-zinc-900 p-4 space-y-1",
                    children: [
                      e.jsxs("p", {
                        className: "text-xs text-zinc-400",
                        children: [
                          "Cleanliness:",
                          " ",
                          e.jsx("span", {
                            className: "font-semibold text-zinc-100",
                            children: he,
                          }),
                        ],
                      }),
                      e.jsx("p", {
                        className: "text-[0.7rem] text-zinc-500",
                        children: ye,
                      }),
                    ],
                  }),
                  e.jsxs("div", {
                    className:
                      "rounded-2xl border border-zinc-800 bg-zinc-900 p-4",
                    children: [
                      e.jsxs("div", {
                        className: "flex items-center justify-between mb-2",
                        children: [
                          e.jsx("span", {
                            className: "text-xs text-zinc-400",
                            children: "Potty Training",
                          }),
                          e.jsxs("span", {
                            className: "text-xs font-semibold text-zinc-100",
                            children: [Math.round(Z * 100), "%"],
                          }),
                        ],
                      }),
                      e.jsx("div", {
                        className:
                          "h-3 bg-zinc-800 rounded-full overflow-hidden",
                        children: e.jsx("div", {
                          className: "h-full bg-emerald-500 transition-all",
                          style: { width: `${Math.round(Z * 100)}%` },
                        }),
                      }),
                      Q &&
                        e.jsx("div", {
                          className: "mt-2 text-[0.7rem] text-emerald-300",
                          children:
                            "Potty training complete — accidents reduced.",
                        }),
                    ],
                  }),
                  e.jsx("div", {
                    className:
                      "rounded-2xl border border-zinc-800 bg-zinc-900 p-4 space-y-4",
                    children: e.jsxs("div", {
                      className: "grid grid-cols-2 gap-4",
                      children: [
                        e.jsx(T, {
                          label: "Hunger",
                          value: _,
                          color: "amber",
                          inverse: !0,
                        }),
                        e.jsx(T, {
                          label: "Happiness",
                          value: U,
                          color: "emerald",
                        }),
                        e.jsx(T, { label: "Energy", value: Y, color: "blue" }),
                        e.jsx(T, {
                          label: "Cleanliness",
                          value: B,
                          color: "cyan",
                        }),
                      ],
                    }),
                  }),
                  e.jsxs("div", {
                    className:
                      "rounded-2xl border border-zinc-800 bg-zinc-900 p-4",
                    children: [
                      e.jsxs("div", {
                        className: "grid grid-cols-2 gap-3",
                        children: [
                          e.jsx("button", {
                            onClick: () => z("feed"),
                            className:
                              "px-4 py-3 bg-amber-600 hover:bg-amber-500 rounded-lg font-semibold transition text-sm",
                            children: "🍖 Feed",
                          }),
                          e.jsx("button", {
                            onClick: () => z("play"),
                            className:
                              "px-4 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-lg font-semibold transition text-sm",
                            children: "🎾 Play",
                          }),
                          e.jsx("button", {
                            onClick: () => z("bathe"),
                            className:
                              "px-4 py-3 bg-cyan-600 hover:bg-cyan-500 rounded-lg font-semibold transition text-sm col-span-2",
                            children: "🛁 Bathe",
                          }),
                        ],
                      }),
                      e.jsxs("div", {
                        className: "mt-3 grid grid-cols-2 gap-3 text-xs",
                        children: [
                          e.jsx("button", {
                            onClick: () => z("potty"),
                            className:
                              "px-3 py-2 rounded-lg border border-zinc-700 hover:border-emerald-500/70 hover:bg-zinc-800 text-zinc-200 transition",
                            children: "🚶 Potty Walk",
                          }),
                          e.jsx("button", {
                            onClick: () => z("scoop"),
                            className:
                              "px-3 py-2 rounded-lg border border-zinc-700 hover:border-amber-500/70 hover:bg-zinc-800 text-zinc-200 transition",
                            children: "🗑️ Scoop Yard",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }))
        : (C = e.jsx("div", {
            className:
              "flex items-center justify-center min-h-[60vh] bg-zinc-950",
            children: e.jsxs("div", {
              className: "text-center",
              children: [
                e.jsx("h2", {
                  className: "text-2xl font-bold text-zinc-50 mb-4",
                  children: "No Dog Adopted",
                }),
                e.jsx("p", {
                  className: "text-zinc-400 mb-6",
                  children: "Adopt a dog to get started with the main game.",
                }),
                e.jsx("button", {
                  onClick: je,
                  className:
                    "px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-full transition",
                  children: "Quick Adopt (Test)",
                }),
              ],
            }),
          }))
      : (C = e.jsx("div", {
          className:
            "flex items-center justify-center min-h-[60vh] bg-zinc-950",
          children: e.jsxs("div", {
            className: "space-y-3 text-center max-w-sm px-4",
            children: [
              e.jsx("h1", {
                className: "text-lg font-semibold tracking-tight",
                children: "Loading your pup…",
              }),
              e.jsx("p", {
                className: "text-xs text-zinc-400",
                children:
                  "If this screen is stuck, use the back button and go through the Adopt flow again so Doggerz can create your save file.",
              }),
            ],
          }),
        })),
    e.jsx("div", {
      className: "min-h-screen bg-zinc-950 text-zinc-50 p-6",
      children: e.jsxs("div", {
        className: "max-w-5xl mx-auto space-y-6",
        children: [
          j &&
            e.jsx(le, {
              dogName: ie,
              level: ce,
              coins: de,
              lifeStageLabel: ue,
              lifeStageDay: me,
              timeOfDay: f,
              moodLabel: pe,
              needs: be,
              temperamentRevealReady: r,
            }),
          j &&
            (h || y) &&
            e.jsxs("div", {
              className: "space-y-2 text-xs text-amber-200",
              children: [
                h &&
                  e.jsx("div", {
                    className:
                      "inline-flex rounded-full bg-amber-900/40 border border-amber-500/40 px-3 py-1",
                    children: h,
                  }),
                y &&
                  e.jsx("div", {
                    className:
                      "inline-flex rounded-full bg-zinc-900/70 border border-zinc-700 px-3 py-1",
                    children: y,
                  }),
              ],
            }),
          C,
        ],
      }),
    })
  );
}
function T({ label: t, value: r, color: i, inverse: s = !1 }) {
  const l =
      {
        amber: "bg-amber-500",
        emerald: "bg-emerald-500",
        blue: "bg-blue-500",
        cyan: "bg-cyan-500",
      }[i] || "bg-zinc-500",
    o = Number.isFinite(r) ? r : 0,
    u = s ? 100 - o : o,
    m = Math.max(0, Math.min(100, u));
  return e.jsxs("div", {
    children: [
      e.jsxs("div", {
        className: "flex justify-between text-sm text-zinc-300 mb-2",
        children: [
          e.jsx("span", { className: "font-medium", children: t }),
          e.jsx("span", {
            className: "font-bold text-zinc-100",
            children: Math.round(o),
          }),
        ],
      }),
      e.jsx("div", {
        className: "h-3 bg-zinc-800 rounded-full overflow-hidden",
        children: e.jsx("div", {
          className: `h-full ${l} transition-all duration-500 shadow-md`,
          style: { width: `${m}%` },
        }),
      }),
    ],
  });
}
const Je = 6e4,
  Qe = 3e3;
function Ze() {
  const t = oe(),
    r = d(P),
    i = a.useRef(!1),
    s = a.useRef(null);
  return (
    a.useEffect(() => {
      if (!i.current) {
        i.current = !0;
        try {
          const n = window.localStorage.getItem(se);
          if (n) {
            const l = JSON.parse(n);
            (t(_e(l)),
              console.info("[Doggerz] Hydrated dog from localStorage"));
          }
        } catch (n) {
          console.error("[Doggerz] Failed to parse localStorage dog data", n);
        }
        try {
          if (
            !window.localStorage.getItem("doggerz:cloudDisabled") &&
            D &&
            x?.currentUser
          ) {
            console.debug("[Doggerz] Attempting cloud hydrate", {
              uid: x.currentUser?.uid,
            });
            const l = t(ne());
            l && typeof l.unwrap == "function"
              ? l.unwrap().catch((o) => {
                  console.error("[Doggerz] Failed to load dog from cloud", o);
                  try {
                    (o?.code === "permission-denied" ||
                      String(o?.message || "")
                        .toLowerCase()
                        .includes("insufficient permissions")) &&
                      (window.localStorage.setItem(
                        "doggerz:cloudDisabled",
                        "1",
                      ),
                      console.warn(
                        "[Doggerz] Cloud sync disabled due to permission errors",
                      ));
                  } catch {}
                })
              : l?.catch &&
                l.catch((o) => {
                  console.error("[Doggerz] Failed to load dog from cloud", o);
                  try {
                    (o?.code === "permission-denied" ||
                      String(o?.message || "")
                        .toLowerCase()
                        .includes("insufficient permissions")) &&
                      (window.localStorage.setItem(
                        "doggerz:cloudDisabled",
                        "1",
                      ),
                      console.warn(
                        "[Doggerz] Cloud sync disabled due to permission errors",
                      ));
                  } catch {}
                });
          }
        } catch {}
        t(H({ now: Date.now() }));
      }
    }, [t]),
    a.useEffect(() => {
      if (D && x?.currentUser && i.current) {
        try {
          if (!window.localStorage.getItem("doggerz:cloudDisabled")) {
            console.debug("[Doggerz] Attempting late cloud hydrate", {
              uid: x.currentUser?.uid,
            });
            const l = t(ne());
            l && typeof l.unwrap == "function"
              ? l.unwrap().catch((o) => {
                  console.error("[Doggerz] Late cloud load failed", o);
                  try {
                    (o?.code === "permission-denied" ||
                      String(o?.message || "")
                        .toLowerCase()
                        .includes("insufficient permissions")) &&
                      (window.localStorage.setItem(
                        "doggerz:cloudDisabled",
                        "1",
                      ),
                      console.warn(
                        "[Doggerz] Cloud sync disabled due to permission errors",
                      ));
                  } catch {}
                })
              : l?.catch &&
                l.catch((o) => {
                  console.error("[Doggerz] Late cloud load failed", o);
                  try {
                    (o?.code === "permission-denied" ||
                      String(o?.message || "")
                        .toLowerCase()
                        .includes("insufficient permissions")) &&
                      (window.localStorage.setItem(
                        "doggerz:cloudDisabled",
                        "1",
                      ),
                      console.warn(
                        "[Doggerz] Cloud sync disabled due to permission errors",
                      ));
                  } catch {}
                });
          }
        } catch {}
        t(H({ now: Date.now() }));
      }
    }, [t, D, x?.currentUser]),
    a.useEffect(() => {
      if (!(!r || !r.adoptedAt))
        try {
          window.localStorage.setItem(se, JSON.stringify(r));
        } catch (n) {
          console.error("[Doggerz] Failed to save to localStorage", n);
        }
    }, [r]),
    a.useEffect(() => {
      if (!(!r || !r.adoptedAt) && !(!D || !x?.currentUser))
        return (
          s.current && clearTimeout(s.current),
          (s.current = setTimeout(() => {
            try {
              if (!Ge().allowCloudSync) {
                console.info(
                  "[Doggerz] Cloud sync disabled by settings; skipping save.",
                );
                return;
              }
            } catch {}
            t(Ue());
          }, Qe)),
          () => {
            s.current && clearTimeout(s.current);
          }
        );
    }, [r, t, D, x?.currentUser]),
    a.useEffect(() => {
      const n = setInterval(() => {
        t(H({ now: Date.now() }));
      }, Je);
      return () => clearInterval(n);
    }, [t]),
    null
  );
}
function tt() {
  return e.jsxs(e.Fragment, {
    children: [
      e.jsx(Ze, {}),
      e.jsx(Ye, { title: "Yard", children: e.jsx(We, {}) }),
    ],
  });
}
export { tt as default };
