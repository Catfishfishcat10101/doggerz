// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";

const rootElement = document.getElementById("root");

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#020617",
        color: "#f9fafb",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <h1 style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>Doggerz test</h1>
      <p>If you can read this, React is rendering correctly.</p>
    </div>
  </React.StrictMode>
);