// src/pages/Profile.jsx
import React, { useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectUser, userAuthed } from "@/redux/userSlice";
import { auth } from "@/lib/firebase";

export default function Profile() {
  const user = useSelector(selectUser);
  const dispatch = useDispatch();
  const [name, setName] = useState(user?.displayName || "");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const fileRef = useRef(null);

  if (!user) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="text-slate-300">Not signed in.</div>
      </div>
    );
  }

  async function saveProfile(e) {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    try {
      const { updateProfile } = await import("firebase/auth");
      await updateProfile(auth.currentUser, { displayName: name.trim() || null });

      // persist a light profile doc (optional)
      try {
        const [{ setDoc, doc, serverTimestamp }, { db }] = await Promise.all([
          import("firebase/firestore"),
          import("@/lib/firebase"),
        ]);
        await setDoc(
          doc(db, "profiles", user.uid),
          { displayName: name.trim() || null, updatedAt: serverTimestamp() },
          { merge: true }
        );
      } catch { /* ignore */ }

      // refresh redux user
      const refreshed = auth.currentUser;
      dispatch(userAuthed({
        uid: refreshed.uid,
        email: refreshed.email,
        displayName: refreshed.displayName,
        photoURL: refreshed.photoURL,
      }));
      setMsg("Profile saved.");
    } catch (e2) {
      setMsg(e2?.message || "Failed to save profile.");
    } finally {
      setBusy(false);
    }
  }

  async function onPickFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setMsg("");
    try {
      const [{ ref, uploadBytes, getDownloadURL }, { storage }] = await Promise.all([
        import("firebase/storage"),
        import("@/lib/firebase"),
      ]);
      const key = `user/${user.uid}/avatar.jpg`;
      const r = ref(storage, key);
      await uploadBytes(r, file, { contentType: file.type || "image/jpeg" });
      const url = await getDownloadURL(r);

      const { updateProfile } = await import("firebase/auth");
      await updateProfile(auth.currentUser, { photoURL: url });

      // optional: store on profile doc too
      try {
        const [{ setDoc, doc, serverTimestamp }, { db }] = await Promise.all([
          import("firebase/firestore"),
          import("@/lib/firebase"),
        ]);
        await setDoc(
          doc(db, "profiles", user.uid),
          { photoURL: url, updatedAt: serverTimestamp() },
          { merge: true }
        );
      } catch { /* ignore */ }

      // refresh redux user
      const refreshed = auth.currentUser;
      dispatch(userAuthed({
        uid: refreshed.uid,
        email: refreshed.email,
        displayName: refreshed.displayName,
        photoURL: refreshed.photoURL,
      }));
      setMsg("Avatar updated.");
    } catch (e2) {
      setMsg(e2?.message || "Failed to upload avatar.");
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  }

  async function onSignOut() {
    try {
      const { signOut } = await import("firebase/auth");
      await signOut(auth);
      // redux gets cleared by your global auth listener or on ProtectedRoute redirect
    } catch (e) {
      setMsg(e?.message || "Failed to sign out.");
    }
  }

  return (
    <div className="grid gap-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">Profile</h1>
        <button
          onClick={onSignOut}
          className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 hover:bg-white/10"
        >
          Sign out
        </button>
      </header>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="flex items-center gap-4">
          <Avatar url={user.photoURL} />
          <div>
            <div className="text-slate-300">{user.email}</div>
            <button
              onClick={() => fileRef.current?.click()}
              className="mt-2 rounded-xl bg-amber-400 text-slate-900 font-semibold px-3 py-2 hover:bg-amber-300"
              disabled={busy}
            >
              Change avatar
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onPickFile}
            />
          </div>
        </div>

        <form onSubmit={saveProfile} className="mt-6 space-y-3 max-w-sm">
          <label className="block">
            <span className="text-sm text-slate-300">Display name</span>
            <input
              type="text"
              className="mt-1 w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-amber-300"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={32}
            />
          </label>

          {msg && <div className="text-sm text-emerald-300">{msg}</div>}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={busy}
              className="rounded-xl bg-amber-400 text-slate-900 font-semibold px-4 py-2 hover:bg-amber-300 disabled:opacity-60"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setName(user?.displayName || "")}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 hover:bg-white/10"
            >
              Reset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Avatar({ url }) {
  return (
    <div className="h-16 w-16 rounded-full overflow-hidden bg-white/10 border border-white/10 grid place-items-center">
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="Avatar" className="h-full w-full object-cover" />
      ) : (
        <span className="text-2xl">🐶</span>
      )}
    </div>
  );
}
