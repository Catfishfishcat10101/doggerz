// src/index.js
import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { Provider, useDispatch } from "react-redux";
import store from "./redux/store";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import { setUser } from "./redux/userSlice";

function AuthListener({ children }) {
  const dispatch = useDispatch();
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      // push a minimal user object (or null) into your Redux slice
      dispatch(setUser(user ? { uid: user.uid, email: user.email } : null));
    });
    return unsubscribe; // clean up listener on unmount
  }, [dispatch]);

  return children;
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <Provider store={store}>
    <AuthListener>
      <App />
    </AuthListener>
  </Provider>
);
