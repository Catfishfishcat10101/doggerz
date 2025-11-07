import React from "react";
import { auth } from "../utils/firebase";
import { signOut } from "firebase/auth";
import { useSelector } from "react-redux";

export default function Profile() {
  const u = auth.currentUser;
  const dog = useSelector((s) => s.dog);

  async function logout() {
    try { await signOut(auth); } catch {}
    window.location.assign("/"); // hard reset
  }

  return (
    <div className="container py-6 text-white">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card">
          <h2 className="text-xl font-semibold">Account</h2>
          {u ? (
            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-3">
                {u.photoURL && <img src={u.photoURL} alt="" className="w-12 h-12 rounded-full" />}
                <div>
                  <div className="font-semibold">{u.displayName || "Anonymous"}</div>
                  <div className="text-sm opacity-70">{u.email}</div>
                </div>
              </div>
              <div className="mt-4">
                <button className="btn btn--warn" onClick={logout}>Sign out</button>
              </div>
            </div>
          ) : (
            <div className="mt-3">
              <div className="opacity-70">Not signed in.</div>
              <a href="/login" className="btn mt-3 inline-flex">Go to Login</a>
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold">Pup Snapshot</h2>
          <div className="mt-3 text-sm opacity-80">
            Name: <b>{dog.name}</b><br />
            Level: <b>{dog.level}</b><br />
            Coins: <b>{dog.coins}</b><br />
            Potty: <b>{dog.pottyLevel}%</b> {dog.isPottyTrained ? "(trained)" : ""}
          </div>
        </div>
      </div>
    </div>
  );
}