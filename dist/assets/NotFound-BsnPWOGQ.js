import { a as o, j as e, P as n } from "./index-ClZwlZUg.js";
const a = { HOME: "/" };
function r() {
  const t = o();
  return e.jsx(n, {
    title: "Page not found",
    subtitle: "The route you tried doesn’t exist.",
    metaDescription:
      "Doggerz 404 page: route not found. Navigate back to home or previous screen.",
    padding: "px-6 py-16",
    children: e.jsxs("section", {
      className: "text-center space-y-4",
      "aria-labelledby": "notfound-title",
      children: [
        e.jsx("h2", {
          id: "notfound-title",
          className: "text-5xl font-extrabold text-emerald-400 tracking-tight",
          children: "404",
        }),
        e.jsx("p", {
          className: "text-sm text-zinc-200",
          children:
            "That path doesn't exist in Doggerz. Your pup wandered off the map.",
        }),
        e.jsxs("div", {
          className: "mt-6 flex items-center justify-center gap-3",
          children: [
            e.jsx("button", {
              type: "button",
              onClick: () => t(a.HOME),
              className: `px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400
                       text-black font-semibold transition-colors`,
              children: "Back to home",
            }),
            e.jsx("button", {
              type: "button",
              onClick: () => t(-1),
              className: `px-4 py-2 rounded-lg border border-zinc-600 text-zinc-100
                       hover:bg-zinc-800 font-semibold transition-colors`,
              children: "Go back",
            }),
          ],
        }),
      ],
    }),
  });
}
export { r as default };
