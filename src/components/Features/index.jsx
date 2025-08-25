// src/index.jsx
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

// Redux
import { Provider, useDispatch } from "react-redux";
import { store } from "./redux/store.js";

// Router
import { BrowserRouter } from "react-router-dom";

// Firebase Auth
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase.js";
import { setUser as loginSuccess, clearUser as logout } from "./redux/userSlice.js";

// Head tags
import { HelmetProvider } from "react-helmet-async";

// Use Vite envs: BASE_URL is set from vite.config.base (e.g. '/doggerz/' on GH Pages)
const base = (import.meta.env.BASE_URL || "/").replace(/\/+$/, "") || "/";

function AuthListener({ children }) {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);

  // Track Firebase auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        dispatch(
          loginSuccess({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName ?? "",
            photoURL: user.photoURL ?? null,
            provider: user.providerData?.[0]?.providerId ?? null,
          })
        );
      } else {
        dispatch(logout());
      }
      setLoading(false);
    });
    return () => unsub();
  }, [dispatch]);

  // Unlock a shared WebAudio context on first user interaction
  const DOGGERZ_AUDIO_CTX_KEY = Symbol.for("doggerz.audioContext");
  useEffect(() => {
    const unlock = () => {
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (AC) {
          if (!window[DOGGERZ_AUDIO_CTX_KEY]) window[DOGGERZ_AUDIO_CTX_KEY] = new AC();
          const ctx = window[DOGGERZ_AUDIO_CTX_KEY];
          if (ctx.state === "suspended") ctx.resume();
        }
      } catch (err) {
        console.error("Web Audio unlock failed:", err);
      } finally {
        window.removeEventListener("pointerdown", unlock);
      }
    };
    window.addEventListener("pointerdown", unlock, { once: true });
  }, []);

  if (loading) {
    return (
      <div style={{ color: "#fff", textAlign: "center", marginTop: 40, fontSize: 20 }}>
        🐾 Loading Doggerz…
      </div>
    );
  }
  return <>{children}</>;
}

export function renderApp() {
  const rootEl = document.getElementById("root");
  if (!rootEl) throw new Error("Missing #root element in index.html");

  ReactDOM.createRoot(rootEl).render(
    <React.StrictMode>
      <Provider store={store}>
        <BrowserRouter basename={base}>
          <HelmetProvider>
            <AuthListener>
              <App />
            </AuthListener>
          </HelmetProvider>
        </BrowserRouter>
      </Provider>
    </React.StrictMode>
  );
}
