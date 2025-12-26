// src/components/PageShell.jsx

import * as React from "react";
import Header from "@/components/Header.jsx";
import Footer from "@/components/Footer.jsx";

export default function PageShell({
  children,
  className = "",
  mainClassName = "",
  showHeader = true,
  showFooter = true,
  style,
  constrainWidth = true,
}) {
  const baseStyle = {
    color: "var(--text-main, #e5e7eb)",
  };

  // If a caller provides a background/backgroundImage, don't override it.
  const hasCustomBackground =
    style && ("background" in style || "backgroundImage" in style);

  if (!hasCustomBackground) {
    baseStyle.background =
      "var(--grad-shell, radial-gradient(circle at top, #1e293b 0, #020617 55%, #000 100%))";
  }

  return (
    <div
      className={`min-h-dvh ${className}`}
      style={{ ...baseStyle, ...(style || {}) }}
    >
      {showHeader ? <Header /> : null}

      <main className={mainClassName || "px-4 py-10"}>
        {constrainWidth ? (
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        ) : (
          children
        )}
      </main>

      {showFooter ? <Footer /> : null}
    </div>
  );
}
