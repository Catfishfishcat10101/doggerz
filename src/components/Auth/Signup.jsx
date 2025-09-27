// src/components/Auth/Signup.jsx
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { userLoading, userAuthed, userError } from "@/redux/userSlice";
import { useNavigate, Link } from "react-router-dom";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [name, setName] = useState("");
  const [msg, setMsg] = useState(null);
  const nav = useNavigate();
  const dispatch = useDispatch();

  return (
    <div className="min-h-screen grid place-items-center bg-amber-50">
      <div className="bg-white rounded-2xl shadow p-6 w-[min(92vw,480px)]">
        <h2 className="text-2xl font-bold">Create your account</h2>
        {msg && <p className="mt-2 text-red-600">{msg}</p>}

        <form
          className="mt-4 grid gap-3"
          onSubmit={async (e) => {
            e.preventDefault();
            setMsg(null);
            dispatch(userLoading());
            try {
              const { user } = await createUserWithEmailAndPassword(auth, email.trim(), pw);
              if (name.trim()) {
                await updateProfile(user, { displayName: name.trim() });
              }
              const fresh = auth.currentUser;
              dispatch(userAuthed({ uid: fresh.uid, email: fresh.email, displayName: fresh.displayName }));
              nav("/setup", { replace: true });
            } catch (err) {
              dispatch(userError(err.message));
              setMsg("Signup failed. Is Email/Password auth enabled in Firebase?");
            }
          }}
        >
          <input className="input" placeholder="Display name (optional)" value={name} onChange={(e)=>setName(e.target.value)} />
          <input className="input" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} />
          <input className="input" placeholder="Password (min 6 chars)" type="password" value={pw} onChange={(e)=>setPw(e.target.value)} />
          <button className="btn-primary" type="submit">Sign up</button>
        </form>

        <p className="mt-4 text-sm text-gray-600">
          Already have an account? <Link className="underline" to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}