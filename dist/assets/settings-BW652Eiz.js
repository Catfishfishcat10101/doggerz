import {
  u as F,
  i as C,
  k as P,
  r as _,
  b as B,
  j as i,
} from "./index-ClZwlZUg.js";
const N = "/assets/jack_russell_puppy_hd-mFC3nHYE.svg",
  L = "/assets/jack_russell_puppy-GA4cHuBT.png",
  M = "/assets/jack_russell_adult-D2zl0Hic.svg",
  $ = "/assets/jack_russell_adult-E8VsjF-i.png",
  U = "/assets/jack_russell_senior_hd-Cx1USs4w.svg",
  H = "/assets/jack_russell_puppy-GA4cHuBT.png",
  G = "/assets/jack_russell_adult-E8VsjF-i.png",
  O = "/assets/jack_russell_adult_dirty-BS6U00N_.png",
  V = "/assets/jack_russell_adult_fleas-DHcCCrgL.png",
  Y = "/assets/jack_russell_adult_mange-8xGPx0Ns.png",
  K = "/assets/jack_russell_puppy-GA4cHuBT.png",
  W = "/assets/jack_russell_puppy_dirty-Dx9FgLWm.png",
  z = "/assets/jack_russell_puppy_fleas-BEJpCiVH.png",
  J = "/assets/jack_russell_puppy_mange-DFl_zxjR.png",
  X = "/assets/jack_russell_puppy-GA4cHuBT.png",
  q = "/assets/jack_russell_senior_dirty-CNZlPyw-.png",
  Q = "/assets/jack_russell_senior_fleas-NDgBOe2m.png",
  Z = "/assets/jack_russell_senior_mange-61PrjIeQ.png",
  ee = {
    BASE_URL: "/",
    DEV: !1,
    MODE: "production",
    PROD: !0,
    SSR: !1,
    VITE_FIREBASE_API_KEY: "AIzaSyBYN6XJEAiw6eVIChByegk9xcGLWIA0C1E",
    VITE_FIREBASE_APP_ID: "1:1014835520506:web:6dc75cbe987d1dc10a3a49",
    VITE_FIREBASE_AUTH_DOMAIN: "dogger-a8021.firebaseapp.com",
    VITE_FIREBASE_MESSAGING_SENDER_ID: "1014835520506",
    VITE_FIREBASE_PROJECT_ID: "dogger-a8021",
    VITE_FIREBASE_STORAGE_BUCKET: "dogger-a8021.appspot.com",
  };
function se(e, s = "FRESH") {
  const t = e.toUpperCase(),
    a = !!(ee && !1),
    l = (n) => {
      try {
        return new URL(
          Object.assign({})[`../../../assets/sprites/jackrussell/${n}.webp`],
          import.meta.url,
        ).href;
      } catch {
        return null;
      }
    };
  switch (t) {
    case "PUPPY": {
      const n = "puppy";
      if (s === "FRESH") {
        if (a) {
          const r = l(`jack_russell_${n}`);
          if (r) return r;
        }
        return N;
      }
      if (a) {
        const r = l(`jack_russell_${n}_` + (s || "").toLowerCase());
        if (r) return r;
      }
      return L;
    }
    case "ADULT": {
      const n = "adult";
      if (s === "FRESH") {
        if (a) {
          const r = l(`jack_russell_${n}`);
          if (r) return r;
        }
        return M;
      }
      if (a) {
        const r = l(`jack_russell_${n}_` + (s || "").toLowerCase());
        if (r) return r;
      }
      return $;
    }
    case "SENIOR":
    default: {
      const n = "senior";
      if (s === "FRESH") {
        if (a) {
          const r = l(`jack_russell_${n}`);
          if (r) return r;
        }
        return U;
      }
      if (a) {
        const r = l(`jack_russell_${n}_` + (s || "").toLowerCase());
        if (r) return r;
      }
      return H;
    }
  }
}
const T = {
    default: { start: 0, frames: 4, interval: 350 },
    puppy: { start: 0, frames: 4, interval: 320 },
    adult: { start: 0, frames: 6, interval: 280 },
    senior: { start: 0, frames: 4, interval: 420 },
  },
  te = { FRESH: "", DIRTY: "_dirty", FLEAS: "_fleas", MANGE: "_mange" };
