// src/components/PageShell.jsx

import * as React from "react";
import { AppShellContext } from "@/layout/AppShellContext.js";

export default function PageShell({
  children,
  className = "",
  mainClassName = "px-4 py-10",
  containerClassName = "w-full max-w-5xl mx-auto",
  disableBackground = false,
}) {
  const shell = React.useContext(AppShellContext);
  const withinShell = Boolean(shell?.withinAppShell);

  const bgClass = disableBackground ? "" : "bg-zinc-950 text-zinc-100";

  return (
    <section className={`relative ${bgClass} ${className}`.trim()}>
      <div className={mainClassName}>
        <div className={containerClassName}>
          {!withinShell ? (
            <div className="sr-only" aria-hidden="true">
              App shell disabled
            </div>
          ) : null}
          {children}
        </div>
      </div>
    </section>
  );
}
