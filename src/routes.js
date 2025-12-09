import * as React from "react";

// Lazy-load the real MainGame (relative path ensures Vite resolves it)
const MainGame = React.lazy(() => import("./features/game/MainGame.jsx"));

// Simple placeholders built with createElement so this file stays valid .js (no JSX).
const AdoptPlaceholder = () =>
  React.createElement(
    "div",
    { className: "p-6 text-zinc-50" },
    React.createElement("h2", { className: "text-lg font-semibold" }, "Adopt"),
    React.createElement(
      "p",
      { className: "text-zinc-400" },
      "Adoption flow will appear here.",
    ),
  );

const simple = (text) =>
  React.createElement("div", { className: "p-6 text-zinc-50" }, text);

export const routes = [
  { path: "/", name: "Home", meta: { title: "Home" } },
  { path: "/adopt", name: "Adopt", meta: { title: "Adopt a Pup" } },
  { path: "/game", name: "Game", meta: { title: "Your Yard" } },
  { path: "/login", name: "Login", meta: { title: "Login" } },
  { path: "/signup", name: "Signup", meta: { title: "Sign up" } },
  { path: "/about", name: "About", meta: { title: "About Doggerz" } },
  { path: "/settings", name: "Settings", meta: { title: "Settings" } },
];

export default routes;
