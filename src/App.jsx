// src/App.jsx
import { useEffect } from "react";
import AppRouter from "./AppRouter.jsx";

export default function App() {
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.appMounted = "1";
    return () => {
      delete root.dataset.appMounted;
    };
  }, []);

  return (
    <div className="min-h-dvh bg-zinc-950 text-zinc-100">
      <AppRouter />
    </div>
  );
}
