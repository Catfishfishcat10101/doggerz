// src/components/DebugFirebase.jsx
import React from "react";
import { auth } from "@/firebase";
import { isEmulator } from "@/firebase";

export default function DebugFirebase() {
  const cfg = {
    VITE_FB_PROJECT_ID: import.meta.env.VITE_FB_PROJECT_ID,
    VITE_USE_FIREBASE_EMULATOR: String(import.meta.env.VITE_USE_FIREBASE_EMULATOR),
    host: typeof window !== "undefined" ? window.location.host : "n/a",
    isEmulator,
    currentUser: auth.currentUser ? {
      uid: auth.currentUser.uid,
      email: auth.currentUser.email
    } : null
  };

  return (
    <pre className="p-4 m-4 rounded-xl bg-black/80 text-white text-xs overflow-auto">
      {JSON.stringify(cfg, null, 2)}
    </pre>
  );
}
