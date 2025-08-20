import React, { useEffect, useState } from "react";
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
import NavBar from "./components/UI/NavBar";

function ProtectedRoute({ children }) {
  const loggedIn = useSelector((s) => s.user.loggedIn);
  return loggedIn ? children : <Navigate to="/doggerz/login" replace />;
}

export default function App() {
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) dispatch(setUser({ uid: user.uid, email: user.email }));
      else dispatch(clearUser());
      setLoading(false);
    });
    return unsub;
  }, [dispatch]);

  if (loading) return <div style={{ color: "#fff", padding: "2rem" }}>Loading…</div>;

  return (
    <HelmetProvider>
      <NavBar />
      <Routes>
        <Route index element={<Navigate to="/doggerz" replace />} />
        <Route path="/doggerz" element={<Splash />} />
        <Route path="/doggerz/login" element={<Login />} />
        <Route path="/doggerz/signup" element={<Signup />} />
        <Route path="/doggerz/game" element={
          <ProtectedRoute><MainGame /></ProtectedRoute>
        }/>
        <Route path="*" element={<Navigate to="/doggerz" replace />} />
      </Routes>
    </HelmetProvider>
  );
}