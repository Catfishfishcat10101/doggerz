import { j as e, P as a } from "./index-ClZwlZUg.js";
function t() {
  const s = new Date().getFullYear();
  return e.jsxs(a, {
    title: "Legal, Terms & Privacy",
    subtitle: `High-level summary of Doggerz usage terms & data handling. Last updated: ${s}`,
    metaDescription:
      "Doggerz legal terms and privacy summary: data usage, third-party services, changes, responsibilities.",
    padding: "px-6 py-10",
    children: [
      e.jsxs("section", {
        className: "space-y-2 text-sm text-zinc-300",
        "aria-labelledby": "tos-heading",
        children: [
          e.jsx("h2", {
            id: "tos-heading",
            className: "font-semibold text-zinc-100 text-base",
            children: "1. Terms of Service",
          }),
          e.jsx("p", {
            children:
              "Doggerz is provided “as is” for entertainment. Uptime, features and balance may change. No guarantees of data retention.",
          }),
          e.jsxs("ul", {
            className: "list-disc list-inside space-y-1",
            children: [
              e.jsx("li", {
                children:
                  "No abuse, security attacks, or cheating impacting others.",
              }),
              e.jsx("li", {
                children:
                  "You are responsible for device, data usage & connectivity.",
              }),
              e.jsx("li", {
                children:
                  "Accounts violating terms/community standards may be suspended.",
              }),
            ],
          }),
        ],
      }),
      e.jsxs("section", {
        className: "space-y-2 text-sm text-zinc-300",
        "aria-labelledby": "privacy-heading",
        children: [
          e.jsx("h2", {
            id: "privacy-heading",
            className: "font-semibold text-zinc-100 text-base",
            children: "2. Privacy & Data",
          }),
          e.jsx("p", {
            children:
              "Firebase services handle auth and game state. Basic account details and pup progress sync across devices.",
          }),
          e.jsxs("ul", {
            className: "list-disc list-inside space-y-1",
            children: [
              e.jsx("li", {
                children: "Account data links your pup to your profile.",
              }),
              e.jsx("li", {
                children: "Game data stores stats & progression.",
              }),
              e.jsx("li", {
                children:
                  "Aggregated anonymized analytics may inform improvements.",
              }),
            ],
          }),
          e.jsx("p", {
            children:
              "Avoid entering sensitive personal info into free-text fields.",
          }),
        ],
      }),
      e.jsxs("section", {
        className: "space-y-2 text-sm text-zinc-300",
        "aria-labelledby": "third-party-heading",
        children: [
          e.jsx("h2", {
            id: "third-party-heading",
            className: "font-semibold text-zinc-100 text-base",
            children: "3. Third-party services",
          }),
          e.jsx("p", {
            children:
              "Using Doggerz implies agreement with provider terms (Firebase/Google, app stores). Their policies govern underlying data handling.",
          }),
        ],
      }),
      e.jsxs("section", {
        className: "space-y-2 text-sm text-zinc-300",
        "aria-labelledby": "changes-heading",
        children: [
          e.jsx("h2", {
            id: "changes-heading",
            className: "font-semibold text-zinc-100 text-base",
            children: "4. Changes",
          }),
          e.jsx("p", {
            children:
              "Terms & privacy may evolve. Significant updates will appear here & in release notes.",
          }),
        ],
      }),
      e.jsx("p", {
        className: "text-xs text-zinc-300",
        role: "note",
        children:
          "Informational summary only; obtain formal legal review for commercial release.",
      }),
    ],
  });
}
export { t as default };
