import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { Provider, useDispatch } from "react-redux";
import { store } from "./redux/store.js";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase.js";
import { setUser } from "./redux/userSlice.js";

function AuthProvider({ children }) {
  const dispatch = useDispatch();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      dispatch(setUser(user ? { uid: user.uid, email: user.email } : null));
    });
    return unsubscribe;
  }, [dispatch]);
  return children;
}

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <Provider store={store}>
    <AuthProvider>
      <App />
      </AuthProvider>
  </Provider>
);