import React, { useEffect } from "react";
import { HelmetProvider } from "react-helmet-async";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useDispatch, useSelector } from "react-redux";
import { setUser, clearUser } from "./redux/userSlice";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Auth/Login";
import Signup from "./components/Auth/Signup";
import MainGame from "./components/UI/MainGame";
import Splash from "./components/UI/Splash";

function App() {
  const loggedIn = useSelector((state) => state.user.loggedIn);
  const dispatch = useDispatch();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        dispatch(setUser({ uid: user.uid, email: user.email }));
      } else {
        dispatch(clearUser());
      }
    });

    return () => unsubscribe();
  }, [dispatch]);

  return (
    <Routes>
      {/* Redirect from root to splash */}
      <Route index element={<Navigate to="/doggerz" replace />} />

      {/* Public routes */}
      <Route path="/doggerz" element={<Splash />} />
      <Route path="/doggerz/login" element={<Login />} />
      <Route path="/doggerz/signup" element={<Signup />} />

      {/* Protected route */}
      <Route
        path="/doggerz/game"
        element={
          loggedIn ? <MainGame /> : <Navigate to="/doggerz/login" replace />
        }
      />

      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/doggerz" replace />} />
    </Routes>
  );
}

export default App;
