// src/components/Auth/LogoutButton.jsx
import React from "react";
import { auth } from "../../firebase";
import { signOut as fbSignOut } from "firebase/auth";

export default function LogoutButton() {
  const onLogout = async () => {
    try { await fbSignOut(auth); } catch {}
  };
  return (
    <button
      onClick={onLogout}
      className="px-3 py-2 text-sm rounded-xl bg-white shadow hover:shadow-md active:scale-95"
      title="Sign out"
    >
      ⎋ Logout
    </button>
  );
}
