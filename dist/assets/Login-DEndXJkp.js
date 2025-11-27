import { a as m, r as o, j as e, P as u, L as p } from "./index-ClZwlZUg.js";
function g() {
  const n = m(),
    [s, l] = o.useState(""),
    [r, c] = o.useState(""),
    [i, t] = o.useState(""),
    d = (a) => {
      if ((a.preventDefault(), !s || !r)) {
        t("Please enter both email and password.");
        return;
      }
      if ((t(""), s !== "demo@doggerz.com" || r !== "demo")) {
        t("Invalid credentials. Try again or sign up.");
        return;
      }
      n("/game");
    };
  return e.jsx(u, {
    title: "Welcome back",
    subtitle: "Log in to continue caring, protect streaks & sync your pup.",
    metaDescription:
      "Doggerz login: access your virtual pup, continue care streaks, sync progress across devices.",
    padding: "px-4 py-10",
    children: e.jsxs("form", {
      onSubmit: d,
      className: "space-y-4 max-w-md",
      "aria-label": "Login form",
      "aria-describedby": "login-error",
      children: [
        e.jsxs("div", {
          className: "space-y-2",
          children: [
            e.jsx("label", {
              htmlFor: "email",
              className: "block text-sm font-medium text-zinc-200",
              children: "Email",
            }),
            e.jsx("input", {
              id: "email",
              name: "email",
              type: "email",
              autoComplete: "email",
              value: s,
              onChange: (a) => l(a.target.value),
              className:
                "w-full rounded-md bg-zinc-950 border border-zinc-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500",
              placeholder: "you@example.com",
              "aria-required": "true",
            }),
          ],
        }),
        e.jsxs("div", {
          className: "space-y-2",
          children: [
            e.jsx("label", {
              htmlFor: "password",
              className: "block text-sm font-medium text-zinc-200",
              children: "Password",
            }),
            e.jsx("input", {
              id: "password",
              name: "password",
              type: "password",
              autoComplete: "current-password",
              value: r,
              onChange: (a) => c(a.target.value),
              className:
                "w-full rounded-md bg-zinc-950 border border-zinc-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500",
              "aria-required": "true",
            }),
          ],
        }),
        i &&
          e.jsx("div", {
            id: "login-error",
            className: "text-xs text-red-400 text-center",
            role: "alert",
            "aria-live": "assertive",
            children: i,
          }),
        e.jsx("button", {
          type: "submit",
          className:
            "w-full rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-sm py-2.5 transition",
          "aria-label": "Log in",
          children: "Log in",
        }),
        e.jsxs("p", {
          className: "text-xs text-zinc-400 text-center",
          children: [
            "No account yet?",
            " ",
            e.jsx(p, {
              to: "/signup",
              className: "text-emerald-400 hover:text-emerald-300",
              children: "Create one",
            }),
            ".",
          ],
        }),
      ],
    }),
  });
}
export { g as default };
