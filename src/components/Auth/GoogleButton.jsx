// src/components/Auth/GoogleButton.jsx
import React, { useState } from "react";
import { auth } from "@/lib/firebase";
import { GoogleAuthProvider, signInWithPopup, signInWithRedirect } from "firebase/auth";

export default function GoogleButton() {
  const [err, setErr] = useState(null);
  async function login() {
    setErr(null);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    try {
      await signInWithPopup(auth, provider);
    } catch (e) {
      // fallback when popup is blocked or cannot close
      try {
        await signInWithRedirect(auth, provider);
      } catch (e2) {
        setErr(e2?.code || e2?.message || "Login failed");
        console.error(e2);
      }
    }
  }
  return (
    <div className="space-y-2">
      <button onClick={login} className="rounded-lg bg-white text-black px-4 py-2 hover:bg-neutral-200">
        Continue with Google
      </button>
      {err && <div className="text-sm text-red-400">{String(err)}</div>}
    </div>
  );
}
