// src/pages/Settings.jsx
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { selectUser } from "@/redux/userSlice.js";
import { auth } from "@/lib/firebase";
import { updateProfile, signOut, deleteUser } from "firebase/auth";
import { getSettings, saveSettings, applySettings } from "@/lib/settings";

export default function Settings() {
  const user = useSelector(selectUser);
  const [s, setS] = useState(() => getSettings());

  // Apply live when toggled
  useEffect(() => {
    applySettings(s);
    saveSettings(s);
  }, [s]);

  const set = (k, v) => setS((prev) => ({ ...prev, [k]: v }));

  async function onChangeName() {
    const name = window.prompt("Display name", user?.displayName || "");
    if (!name || !auth.currentUser) return;
    await updateProfile(auth.currentUser, { displayName: name.trim() });
    // no redux refresh here; assume your auth listener updates store
  }

  async function onSignOut() {
    await signOut(auth);
  }

  async function onDelete() {
    if (!auth.currentUser) return;
    const ok = window.confirm(
      "This will permanently delete your account.\nYou may need to reauthenticate. Continue?"
    );
    if (!ok) return;
    try {
      await deleteUser(auth.currentUser);
    } catch (err) {
      alert(
        "Delete failed: " +
          (err?.message || "Reauthentication required. Log out/in and try again.")
      );
    }
  }

  return (
    <section className="py-6 space-y-8">
      <header>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-white/70">Tune the UX and manage your account.</p>
      </header>

      {/* UX */}
      <div className="card space-y-4">
        <h2 className="text-lg font-semibold">Experience</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Bark volume */}
          <div>
            <label className="block text-sm text-white/80 mb-1" htmlFor="vol">
              Bark volume
            </label>
            <input
              id="vol"
              type="range"
              min={0}
              max={100}
              value={s.barkVolume}
              onChange={(e) => set("barkVolume", Number(e.target.value))}
              className="w-full"
            />
            <div className="text-xs text-white/60 mt-1">{s.barkVolume}%</div>
          </div>

          {/* Music */}
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm text-white/80">Music</div>
              <div className="text-xs text-white/60">Toggle background music.</div>
            </div>
            <input
              type="checkbox"
              checked={s.music}
              onChange={(e) => set("music", e.target.checked)}
              className="h-5 w-5"
            />
          </div>

          {/* Reduced motion */}
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm text-white/80">Reduced motion</div>
              <div className="text-xs text-white/60">Limit animations and parallax.</div>
            </div>
            <input
              type="checkbox"
              checked={s.reducedMotion}
              onChange={(e) => set("reducedMotion", e.target.checked)}
              className="h-5 w-5"
            />
          </div>

          {/* Theme */}
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm text-white/80">Theme</div>
              <div className="text-xs text-white/60">Dark or light UI.</div>
            </div>
            <select
              value={s.theme}
              onChange={(e) => set("theme", e.target.value)}
              className="bg-white/10 border border-white/15 rounded-md px-2 py-1"
            >
              <option value="system">System</option>
              <option value="dark">Dark</option>
              <option value="light">Light</option>
            </select>
          </div>
        </div>
      </div>

      {/* Account */}
      <div className="card space-y-4">
        <h2 className="text-lg font-semibold">Account</h2>
        {user ? (
          <>
            <div className="grid gap-2 text-sm">
              <div>
                <span className="text-white/60">UID:</span> {user.uid}
              </div>
              <div>
                <span className="text-white/60">Name:</span>{" "}
                {user.displayName || "—"}
              </div>
              <div>
                <span className="text-white/60">Email:</span>{" "}
                {user.email || "—"}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button className="btn btn--ghost" onClick={onChangeName}>
                Change display name
              </button>
              <button className="btn btn--ghost" onClick={onSignOut}>
                Sign out
              </button>
              <button className="btn btn--warn" onClick={onDelete}>
                Delete account
              </button>
            </div>
          </>
        ) : (
          <div className="text-white/70 text-sm">
            You’re signed out. Sign in to manage your account.
          </div>
        )}
      </div>
    </section>
  );
}
