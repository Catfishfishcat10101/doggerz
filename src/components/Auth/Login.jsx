// src/components/Auth/Login.jsx
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db, googleProvider } from "@/lib/firebase";
import { userLoading, userAuthed, userError } from "@/redux/userSlice";
import { setDogName } from "@/redux/dogSlice";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [msg, setMsg] = useState(null);
  const nav = useNavigate();
  const dispatch = useDispatch();

  async function afterLogin(user) {
    dispatch(userAuthed({ uid: user.uid, email: user.email, displayName: user.displayName }));
    const snap = await getDoc(doc(db, "dogs", user.uid));
    if (snap.exists() && snap.data()?.name) {
      dispatch(setDogName(snap.data().name));
      nav("/game", { replace: true });
    } else {
      nav("/setup", { replace: true });
    }
  }

  return (
    <div className="min-h-screen grid place-items-center bg-amber-50">
      <div className="bg-white rounded-2xl shadow p-6 w-[min(92vw,480px)]">
        <h2 className="text-2xl font-bold">Welcome back</h2>
        {msg && <p className="mt-2 text-red-600">{msg}</p>}

        <form
          className="mt-4 grid gap-3"
          onSubmit={async (e) => {
            e.preventDefault();
            setMsg(null);
            dispatch(userLoading());
            try {
              const { user } = await signInWithEmailAndPassword(auth, email.trim(), pw);
              await afterLogin(user);
            } catch (err) {
              dispatch(userError(err.message));
              setMsg("Login failed. Check your email/password.");
            }
          }}
        >
          <input className="input" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} />
          <input className="input" placeholder="Password" type="password" value={pw} onChange={(e)=>setPw(e.target.value)} />
          <button className="btn-primary" type="submit">Log in</button>
        </form>

        <div className="mt-4">
          <button
            className="btn-outline w-full"
            onClick={async () => {
              setMsg(null);
              dispatch(userLoading());
              try {
                const { user } = await signInWithPopup(auth, googleProvider);
                await afterLogin(user);
              } catch (err) {
                dispatch(userError(err.message));
                setMsg("Google sign-in failed (provider disabled?).");
              }
            }}
          >
            Continue with Google
          </button>
        </div>

        <p className="mt-4 text-sm text-gray-600">
          New here? <Link className="underline" to="/signup">Create an account</Link>
        </p>
      </div>
    </div>
  );
}