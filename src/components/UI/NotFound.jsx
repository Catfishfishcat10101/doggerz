import React from "react";
export default function NotFound() {
  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
      <div style={{ textAlign: "center" }}>
        <h1 style={{ margin: 0, fontSize: 48 }}>404</h1>
        <p style={{ opacity: 0.8 }}>That page doesn't exist.</p>
      </div>
    </div>
  );
}
