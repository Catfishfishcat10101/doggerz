import { j as e, P as t } from "./index-ClZwlZUg.js";
function s() {
  return e.jsx(t, {
    title: "Contact",
    subtitle: "Feedback, bug reports & feature ideas keep Doggerz improving.",
    metaDescription:
      "Contact Doggerz developer: send feedback, bug reports, feature suggestions via email.",
    padding: "px-4 py-10",
    children: e.jsxs("section", {
      className:
        "rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5 space-y-4 text-sm text-zinc-300",
      "aria-label": "Contact instructions",
      children: [
        e.jsx("p", {
          children:
            "Email is fastest. Include what you were doing, what happened, and what you expected. Screenshots or short clips help reproduce issues quickly.",
        }),
        e.jsx("a", {
          href: "mailto:catfishfishcat10101@gmail.com?subject=Doggerz%20Feedback",
          className:
            "inline-flex items-center justify-center rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400 transition",
          children: "Email the developer",
        }),
        e.jsx("p", {
          className: "text-xs text-zinc-300",
          "aria-live": "polite",
          children: "Avoid sharing sensitive personal information.",
        }),
      ],
    }),
  });
}
export { s as default };
