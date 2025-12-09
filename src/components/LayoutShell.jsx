import React from "react";
import TopBar from "./TopBar";

export default function LayoutShell({ children }) {
  return (
    <div className="app-shell">
      <TopBar />
      <main className="content">{children}</main>
      <footer className="text-center py-4 text-sm text-slate-500">
        © Doggerz
      </footer>
    </div>
  );
}
