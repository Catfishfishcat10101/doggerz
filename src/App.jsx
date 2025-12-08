// src/App.jsx
import "./App.css";
import { Outlet } from "react-router-dom";

export default function App() {
  return (
    <div className="app-root">
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
