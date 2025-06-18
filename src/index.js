<<<<<<< HEAD
import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { Provider, useDispatch } from "react-redux";
import { store } from "./redux/store.js";
=======
// src/index.js
import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { Provider, useDispatch } from "react-redux";
import store from "./redux/store.js";
>>>>>>> 3b2685a460845831f4c51ffea0278b9ada898d58
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase.js";
import { setUser } from "./redux/userSlice.js";

<<<<<<< HEAD
function AuthProvider({ children }) {
  const dispatch = useDispatch();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      dispatch(setUser(user ? { uid: user.uid, email: user.email } : null));
    });
    return unsubscribe;
  }, [dispatch]);
=======
function AuthListener({ children }) {
  const dispatch = useDispatch();
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      // push a minimal user object (or null) into your Redux slice
      dispatch(setUser(user ? { uid: user.uid, email: user.email } : null));
    });
    return unsubscribe; // clean up listener on unmount
  }, [dispatch]);

>>>>>>> 3b2685a460845831f4c51ffea0278b9ada898d58
  return children;
}

const root = ReactDOM.createRoot(document.getElementById("root"));
<<<<<<< HEAD

root.render(
  <Provider store={store}>
    <AuthProvider>
      <App />
      </AuthProvider>
  </Provider>
);
=======
root.render(
  <Provider store={store}>
    <AuthListener>
      <App />
    </AuthListener>
  </Provider>
);
>>>>>>> 3b2685a460845831f4c51ffea0278b9ada898d58
