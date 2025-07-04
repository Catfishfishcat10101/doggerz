// src/index.jsx
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { Provider, useDispatch } from "react-redux";
import { store } from "./redux/store.js";
import { BrowserRouter } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase.js";
import { loginSuccess, logout } from "./redux/userSlice.js";

function AuthListener({ children }) {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);

  /* track Firebase auth state */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      console.log("🔥 Firebase user:", user);
      user
        ? dispatch(loginSuccess({ uid: user.uid, email: user.email }))
        : dispatch(logout());
      setLoading(false);
    });
    return unsub;
  }, [dispatch]);

  /* unlock Web-Audio after first user interaction */
  useEffect(() => {
    const unlock = () => {
      try {
        if (AudioContext.prototype.state === "suspended") {
          new AudioContext().resume();
        }
      } catch {}
      window.removeEventListener("pointerdown", unlock);
    };
    window.addEventListener("pointerdown", unlock, { once: true });
  }, []);

  if (loading) {
    return (
      <div className="text-white text-center mt-10">🐾 Loading Doggerz…</div>
    );
  }

  return children;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <BrowserRouter basename="/doggerz">
      <AuthListener>
        <App />
      </AuthListener>
    </BrowserRouter>
  </Provider>,
);
