import { a as p, r as s, j as e, P as x, L as g } from "./index-ClZwlZUg.js";
function f() {
  const o = p(),
    [t, c] = s.useState(""),
    [l, d] = s.useState(""),
    [i, u] = s.useState(""),
    [n, r] = s.useState(""),
    m = (a) => {
      if ((a.preventDefault(), !t || !l || !i)) {
        r("Please fill out all fields.");
        return;
      }
      if ((r(""), t === "taken@doggerz.com")) {
        r("Email already in use. Try logging in.");
        return;
      }
      o("/adopt");
    };
  return e.jsx(x, {
    title: "Create your account",
    subtitle: "Sync your pup, streaks & coins across devices.",
    metaDescription:
      "Doggerz signup: create account to sync your virtual dog, care streaks, and progress.",
    padding: "px-4 py-10",
    children: e.jsxs("form", {
      onSubmit: m,
      className: "space-y-4 max-w-md",
      "aria-label": "Signup form",
      "aria-describedby": "signup-error",
      children: [
        e.jsxs("div", {
          className: "space-y-2",
          children: [
            e.jsx("label", {
              htmlFor: "displayName",
              className: "block text-sm font-medium text-zinc-200",
              children: "Display name",
            }),
            e.jsx("input", {
              id: "displayName",
              type: "text",
              value: l,
              onChange: (a) => d(a.target.value),
              maxLength: 32,
              className:
                "w-full rounded-md bg-zinc-950 border border-zinc-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500",
              placeholder: "William",
              "aria-required": "true",
            }),
          ],
        }),
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
              type: "email",
              autoComplete: "email",
              value: t,
              onChange: (a) => c(a.target.value),
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
              type: "password",
              autoComplete: "new-password",
              value: i,
              onChange: (a) => u(a.target.value),
              className:
                "w-full rounded-md bg-zinc-950 border border-zinc-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500",
              "aria-required": "true",
            }),
          ],
        }),
        n &&
          e.jsx("div", {
            id: "signup-error",
            className: "text-xs text-red-400 text-center",
            role: "alert",
            "aria-live": "assertive",
            children: n,
          }),
        e.jsx("button", {
          type: "submit",
          className:
            "w-full rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-sm py-2.5 transition",
          "aria-label": "Sign up",
          children: "Sign up",
        }),
        e.jsxs("p", {
          className: "text-xs text-zinc-200 text-center",
          children: [
            "Already have an account?",
            " ",
            e.jsx(g, {
              to: "/login",
              className: "text-emerald-400 hover:text-emerald-300",
              children: "Log in",
            }),
            ".",
          ],
        }),
      ],
    }),
  });
}
export { f as default };
