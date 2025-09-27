// src/components/UI/Splash.jsx
import React, { useState } from "react";
import "./Splash.css";
import { auth, googleProvider } from "@/lib/firebase";
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { useDispatch } from "react-redux";
import { userLoading, userAuthed, userError } from "@/redux/userSlice";

export default function Splash(){
  const [mode, setMode] = useState("google"); // google | login | signup
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [name, setName] = useState("");
  const [msg, setMsg] = useState(null);
  const dispatch = useDispatch();

  async function doGoogle(){
    try {
      dispatch(userLoading());
      const { user } = await signInWithPopup(auth, googleProvider);
      dispatch(userAuthed({ uid:user.uid, email:user.email, displayName:user.displayName ?? "" }));
      setMsg(null);
    } catch (e){
      dispatch(userError(e?.message));
      setMsg(e?.message || "Google sign-in failed");
    }
  }

  async function doLogin(e){
    e?.preventDefault();
    try {
      dispatch(userLoading());
      const { user } = await signInWithEmailAndPassword(auth, email.trim(), pw);
      dispatch(userAuthed({ uid:user.uid, email:user.email, displayName:user.displayName ?? "" }));
      setMsg(null);
    } catch (e){ dispatch(userError(e?.message)); setMsg(e?.message || "Login failed"); }
  }

  async function doSignup(e){
    e?.preventDefault();
    try {
      dispatch(userLoading());
      const { user } = await createUserWithEmailAndPassword(auth, email.trim(), pw);
      if (name.trim()) await updateProfile(user, { displayName: name.trim() });
      const u = auth.currentUser;
      dispatch(userAuthed({ uid:u.uid, email:u.email, displayName:u.displayName ?? "" }));
      setMsg(null);
    } catch (e){ dispatch(userError(e?.message)); setMsg(e?.message || "Signup failed"); }
  }

  return (
    <div className="splash">
      <div className="logo">Doggerz</div>
      <p className="tag">Adopt a pixel pup and raise it.</p>

      <div className="auth-card">
        <div className="tabs">
          <button className={mode==="google"?"active":""} onClick={()=>setMode("google")}>Google</button>
          <button className={mode==="login"?"active":""}  onClick={()=>setMode("login")}>Login</button>
          <button className={mode==="signup"?"active":""} onClick={()=>setMode("signup")}>Sign up</button>
        </div>

        {mode==="google" && (
          <div className="stack">
            <button className="cta" onClick={doGoogle}>Continue with Google</button>
          </div>
        )}

        {mode==="login" && (
          <form className="stack" onSubmit={doLogin}>
            <input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required />
            <input type="password" placeholder="Password" value={pw} onChange={e=>setPw(e.target.value)} required />
            <button className="cta" type="submit">Login</button>
          </form>
        )}

        {mode==="signup" && (
          <form className="stack" onSubmit={doSignup}>
            <input type="text" placeholder="Display name (optional)" value={name} onChange={e=>setName(e.target.value)} />
            <input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required />
            <input type="password" placeholder="Password (min 6)" value={pw} onChange={e=>setPw(e.target.value)} required />
            <button className="cta" type="submit">Create account</button>
          </form>
        )}

        {msg && <p className="msg">{msg}</p>}
      </div>
    </div>
  );
}