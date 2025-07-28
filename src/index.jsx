// src/index.jsx
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
import { loginSuccess, logout } from "./redux/userSlice.js";

// Helmet for <head> tags
import { HelmetProvider } from "react-helmet-async";

// Auth state manager component
function AuthListener({ children }) {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);

  // Track Firebase auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        dispatch(loginSuccess({ uid: user.uid, email: user.email }));
      } else {
        dispatch(logout());
      }
      setLoading(false);
    });
    return unsub;
  }, [dispatch]);

  // Unlock Web Audio context after first user interaction
  useEffect(() => {
    const unlock = () => {
      try {
        if (AudioContext.prototype.state === "suspended") {
          new AudioContext().resume();
        }
      } catch (err) {
        console.error("Web Audio unlock failed:", err);
      }
      window.removeEventListener("pointerdown", unlock);
    };
    window.addEventListener("pointerdown", unlock, { once: true });
  }, []);

  // Display loading screen while checking auth state
  if (loading) {
    return (
      <div className="text-white text-center mt-10 text-xl">
        🐾 Loading Doggerz…
      </div>
    );
  }

  return children;
}

// Dynamic base path for routing (GitHub Pages support)
const base = process.env.NODE_ENV === "production" ? "/doggerz" : "/";

// App rendering
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter
        basename={base}
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <HelmetProvider>
          <AuthListener>
            <App />
          </AuthListener>
        </HelmetProvider>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
