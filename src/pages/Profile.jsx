// src/pages/Profile.jsx
import React from "react";
import { useSelector } from "react-redux";
import { auth } from "@/services/firebase.js";
import { signOut } from "firebase/auth";

export default function Profile() {
  const u = auth.currentUser;
  const dog = useSelector((s) => s.dog || {});

  async function logout() {
    try {
      await signOut(auth);
    } catch (e) {
      console.error("Logout failed:", e);
    }
    window.location.assign("/"); // hard reset
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8">
      <h1 className="text-3xl font-bold mb-6">Profile</h1>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* ACCOUNT CARD */}
        <div className="bg-zinc-900 p-6 rounded-xl shadow-xl space-y-4">
          <h2 className="text-xl font-semibold">Account</h2>

          {u ? (
            <>
              <div className="flex items-center gap-4">
                {u.photoURL && (
                  <img
                    src={u.photoURL}
                    alt="avatar"
                    className="w-14 h-14 rounded-full border border-zinc-700"
                  />
                )}

                <div>
                  <div className="font-semibold text-lg">
                    {u.displayName || "Anonymous User"}
                  </div>
                  <div className="text-sm text-zinc-400">{u.email}</div>
                </div>
              </div>

              <button
                onClick={logout}
                className="mt-4 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 font-semibold"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <p className="text-zinc-400">Not signed in.</p>
              <a
                href="/login"
                className="inline-block mt-3 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 font-semibold"
              >
                Go to Login
              </a>
            </>
          )}
        </div>

        {/* DOG SNAPSHOT CARD */}
        <div className="bg-zinc-900 p-6 rounded-xl shadow-xl space-y-4">
          <h2 className="text-xl font-semibold">Pup Snapshot</h2>

          <div className="text-sm text-zinc-400 space-y-1">
            <div>
              Name: <span className="font-semibold text-white">{dog.name || "—"}</span>
            </div>

            <div>
              Level: <span className="font-semibold text-white">{dog.level ?? "0"}</span>
            </div>

            <div>
              Coins: <span className="font-semibold text-white">{dog.coins ?? 0}</span>
            </div>

            <div>
              Potty Level:{" "}
              <span className="font-semibold text-white">{dog.pottyLevel ?? 0}%</span>{" "}
              {dog.isPottyTrained && <span className="text-emerald-400">(trained)</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
