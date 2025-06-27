import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

import { Provider, useDispatch } from "react-redux";
import { store } from "./redux/store.js";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase.js";
import { loginSuccess, logout } from "./redux/userSlice.js";

function AuthListener({ children }) {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("🔥 Firebase user:", user);
      if (user) {
        dispatch(loginSuccess({ uid: user.uid, email: user.email }));
      } else {
        dispatch(logout());
      }
      setLoading(false);
    });
    return unsubscribe;
  }, [dispatch]);

  if (loading) {
    return (
      <div className="text-white text-center mt-10">
        🐾 Loading Doggerz…
      </div>
    );
  }

  return children;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <AuthListener>
      <App />
    </AuthListener>
  </Provider>
);