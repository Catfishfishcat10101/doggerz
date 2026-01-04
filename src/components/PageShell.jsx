// src/components/PageShell.jsx
import * as React from "react";
import Header from "@/components/Header.jsx";
import Footer from "@/components/Footer.jsx";
import { AppShellContext } from "@/layout/AppShellContext.js";

export default function PageShell({
  children,
  className = "",
  mainClassName = "",
  containerClassName = "",
  showHeader,
  showFooter,
  fullBleed = false,
  disableBackground = false,
  style,
}) {
  const shellStyle = {
    color: "var(--text-main, #e5e7eb)",
    ...(disableBackground
      ? {}
      : {
        background:
          "var(--grad-shell, radial-gradient(circle at top, #1e293b 0, #020617 55%, #000 100%))",
      }),
    ...(style || {}),
  };

  const mainCls = fullBleed ? (mainClassName || "p-0") : (mainClassName || "px-4 py-10");
  const containerCls = fullBleed
    ? (containerClassName || "w-full")
    : (containerClassName || "mx-auto w-full max-w-6xl");

  const appShell = React.useContext(AppShellContext);
  const resolvedShowHeader =
    typeof showHeader === "boolean" ? showHeader : !appShell?.withinAppShell;
  const resolvedShowFooter = typeof showFooter === "boolean" ? showFooter : true;

  return (
    <div className={`min-h-[100dvh] min-h-screen ${className}`} style={shellStyle}>
      {resolvedShowHeader ? <Header /> : null}

      <main className={mainCls}>
        <div className={containerCls}>{children}</div>
      </main>

      {resolvedShowFooter ? <Footer /> : null}
    </div>
  );
}