function re() {
  const e = F(C),
    s = F(P),
    t = (e?.lifeStage || e?.stage || "PUPPY").toUpperCase(),
    a = _.useMemo(() => {
      try {
        return se(t || "PUPPY", s);
      } catch {
        return "";
      }
    }, [t, s]),
    [l, n] = _.useState(a || "");
  _.useEffect(() => {
    if (!a) {
      n("");
      return;
    }
    let g = !0;
    const I = (m) => new Promise((f) => setTimeout(f, m)),
      x = 2,
      S = 200;
    async function j(m) {
      let f = 0,
        E = null;
      for (; f <= x && g; )
        try {
          return (
            await new Promise((v, h) => {
              const b = new Image();
              ((b.onload = () => v()),
                (b.onerror = (k) => h(k || new Error("img load error"))),
                (b.src = m));
            }),
            m
          );
        } catch (v) {
          if (((E = v), (f += 1), f <= x && g)) {
            const h = S * Math.pow(3, f - 1);
            await I(h);
          }
        }
      throw E || new Error("failed to load image");
    }
    let y = !1;
    return (
      (async () => {
        try {
          const m = await j(a);
          if (!g || y) return;
          n(m || a);
          return;
        } catch {
          if (!g || y) return;
          if (typeof a == "string" && a.endsWith(".svg"))
            try {
              const f = (t || "PUPPY").toLowerCase(),
                E = te[s] || "",
                v = new URL(
                  Object.assign({
                    "../../../assets/sprites/jackrussell/jack_russell_adult.png":
                      G,
                    "../../../assets/sprites/jackrussell/jack_russell_adult_dirty.png":
                      O,
                    "../../../assets/sprites/jackrussell/jack_russell_adult_fleas.png":
                      V,
                    "../../../assets/sprites/jackrussell/jack_russell_adult_mange.png":
                      Y,
                    "../../../assets/sprites/jackrussell/jack_russell_puppy.png":
                      K,
                    "../../../assets/sprites/jackrussell/jack_russell_puppy_dirty.png":
                      W,
                    "../../../assets/sprites/jackrussell/jack_russell_puppy_fleas.png":
                      z,
                    "../../../assets/sprites/jackrussell/jack_russell_puppy_mange.png":
                      J,
                    "../../../assets/sprites/jackrussell/jack_russell_senior.png":
                      X,
                    "../../../assets/sprites/jackrussell/jack_russell_senior_dirty.png":
                      q,
                    "../../../assets/sprites/jackrussell/jack_russell_senior_fleas.png":
                      Q,
                    "../../../assets/sprites/jackrussell/jack_russell_senior_mange.png":
                      Z,
                  })[
                    `../../../assets/sprites/jackrussell/jack_russell_${f}${E}.png`
                  ],
                  import.meta.url,
                ).href,
                h = await j(v);
              if (!g || y) return;
              n(h);
              return;
            } catch {}
          g && !y && n("");
        }
      })(),
      () => {
        ((g = !1), (y = !0));
      }
    );
  }, [a, t, s]);
  const r = 128,
    c = 16,
    o = 16,
    u = 1.25,
    [p, d] = _.useState(0);
  _.useEffect(() => {
    if (!a) return;
    const g = (t || "PUPPY").toLowerCase(),
      I = T[g] || T.default,
      { start: x = 0, frames: S = 4, interval: j = 350 } = I;
    d(x);
    const y = setInterval(() => {
      d((m) => {
        const E = (m + 1 - x) % S;
        return x + (E < 0 ? E + S : E);
      });
    }, j);
    return () => clearInterval(y);
  }, [a, t]);
  const A = p % c,
    D = Math.floor(p / c);
  return {
    spriteSrc: l || a,
    frameSize: r,
    cols: c,
    rows: o,
    frameIndex: p,
    frameX: A,
    frameY: D,
    scale: u,
    cleanlinessTier: s,
    currentAnimation: "idle",
  };
}
function ae(e, s) {
  const t = B(),
    [a, l] = _.useState(!1),
    [n, r] = _.useState(!1),
    c = _.useMemo(() => {
      try {
        const u = e || "";
        return u.includes("puppy")
          ? "puppy"
          : u.includes("adult")
            ? "adult"
            : u.includes("senior")
              ? "senior"
              : "puppy";
      } catch {
        return "puppy";
      }
    }, [e]),
    o = _.useMemo(
      () =>
        `data:image/svg+xml;utf8,${encodeURIComponent(`<?xml version="1.0" encoding="UTF-8"?><svg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'><rect width='64' height='64' fill='${c === "puppy" ? "#F1D2B0" : c === "adult" ? "#E3B97D" : "#DCC3A0"}'/><circle cx='20' cy='28' r='10' fill='#4B3420' opacity='0.14'/><circle cx='44' cy='28' r='6' fill='#111'/><rect x='18' y='42' width='28' height='6' rx='3' fill='${s === "DIRTY" ? "rgba(67,20,7,0.18)" : s === "FLEAS" ? "rgba(0,0,0,0.12)" : s === "MANGE" ? "rgba(255,255,255,0.14)" : "rgba(0,0,0,0)"}'/></svg>`)}`,
      [c, s],
    );
  return (
    _.useEffect(() => {
      if ((l(!1), r(!1), !e)) return;
      const u = new Image();
      return (
        (u.onload = () => l(!0)),
        (u.onerror = () => {
          r(!0);
          try {
            t.add("Failed to load dog sprite");
          } catch {}
        }),
        (u.src = e),
        () => {
          ((u.onload = null), (u.onerror = null));
        }
      );
    }, [e]),
    { imageLoaded: a, imageFailed: n, inferredStage: c, lqipDataUrl: o }
  );
}
function ne({
  baseSize: e,
  animateWag: s,
  lqipDataUrl: t,
  imageLoaded: a,
  spriteSrc: l,
  computedBackgroundSize: n,
  computedBackgroundPosition: r,
  imageFailed: c,
}) {
  const o = e * 0.7,
    u = e * 0.18;
  return i.jsxs(i.Fragment, {
    children: [
      i.jsx("div", {
        className: "pointer-events-none rounded-full bg-black/50 blur-md",
        style: { width: o, height: u, transform: "translateY(12px)" },
        "aria-hidden": "true",
      }),
      i.jsxs("div", {
        className: "relative",
        style: {
          width: e,
          height: e,
          transform: s ? "translateX(6px) rotate(3deg)" : void 0,
          transition: "transform 180ms ease",
        },
        "aria-hidden": !0,
        children: [
          i.jsx("div", {
            className: "absolute inset-0 rounded-xl overflow-hidden",
            style: {
              backgroundImage: `url(${t})`,
              backgroundSize: "cover",
              filter: a ? "none" : "blur(6px)",
              transition: "filter 280ms ease, opacity 220ms ease",
              opacity: a ? 0.6 : 1,
            },
            "aria-hidden": "true",
          }),
          i.jsx("div", {
            className: "absolute inset-0 rounded-xl",
            style: {
              imageRendering:
                l && (l.endsWith(".png") || l.endsWith(".webp"))
                  ? "pixelated"
                  : "auto",
              backgroundImage: `url(${l})`,
              backgroundSize: n,
              backgroundPosition: r,
              opacity: a ? 1 : 0,
              transition: "opacity 220ms ease",
            },
            "aria-hidden": "true",
          }),
          c &&
            i.jsxs("div", {
              className:
                "absolute inset-0 flex items-center justify-center bg-black/40 rounded-xl text-xs text-zinc-50",
              role: "status",
              "aria-live": "polite",
              children: [
                i.jsx("span", {
                  className: "sr-only",
                  children: "Sprite failed to load",
                }),
                i.jsx("span", { children: "Sprite unavailable" }),
              ],
            }),
        ],
      }),
    ],
  });
}
function oe({ cleanlinessTier: e, inferredStage: s, baseSize: t }) {
  const a = (() => {
      switch (e) {
        case "DIRTY":
          return "bg-[radial-gradient(circle_at_30%_20%,rgba(120,53,15,0.35),transparent_55%),radial-gradient(circle_at_70%_80%,rgba(67,20,7,0.4),transparent_60%)]";
        case "FLEAS":
          return "bg-[radial-gradient(circle_at_25%_30%,rgba(120,53,15,0.5),transparent_55%),radial-gradient(circle_at_70%_70%,rgba(67,20,7,0.6),transparent_60%)]";
        case "MANGE":
          return "bg-[radial-gradient(circle_at_40%_30%,rgba(250,250,250,0.3),transparent_50%),radial-gradient(circle_at_70%_70%,rgba(127,29,29,0.6),transparent_55%)]";
        default:
          return "";
      }
    })(),
    l = e === "FLEAS" || e === "MANGE";
  return i.jsx(i.Fragment, {
    children:
      e !== "FRESH" &&
      i.jsxs(i.Fragment, {
        children: [
          i.jsx("div", {
            className: `absolute inset-0 mix-blend-multiply ${a}`,
            "aria-hidden": "true",
          }),
          l &&
            i.jsx("div", {
              className: "absolute inset-0 pointer-events-none",
              "aria-hidden": "true",
              children: (() => {
                const n = {
                    puppy: [
                      { x: 0.48, y: 0.28 },
                      { x: 0.62, y: 0.32 },
                      { x: 0.38, y: 0.42 },
                      { x: 0.52, y: 0.5 },
                      { x: 0.3, y: 0.38 },
                      { x: 0.68, y: 0.44 },
                    ],
                    adult: [
                      { x: 0.46, y: 0.3 },
                      { x: 0.6, y: 0.34 },
                      { x: 0.36, y: 0.46 },
                      { x: 0.54, y: 0.52 },
                      { x: 0.28, y: 0.4 },
                      { x: 0.7, y: 0.46 },
                    ],
                    senior: [
                      { x: 0.44, y: 0.32 },
                      { x: 0.58, y: 0.36 },
                      { x: 0.34, y: 0.48 },
                      { x: 0.56, y: 0.54 },
                      { x: 0.26, y: 0.42 },
                      { x: 0.72, y: 0.48 },
                    ],
                  },
                  r = n[s] || n.puppy,
                  c = Math.max(2, Math.round(t * 0.03));
                return r.map((o, u) => {
                  const p = Math.round(o.y * t),
                    d = Math.round(o.x * t);
                  return i.jsx(
                    "div",
                    {
                      className: "absolute rounded-full bg-black/80",
                      style: { width: c, height: c, top: p, left: d },
                    },
                    u,
                  );
                });
              })(),
            }),
        ],
      }),
  });
}
const le = {
  BASE_URL: "/",
  DEV: !1,
  MODE: "production",
  PROD: !0,
  SSR: !1,
  VITE_FIREBASE_API_KEY: "AIzaSyBYN6XJEAiw6eVIChByegk9xcGLWIA0C1E",
  VITE_FIREBASE_APP_ID: "1:1014835520506:web:6dc75cbe987d1dc10a3a49",
  VITE_FIREBASE_AUTH_DOMAIN: "dogger-a8021.firebaseapp.com",
  VITE_FIREBASE_MESSAGING_SENDER_ID: "1014835520506",
  VITE_FIREBASE_PROJECT_ID: "dogger-a8021",
  VITE_FIREBASE_STORAGE_BUCKET: "dogger-a8021.appspot.com",
};
function de({ animateWag: e = !1 }) {
  const {
      spriteSrc: s,
      frameSize: t,
      cols: a,
      rows: l,
      frameX: n,
      frameY: r,
      scale: c,
      cleanlinessTier: o,
    } = re(),
    {
      imageLoaded: u,
      imageFailed: p,
      inferredStage: d,
      lqipDataUrl: A,
    } = ae(s, o),
    g = `sprite-live-${_.useId()}`,
    [I, x] = _.useState(""),
    S = _.useRef(d),
    j = _.useRef(o);
  _.useEffect(() => {
    const h = d !== S.current,
      b = o !== j.current;
    if (h || b || p) {
      const k = d ? d.charAt(0).toUpperCase() + d.slice(1) : "Dog",
        R = o && o !== "FRESH" ? o.toLowerCase() : "clean";
      (x(`${k} dog, ${R}${p ? ", image unavailable" : ""}`),
        (S.current = d),
        (j.current = o));
    }
  }, [d, o, p]);
  const y = Math.round(t * c),
    m = t * a,
    f = t * l,
    E = `${Math.round(m * c)}px ${Math.round(f * c)}px`,
    v = (() => {
      try {
        const h = Math.round(n || 0),
          b = Math.round(r || 0),
          k = -h * t * c,
          R = -b * t * c;
        return `${Math.round(k)}px ${Math.round(R)}px`;
      } catch {
        return "0px 0px";
      }
    })();
  return i.jsxs("div", {
    className:
      "relative flex flex-col items-center justify-end select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400",
    role: "img",
    "aria-label": p
      ? `Dog sprite (image unavailable)${o !== "FRESH" ? `, ${o.toLowerCase()}` : ""}`
      : `Dog sprite${o !== "FRESH" ? ` (${o.toLowerCase()})` : ""}`,
    "aria-describedby": g,
    tabIndex: 0,
    children: [
      i.jsx(ne, {
        baseSize: y,
        animateWag: e,
        lqipDataUrl: A,
        imageLoaded: u,
        spriteSrc: s,
        computedBackgroundSize: E,
        computedBackgroundPosition: v,
        imageFailed: p,
      }),
      i.jsx(oe, { cleanlinessTier: o, inferredStage: d, baseSize: y }),
      i.jsx("div", {
        id: g,
        className: "sr-only",
        "aria-live": "polite",
        children: I,
      }),
      le && !1,
    ],
  });
}
function pe(e) {
  try {
    const t = (
      e instanceof Date ? e : typeof e == "number" ? new Date(e) : new Date()
    ).getHours();
    return t < 5
      ? "night"
      : t < 7
        ? "dawn"
        : t < 11
          ? "morning"
          : t < 16
            ? "afternoon"
            : t < 19
              ? "dusk"
              : t < 22
                ? "evening"
                : "night";
  } catch (s) {
    return (console.error("[Doggerz] getTimeOfDay failed:", s), "afternoon");
  }
}
const ie = "doggerz:settings",
  w = {
    zip: "65401",
    useRealTime: !0,
    theme: "dark" | "light",
    accent: "emerald",
    bladderModel: "realistic",
    difficulty: "normal",
    runMs: 800,
    autoPause: !0,
  };
function ce(e) {
  try {
    return JSON.parse(e);
  } catch {
    return null;
  }
}
function ge() {
  if (typeof window > "u") return { ...w };
  const e = window.localStorage.getItem(ie);
  if (!e) return { ...w };
  const s = ce(e);
  return !s || typeof s != "object" ? { ...w } : { ...w, ...s };
}
export { de as E, pe as g, ge as l, re as u };
