import { a as d, u as x, j as e, P as c } from "./index-ClZwlZUg.js";
import { s as p } from "./dogSlice-VptOyUWJ.js";
function u(a) {
  const t = Math.round(Number(a ?? 0));
  return t >= 100
    ? "Fully potty trained. Indoor accidents are very rare."
    : t >= 75
      ? "Mostly trained with occasional accidents on stressful days."
      : t >= 50
        ? "Getting the hang of it. Keep taking them out after meals and naps."
        : t > 0
          ? "Just starting out. Short, frequent potty breaks work best."
          : "Not potty trained yet. Expect frequent accidents until a routine forms.";
}
function g() {
  const a = d(),
    t = x(p);
  if (!t)
    return e.jsx(c, {
      title: "No pup yet",
      subtitle: "Adopt a Doggerz pup before you can track potty training.",
      children: e.jsxs("div", {
        className: "space-y-4 max-w-lg",
        children: [
          e.jsx("p", {
            className: "text-sm text-zinc-300",
            children: "You need a Doggerz pup before you can potty train them.",
          }),
          e.jsx("button", {
            type: "button",
            onClick: () => a("/adopt"),
            className:
              "rounded-full bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-semibold px-5 py-2.5 transition",
            children: "Adopt your pup",
          }),
        ],
      }),
    });
  const s = t.potty || {},
    n = Math.round(Number(s.training ?? 0)),
    l = s.totalAccidents ?? s.accidents ?? 0,
    i = s.lastSuccessAt ? new Date(s.lastSuccessAt) : null,
    r = s.lastAccidentAt ? new Date(s.lastAccidentAt) : null,
    o = u(n);
  return e.jsxs(c, {
    title: `Potty plan for ${t.name || "your pup"}`,
    subtitle:
      "Doggerz tracks potty progress when you take them out at optimal times.",
    metaDescription:
      "Doggerz potty training status: progress, accidents, and last successful outdoor trips for your virtual pup.",
    padding: "px-4 py-6",
    className: "text-zinc-50",
    children: [
      e.jsxs("section", {
        className:
          "rounded-2xl border border-zinc-800 bg-zinc-950/80 p-4 space-y-4 shadow-lg shadow-black/40",
        "aria-labelledby": "potty-status-heading",
        children: [
          e.jsxs("div", {
            className:
              "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3",
            children: [
              e.jsxs("div", {
                children: [
                  e.jsx("p", {
                    id: "potty-status-heading",
                    className: "text-xs font-semibold text-zinc-100",
                    children: "Current training level",
                  }),
                  e.jsxs("p", {
                    className: "text-sm text-zinc-300",
                    children: [n, "% potty trained"],
                  }),
                ],
              }),
              e.jsx("div", {
                className:
                  "w-full sm:w-64 h-2 rounded-full bg-zinc-800 overflow-hidden",
                role: "progressbar",
                "aria-valuenow": n,
                "aria-valuemin": 0,
                "aria-valuemax": 100,
                "aria-label": "Potty training progress",
                children: e.jsx("div", {
                  className:
                    "h-full rounded-full bg-emerald-500 transition-[width]",
                  style: { width: `${Math.max(0, Math.min(100, n))}%` },
                }),
              }),
            ],
          }),
          e.jsx("p", { className: "text-xs text-zinc-200", children: o }),
          e.jsxs("div", {
            className: "grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs",
            "aria-label": "Potty training stats",
            children: [
              e.jsxs("div", {
                className:
                  "rounded-xl border border-zinc-800 bg-zinc-900/80 p-3 space-y-1",
                children: [
                  e.jsx("p", {
                    className: "text-[11px] font-semibold text-zinc-200",
                    children: "Total accidents",
                  }),
                  e.jsx("p", {
                    className: "text-lg font-semibold text-rose-300",
                    "aria-live": "polite",
                    children: l,
                  }),
                  e.jsx("p", {
                    className: "text-[11px] text-zinc-200",
                    children: "Each indoor accident slows training a bit.",
                  }),
                ],
              }),
              e.jsxs("div", {
                className:
                  "rounded-xl border border-zinc-800 bg-zinc-900/80 p-3 space-y-1",
                children: [
                  e.jsx("p", {
                    className: "text-[11px] font-semibold text-zinc-200",
                    children: "Last successful potty",
                  }),
                  e.jsx("p", {
                    className: "text-xs text-zinc-300",
                    children: i
                      ? i.toLocaleString()
                      : "No logged potty trips yet.",
                  }),
                  e.jsx("p", {
                    className: "text-[11px] text-zinc-200",
                    children: "Regular outdoor potty trips speed training.",
                  }),
                ],
              }),
              e.jsxs("div", {
                className:
                  "rounded-xl border border-zinc-800 bg-zinc-900/80 p-3 space-y-1",
                children: [
                  e.jsx("p", {
                    className: "text-[11px] font-semibold text-zinc-200",
                    children: "Last accident",
                  }),
                  e.jsx("p", {
                    className: "text-xs text-zinc-300",
                    children: r
                      ? r.toLocaleString()
                      : "No accidents recorded yet.",
                  }),
                  e.jsx("p", {
                    className: "text-[11px] text-zinc-200",
                    children:
                      "Consistent schedule & quick cleanups prevent repeats.",
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
      e.jsxs("section", {
        className:
          "rounded-2xl border border-zinc-800 bg-zinc-950/80 p-4 space-y-3",
        "aria-label": "Training routine tips",
        children: [
          e.jsx("p", {
            className: "text-xs font-semibold text-zinc-100",
            children: "Training routine tips",
          }),
          e.jsxs("ul", {
            className: "list-disc list-inside text-xs text-zinc-300 space-y-1",
            children: [
              e.jsxs("li", {
                children: [
                  "Take your pup out ",
                  e.jsx("span", {
                    className: "font-semibold",
                    children: "right after",
                  }),
                  " ",
                  "feeding, play, and naps.",
                ],
              }),
              e.jsx("li", {
                children:
                  "Use the Potty Walk button on the main screen when they successfully go outside.",
              }),
              e.jsx("li", {
                children:
                  "Keep a consistent schedule; irregular times slow learning.",
              }),
              e.jsx("li", {
                children:
                  "Never punish accidents; clean up & give more chances outside.",
              }),
            ],
          }),
        ],
      }),
      e.jsx("button", {
        type: "button",
        onClick: () => a("/game"),
        className:
          "text-xs text-emerald-400 hover:text-emerald-300 underline underline-offset-4",
        children: "← Back to your yard",
      }),
    ],
  });
}
export { g as default };
