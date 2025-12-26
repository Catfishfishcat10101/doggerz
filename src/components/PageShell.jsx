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
}) {
  return (
    <div
      className={`min-h-dvh ${className}`}
      style={{
        background:
          "var(--grad-shell, radial-gradient(circle at top, #1e293b 0, #020617 55%, #000 100%))",
        color: "var(--text-main, #e5e7eb)",
      }}
    >
      {showHeader ? <Header /> : null}

      <main className={mainClassName || "px-4 py-10"}>
        <div className="mx-auto w-full max-w-6xl">{children}</div>
      </main>

      {showFooter ? <Footer /> : null}
    </div>
  );
}
