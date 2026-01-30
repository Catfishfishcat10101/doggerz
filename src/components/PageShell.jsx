// src/components/PageShell.jsx
import * as React from "react";
import Header from "@/components/Header.jsx";
import Footer from "@/components/Footer.jsx";
import BackPill from "@/components/BackPill.jsx";
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
 * @property {string} [title]
 * @property {string} [subtitle]
 * @property {string} [eyebrow]
 * @property {import('react').ReactNode} [actions]
 * @property {string} [headerClassName]
 * @property {"left"|"center"} [headerAlign]
 * @property {boolean} [showBack]
 * @property {string} [backTo]
 * @property {string} [backLabel]
 * @property {string} [backFallbackTo]
 * @property {"dark"|"light"|"emerald"} [backTone]
 * @property {"sm"|"md"|"lg"} [backSize]
 * @property {import('react').ReactNode} [topSlot]
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
  title,
  subtitle,
  eyebrow,
  actions,
  headerClassName = "",
  headerAlign = "left",
  showBack = false,
  backTo,
  backLabel = "Back",
  backFallbackTo = "/",
  backTone = "dark",
  backSize = "sm",
  topSlot = null,
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

  const showPageHeader = Boolean(
    title || subtitle || eyebrow || actions || showBack || topSlot
  );

  const headerAlignClass =
    headerAlign === "center"
      ? "items-center text-center"
      : "items-start text-left";

  const resolvedShowHeader =
    typeof showHeader === "boolean" ? showHeader : !withinAppShell;
  const resolvedShowFooter =
    typeof showFooter === "boolean" ? showFooter : !withinAppShell;

  return (
    <div
      className={`relative ${withinAppShell ? "" : "min-h-[100dvh] min-h-screen"} ${className}`}
      style={shellStyle}
    >
      {!resolvedDisableBackground ? (
        <>
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(16,185,129,0.18),transparent_55%)]" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,rgba(56,189,248,0.12),transparent_45%)]" />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.1),rgba(0,0,0,0.4))]" />
        </>
      ) : null}

      {resolvedShowHeader ? <Header /> : null}

      <main className={mainCls}>
        <div className={containerCls}>
          {showPageHeader ? (
            <section
              className={`mb-6 flex flex-col gap-4 ${headerAlignClass} ${headerClassName}`.trim()}
            >
              <div className="flex w-full flex-wrap items-center justify-between gap-3">
                <div className={`flex flex-col gap-2 ${headerAlignClass}`}>
                  {eyebrow ? (
                    <div className="text-xs uppercase tracking-[0.22em] text-zinc-400">
                      {eyebrow}
                    </div>
                  ) : null}
                  {title ? (
                    <h1 className="text-3xl font-black tracking-tight text-zinc-100">
                      {title}
                    </h1>
                  ) : null}
                  {subtitle ? (
                    <p className="text-sm text-zinc-400 max-w-2xl">
                      {subtitle}
                    </p>
                  ) : null}
                </div>

                <div className="flex items-center gap-2">
                  {actions}
                  {showBack ? (
                    <BackPill
                      to={backTo}
                      fallbackTo={backFallbackTo}
                      label={backLabel}
                      tone={backTone}
                      size={backSize}
                    />
                  ) : null}
                </div>
              </div>

              {topSlot ? <div className="w-full">{topSlot}</div> : null}
            </section>
          ) : null}

          {children}
        </div>
      </main>

      {resolvedShowFooter ? <Footer /> : null}
    </div>
  );
}
