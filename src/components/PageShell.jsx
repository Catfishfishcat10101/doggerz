// src/components/PageShell.jsx
import * as React from "react";
import Header from "@/components/Header.jsx";
import Footer from "@/components/Footer.jsx";
import { AppShellContext } from "@/layout/AppShellContext.js";

/**
 * @typedef {Object} PageShellProps
 * @property {any} children
 * @property {string} [className]
 * @property {string} [mainClassName]
 * @property {string} [containerClassName]
 * @property {boolean} [showHeader]
 * @property {boolean} [showFooter]
 * @property {boolean} [fullBleed]
 * @property {boolean} [disableBackground]
 * @property {import('react').CSSProperties} [style]
 */

/** @param {PageShellProps} props */
export default function PageShell({
  children,
  className = "",
  mainClassName = "",
  containerClassName = "",
  showHeader = undefined,
  showFooter = undefined,
  fullBleed = false,
  disableBackground = undefined,
  style = undefined,
}) {
  const appShell = React.useContext(AppShellContext);
  const withinAppShell = Boolean(appShell?.withinAppShell);

  const resolvedDisableBackground =
    typeof disableBackground === "boolean" ? disableBackground : withinAppShell;

  const shellStyle = {
    color: "var(--text-main, #e5e7eb)",
    ...(resolvedDisableBackground
      ? {}
      : {
          background:
            "var(--grad-shell, radial-gradient(circle at top, #1e293b 0, #020617 55%, #000 100%))",
        }),
    ...(style || {}),
  };

  const mainCls = fullBleed
    ? mainClassName || "p-0"
    : mainClassName || "px-4 py-10";
  const containerCls = fullBleed
    ? containerClassName || "w-full"
    : containerClassName || "mx-auto w-full max-w-6xl";

  const resolvedShowHeader =
    typeof showHeader === "boolean" ? showHeader : !withinAppShell;
  const resolvedShowFooter =
    typeof showFooter === "boolean" ? showFooter : !withinAppShell;

  return (
    <div
      className={`${withinAppShell ? "" : "min-h-[100dvh] min-h-screen"} ${className}`}
      style={shellStyle}
    >
      {resolvedShowHeader ? <Header /> : null}

      <main className={mainCls}>
        <div className={containerCls}>{children}</div>
      </main>

      {resolvedShowFooter ? <Footer /> : null}
    </div>
  );
}
