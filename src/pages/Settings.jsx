// src/pages/Settings.jsx
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { selectUser } from "@/redux/userSlice.js";
import { auth } from "@/lib/firebase";
import { updateProfile, signOut, deleteUser } from "firebase/auth";
import { getSettings, saveSettings, applySettings } from "@/lib/settings";

/**
 * Settings
 * - Experience: bark volume, music, reduced motion, theme
 * - Account: name change, sign out, hard delete
 *
 * Notes:
 * - applySettings/saveSettings come from your central settings module.
 * - We use Tailwind classes only (no custom .card/.btn).
 */
export default function Settings() {
  const user = useSelector(selectUser);
  const [s, setS] = useState(() => getSettings());
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  // Apply & persist UX settings live
  useEffect(() => {
    try {
      applySettings(s);
      saveSettings(s);
    } catch (e) {
      if (import.meta.env.DEV) console.warn("[settings] apply/save failed", e);
    }
  }, [s]);

  const setField = (k, v) => setS(prev => ({ ...prev, [k]: v }));

  async function onChangeName() {
    if (!auth.currentUser) return;
    const next = window.prompt("Display name", auth.currentUser.displayName || "");
    if (next == null) return; // cancel
    const name = next.trim();
    setBusy(true); setMsg("");
    try {
      await updateProfile(auth.currentUser, { displayName: name || null });
      await auth.currentUser.reload(); // let your onAuthStateChanged refresh Redux
      setMsg("Display name updated.");
    } catch (err) {
      setMsg(err?.message || "Failed to update display name.");
    } finally {
      setBusy(false);
    }
  }

  async function onSignOut() {
    setBusy(true); setMsg("");
    try {
      await signOut(auth);
      setMsg("Signed out.");
    } catch (err) {
      setMsg(err?.message || "Failed to sign out.");
    } finally {
      setBusy(false);
    }
  }

  async function onDelete() {
    if (!auth.currentUser) return;
    const ok = window.confirm(
      "This will permanently delete your account and profile data.\nYou may be asked to reauthenticate. Continue?"
    );
    if (!ok) return;
    setBusy(true); setMsg("");
    try {
      await deleteUser(auth.currentUser);
      // onAuthStateChanged will handle downstream state cleanup
    } catch (err) {
      setMsg(
        err?.message ||
          "Delete failed. You may need to sign out and sign back in, then try again."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="py-6 space-y-8">
      <header>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-white/70">Tune the UX and manage your account.</p>
      </header>

      {/* Experience */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4">
        <h2 className="text-lg font-semibold">Experience</h2>

        <div className="grid gap-6 sm:grid-cols-2">
          {/* Bark volume */}
          <div>
            <label htmlFor="vol" className="block text-sm text-white/80 mb-2">
              Bark volume
            </label>
            <input
              id="vol"
              type="range"
              min={0}
              max={100}
              value={s.barkVolume}
              onChange={(e) => setField("barkVolume", Number(e.target.value))}
              className="w-full accent-emerald-400"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={s.barkVolume}
            />
            <div className="text-xs text-white/60 mt-1">{s.barkVolume}%</div>
          </div>

          {/* Music */}
          <ToggleRow
            label="Music"
            desc="Toggle background music."
            checked={!!s.music}
            onChange={(v) => setField("music", v)}
          />

          {/* Reduced motion */}
          <ToggleRow
            label="Reduced motion"
            desc="Limit animations and parallax."
            checked={!!s.reducedMotion}
            onChange={(v) => setField("reducedMotion", v)}
          />

          {/* Theme */}
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm text-white/80">Theme</div>
              <div className="text-xs text-white/60">Dark or light UI.</div>
            </div>
            <select
              value={s.theme}
              onChange={(e) => setField("theme", e.target.value)}
              className="bg-white/10 border border-white/15 rounded-md px-2 py-1 outline-none focus:ring-2 focus:ring-white/30"
            >
              <option value="system">System</option>
              <option value="dark">Dark</option>
              <option value="light">Light</option>
            </select>
          </div>
        </div>
      </div>

      {/* Account */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4">
        <h2 className="text-lg font-semibold">Account</h2>

        {user ? (
          <>
            <div className="grid gap-2 text-sm">
              <DataRow k="UID" v={user.uid} />
              <DataRow k="Name" v={user.displayName || "—"} />
              <DataRow k="Email" v={user.email || "—"} />
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={onChangeName}
                disabled={busy}
                className="rounded-xl border border-white/15 bg-white/10 px-4 py-2 hover:bg-white/15 disabled:opacity-60"
              >
                Change display name
              </button>
              <button
                onClick={onSignOut}
                disabled={busy}
                className="rounded-xl border border-white/15 bg-white/10 px-4 py-2 hover:bg-white/15 disabled:opacity-60"
              >
                Sign out
              </button>
              <button
                onClick={onDelete}
                disabled={busy}
                className="rounded-xl bg-rose-500/90 text-white px-4 py-2 hover:bg-rose-400 disabled:opacity-60"
              >
                Delete account
              </button>
            </div>
          </>
        ) : (
          <div className="text-white/70 text-sm">
            You’re signed out. Sign in to manage your account.
          </div>
        )}

        {msg && <div className="text-sm text-emerald-300">{msg}</div>}
      </div>
    </section>
  );
}

function ToggleRow({ label, desc, checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <div className="text-sm text-white/80">{label}</div>
        <div className="text-xs text-white/60">{desc}</div>
      </div>
      <input
        type="checkbox"
        checked={!!checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-5 w-5 accent-emerald-400"
      />
    </div>
  );
}

function DataRow({ k, v }) {
  return (
    <div>
      <span className="text-white/60">{k}:</span>{" "}
      <span className="text-white/90 break-all">{v}</span>
    </div>
  );
}
