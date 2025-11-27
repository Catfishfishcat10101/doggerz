import {
  c as v,
  a as z,
  u as y,
  d as k,
  r,
  j as e,
  L as i,
  P as A,
  e as D,
  f as S,
} from "./index-ClZwlZUg.js";
function P() {
  const x = v(),
    u = z(),
    c = y(k),
    p = !!c?.adoptedAt,
    [l, f] = r.useState(c?.name || "Fireball"),
    [n, h] = r.useState(null),
    [j, g] = r.useState(!0),
    [d, b] = r.useState(0);
  r.useEffect(() => {
    let s = !0;
    const t = [
      "/sprites/jack_russell_puppy.png",
      "/sprites/jack_russell_adult.png",
      "/sprites/jack_russell_senior.png",
    ];
    let a = 0;
    return (
      t.forEach((w) => {
        const m = new window.Image();
        ((m.onload = () => {
          (a++,
            s && b(Math.round((a / t.length) * 100)),
            a === t.length && s && g(!1));
        }),
          (m.onerror = () => {
            (a++,
              s && b(Math.round((a / t.length) * 100)),
              a === t.length && s && g(!1));
          }),
          (m.src = w));
      }),
      () => {
        s = !1;
      }
    );
  }, []);
  const N = (s) => {
    (s.preventDefault(), h(null));
    const t = l.trim();
    if (!t || t.length < 2 || t.length > 20 || /[\p{Emoji}]/u.test(t)) {
      h("Name must be 2–20 characters, no emoji.");
      return;
    }
    (x(D(t)), p || x(S(Date.now())), u("/game"));
  };
  let o;
  return (
    p
      ? (o = e.jsxs("div", {
          className:
            "flex flex-col items-center w-full h-full pt-6 pb-10 bg-gradient-to-b from-zinc-950 to-zinc-900 text-white",
          children: [
            e.jsxs("div", {
              className: "flex flex-col items-center mb-6",
              children: [
                e.jsx("h1", {
                  className:
                    "text-4xl font-bold tracking-wide text-emerald-400 drop-shadow-lg",
                  children: "Doggerz",
                }),
                e.jsx("p", {
                  className: "text-sm text-zinc-300 mt-1",
                  children: "Virtual Pup Simulator",
                }),
                e.jsx(i, {
                  to: "/about",
                  className:
                    "mt-2 text-emerald-400 hover:underline text-xs font-semibold",
                  children: "About",
                }),
              ],
            }),
            e.jsxs("div", {
              className:
                "w-full max-w-md bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 shadow-xl",
              children: [
                e.jsx("h2", {
                  className: "text-xl font-semibold mb-2 text-emerald-300",
                  children: "You already adopted a pup",
                }),
                e.jsxs("p", {
                  className: "text-sm text-zinc-300 mb-4",
                  children: [
                    "Your current dog is",
                    " ",
                    e.jsx("span", {
                      className: "font-semibold",
                      children: c?.name || "your pup",
                    }),
                    ".",
                    e.jsx("br", {}),
                    "Future versions will support multiple pups and kennels, but right now Doggerz is a one-dog show.",
                  ],
                }),
                e.jsx("button", {
                  type: "button",
                  onClick: () => u("/game"),
                  className:
                    "w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-sm font-semibold shadow-lg",
                  children: "Go back to your yard",
                }),
                e.jsx(i, {
                  to: "/about",
                  className:
                    "mt-3 w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-sm font-semibold text-emerald-300 shadow-lg text-center block",
                  children: "About Doggerz",
                }),
              ],
            }),
          ],
        }))
      : j
        ? (o = e.jsx("div", {
            className:
              "flex flex-col items-center justify-center min-h-screen bg-zinc-950 text-white",
            children: e.jsxs("div", {
              role: "status",
              "aria-live": "polite",
              className: "flex flex-col items-center gap-4",
              children: [
                e.jsxs("svg", {
                  className: "animate-spin h-10 w-10 text-emerald-400",
                  viewBox: "0 0 24 24",
                  children: [
                    e.jsx("circle", {
                      className: "opacity-25",
                      cx: "12",
                      cy: "12",
                      r: "10",
                      stroke: "currentColor",
                      strokeWidth: "4",
                      fill: "none",
                    }),
                    e.jsx("path", {
                      className: "opacity-75",
                      fill: "currentColor",
                      d: "M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z",
                    }),
                  ],
                }),
                e.jsx("span", {
                  className: "text-lg font-semibold",
                  children: "Loading assets…",
                }),
                e.jsx("progress", {
                  value: d,
                  max: 100,
                  className: "w-48 h-2 rounded bg-zinc-800",
                  "aria-valuenow": d,
                  "aria-valuemax": 100,
                }),
                e.jsxs("span", {
                  className: "text-sm text-zinc-400",
                  children: [d, "%"],
                }),
              ],
            }),
          }))
        : (o = e.jsx(A, {
            className: "px-4 py-8",
            children: e.jsxs("div", {
              className:
                "min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center",
              children: [
                e.jsx("h1", {
                  className:
                    "text-4xl md:text-5xl font-extrabold text-emerald-400 tracking-tight text-center mb-4",
                  children: "Name your pup",
                }),
                e.jsx(i, {
                  to: "/about",
                  className:
                    "mb-4 text-emerald-400 hover:underline text-xs font-semibold",
                  children: "About Doggerz",
                }),
                e.jsx("p", {
                  className: "text-zinc-200 text-center max-w-md mb-8",
                  children:
                    "Pick a name your pup can grow into. You can change it later in Settings, but first impressions matter.",
                }),
                e.jsxs("form", {
                  onSubmit: N,
                  className:
                    "w-full max-w-md bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4",
                  "aria-label": "Adopt pup form",
                  children: [
                    e.jsxs("div", {
                      children: [
                        e.jsx("label", {
                          htmlFor: "pupName",
                          className:
                            "block text-sm font-medium text-zinc-200 mb-2",
                          children: "Pup's name",
                        }),
                        e.jsx("input", {
                          id: "pupName",
                          name: "pupName",
                          type: "text",
                          value: l,
                          onChange: (s) => f(s.target.value),
                          maxLength: 20,
                          className:
                            "w-full rounded-xl bg-zinc-950 border border-zinc-700 px-4 py-2 text-lg text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent placeholder:text-zinc-300",
                          placeholder: "Fireball",
                          autoComplete: "name",
                          "aria-invalid": !!n,
                          "aria-describedby": n ? "name-error" : void 0,
                        }),
                        e.jsx("p", {
                          className: "mt-1 text-xs text-zinc-400",
                          children:
                            "2–20 characters. No emojis, this isn't Instagram.",
                        }),
                        n &&
                          e.jsx("p", {
                            id: "name-error",
                            className: "text-xs text-red-400 mt-1",
                            children: n,
                          }),
                      ],
                    }),
                    e.jsx("button", {
                      type: "submit",
                      disabled:
                        l.trim().length < 2 ||
                        l.trim().length > 20 ||
                        /[\p{Emoji}]/u.test(l),
                      className:
                        "mt-4 w-full rounded-xl px-4 py-2 text-lg font-semibold bg-emerald-500 text-zinc-950 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150",
                      children: "Adopt my pup",
                    }),
                    e.jsx(i, {
                      to: "/about",
                      className:
                        "mt-3 w-full rounded-xl px-4 py-2 text-lg font-semibold bg-zinc-800 text-emerald-300 hover:bg-zinc-700 shadow-lg text-center block",
                      children: "About Doggerz",
                    }),
                  ],
                }),
                e.jsx("p", {
                  className: "mt-4 text-xs text-zinc-500",
                  children:
                    "Pro tip: Keep the name short. You’ll see it a lot in alerts, training, and future story events.",
                }),
              ],
            }),
          })),
    e.jsx(e.Fragment, { children: o })
  );
}
export { P as default };
