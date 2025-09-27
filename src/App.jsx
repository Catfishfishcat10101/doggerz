// src/App.jsx
import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { userAuthed, userLoggedOut } from "@/redux/userSlice";
import { setDogName } from "@/redux/dogSlice";

import Splash from "@/components/UI/Splash.jsx";
import Login from "@/components/Auth/Login.jsx";
import Signup from "@/components/Auth/Signup.jsx";
import NewPup from "@/components/Setup/NewPup.jsx";
import GameScreen from "@/components/UI/GameScreen.jsx";

function Protected({ children }) {
  const token = auth.currentUser;
  return token ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const [booted, setBooted] = useState(false);
  const dispatch = useDispatch();
  const nav = useNavigate();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        dispatch(userLoggedOut());
        setBooted(true);
        return;
      }
      dispatch(userAuthed({ uid: user.uid, email: user.email, displayName: user.displayName }));
      // Pull dog profile
      const snap = await getDoc(doc(db, "dogs", user.uid));
      if (snap.exists()) {
        const { name } = snap.data();
        if (name) dispatch(setDogName(name));
      }
      setBooted(true);
    });
    return () => unsub();
  }, [dispatch]);

  if (!booted) return <div className="p-6 text-center">Booting…</div>;

  return (
    <Routes>
      <Route path="/" element={<Splash />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/setup" element={<Protected><NewPup /></Protected>} />
      <Route path="/game" element={<Protected><GameScreen /></Protected>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
