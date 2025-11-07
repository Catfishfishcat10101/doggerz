import React from "react";
import { signOut } from "firebase/auth";
import { auth } from "@/utils/firebase";

export default function LogoutButton({ className = "" }) {
  return (
    <button
      onClick={() => signOut(auth)}
      className={`px-3 py-1 rounded bg-white/10 hover:bg-white/20 ${className}`}
    >
      Logout
    </button>
  );
}