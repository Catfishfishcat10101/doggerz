import { j as e, P as t, L as a } from "./index-ClZwlZUg.js";
function s() {
  return e.jsx(t, {
    title: "Doggerz",
    subtitle: "ADOPT. TRAIN. RAISE. BOND.",
    metaDescription:
      "Doggerz splash entry: adopt and care for a real-time virtual dog with evolving needs and personality.",
    padding: "py-24 px-4",
    children: e.jsxs("div", {
      className: "space-y-8 text-center",
      "aria-label": "Splash content",
      children: [
        e.jsxs("div", {
          className: "inline-flex flex-col items-center gap-2",
          "aria-label": "Brand stack",
          children: [
            e.jsx("span", {
              className:
                "text-xs font-semibold uppercase tracking-[0.4em] text-emerald-300",
              children: "Welcome To",
            }),
            e.jsx("span", {
              className:
                "text-5xl font-black tracking-tight text-emerald-400 drop-shadow-[0_0_30px_rgba(16,185,129,0.7)]",
              children: "DOGGERZ",
            }),
            e.jsx("span", {
              className:
                "text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-emerald-300",
              children: "virtual dog simulator",
            }),
          ],
        }),
        e.jsx("p", {
          className: "mx-auto max-w-md text-sm text-zinc-200",
          children:
            "Real-time stats, even when your away. Your care & choices will influence growth, temperament & story. Check in often to keep your Doggerz happy and healthy!",
        }),
        e.jsxs("div", {
          className: "flex flex-wrap justify-center gap-3",
          "aria-label": "Splash actions",
          children: [
            e.jsx(a, {
              to: "/",
              className:
                "inline-flex items-center justify-center rounded-xl border border-emerald-400 bg-emerald-400 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-slate-950 shadow-lg shadow-emerald-500/30 transition hover:-translate-y-0.5 hover:bg-emerald-300",
              children: "Adopt",
            }),
            e.jsx(a, {
              to: "/login",
              className:
                "inline-flex items-center justify-center rounded-xl border border-emerald-400 bg-emerald-400 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-slate-950 shadow-lg shadow-emerald-500/30 transition hover:-translate-y-0.5 hover:bg-emerald-300",
              children: "Log in",
            }),
          ],
        }),
        e.jsx("div", {
          className: "text-[0.65rem] text-zinc-200",
          children: " ",
        }),
      ],
    }),
  });
}
export { s as default };
