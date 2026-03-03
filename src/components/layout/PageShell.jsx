// src/components/PageShell.jsx

import * as React from "react";
import { AppShellContext } from "@/layout/AppShellContext.js";

export default function PageShell({
  children,
  className = "",
  mainClassName = "px-4 py-10",
  containerClassName = "w-full max-w-5xl mx-auto",
  disableBackground = false,
  useSurface = true,
}) {
  const shell = React.useContext(AppShellContext);
  const withinShell = Boolean(shell?.withinAppShell);

  const bgClass = disableBackground
    ? ""
    : "text-zinc-100 bg-[radial-gradient(circle_at_8%_2%,rgba(16,185,129,0.08),transparent_30%),radial-gradient(circle_at_92%_96%,rgba(56,189,248,0.1),transparent_34%)]";

  return (
    <section className={`relative ${bgClass} ${className}`.trim()}>
      <div className={mainClassName}>
        <div className={containerClassName}>
          {!withinShell ? (
            <div className="sr-only" aria-hidden="true">
              App shell disabled
            </div>
          ) : null}
          <div className={useSurface ? "neon-surface p-4 sm:p-6" : ""}>
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}
