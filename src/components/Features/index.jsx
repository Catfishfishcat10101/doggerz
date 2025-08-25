import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

// Redux
import { Provider, useDispatch } from "react-redux";
import { store } from "./redux/store.js";

// React Router
import { BrowserRouter } from "react-router-dom";

// Firebase Auth
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase.js";
// Alias existing actions from your userSlice
import { setUser as loginSuccess, clearUser as logout } from "./redux/userSlice.js";

// Helmet for <head> tags
import { HelmetProvider } from "react-helmet-async";

// Compute base at module scope so it's available during render
const base =
  process.env.NODE_ENV === "production"
    ? process.env.PUBLIC_URL || "/doggerz"
    : "/";

// Auth state manager component
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

  // Unlock Web Audio context after first user interaction (single shared context)
  // Symbol key for storing the shared AudioContext on the window object to avoid naming collisions.
  const DOGGERZ_AUDIO_CTX_KEY = Symbol.for("doggerz.audioContext");

  useEffect(() => {
    const unlock = () => {
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (AC) {
          // Store the shared AudioContext using a Symbol to avoid global namespace pollution.
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

  // Loading screen while checking auth state
  if (loading) {
    return (
      <div style={{ color: "#fff", textAlign: "center", marginTop: 40, fontSize: 20 }}>
        🐾 Loading Doggerz…
      </div>
    );
  }

  // When not loading, render children
  return <>{children}</>;
}

// App rendering
export function renderApp() {
  ReactDOM.createRoot(document.getElementById("root")).render(
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

renderApp();