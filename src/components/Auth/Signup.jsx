// src/components/Auth/Signup.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../../firebase";

import { loginSuccess } from "../../redux/userSlice.js";  // canonical action
import { setDogName as setDogNameAction } from "../../redux/dogSlice.js";

export default function Signup() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [dogName,  setDogName]  = useState("");

  const [step,  setStep]  = useState(1);         // 1 = account, 2 = dog name
  const [error, setError] = useState("");

  /* ───────────────────────────────────────────────────────── step 1 */
  const handleAccountSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);

      // put user in Redux
      dispatch(loginSuccess({ uid: user.uid, email: user.email }));

      // pre-create dog doc with empty name; we'll update name in step 2
      await setDoc(doc(db, "dogs", user.uid), {
        name: "",
        happiness: 100,
        energy: 100,
        hunger: 100,
        xp: 0,
        level: 1,
        age: 0,
        x: 96,
        y: 96,
        direction: "down",
        tricksLearned: [],
        pottyTrained: false,
        soundEnabled: true,
        coins: 0,
      });

      setStep(2);          // go to dog-name prompt
    } catch (err) {
      console.error("Signup error", err);
      if (err.code === "auth/email-already-in-use") {
        setError("Email already in use. Please try another.");
      } else {
        setError("Signup failed. Please try again.");
      }
    }
  };

  /* ───────────────────────────────────────────────────────── step 2 */
  const handleNameSubmit = async (e) => {
    e.preventDefault();
    if (!dogName.trim()) return;

    try {
      const uid = auth.currentUser?.uid;
      if (uid) {
        await setDoc(doc(db, "dogs", uid), { name: dogName }, { merge: true });
        dispatch(setDogNameAction(dogName));
      }
      navigate("/doggerz/game");                  // = /doggerz/ because of basename
    } catch (err) {
      console.error("Dog-name save failed", err);
      setError("Could not save dog name. Try again.");
    }
  };

  /* ───────────────────────────────────────────────────────── UI */
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-yellow-500 to-pink-500 text-white px-4">
      <h2 className="text-4xl font-bold mb-4 drop-shadow">🐾 Sign Up for Doggerz</h2>

      {step === 1 && (
        <form
          onSubmit={handleAccountSubmit}
          className="bg-white text-black p-6 rounded shadow-md w-full max-w-sm"
        >
          {error && <p className="text-red-500 mb-2">{error}</p>}

          <label className="font-semibold">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border p-2 w-full mb-4 rounded"
            required
          />

          <label className="font-semibold">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border p-2 w-full mb-4 rounded"
            required
          />

          <button type="submit" className="bg-pink-600 text-white px-4 py-2 rounded w-full hover:bg-pink-700">
            Next&nbsp;→
          </button>

          <p className="text-sm text-center mt-4">
            Already have an account?{" "}
            <Link to="/login" className="text-pink-600 hover:underline">
              Log in here
            </Link>
          </p>
        </form>
      )}

      {step === 2 && (
        <form
          onSubmit={handleNameSubmit}
          className="bg-white text-black p-6 rounded shadow-md w-full max-w-sm"
        >
          {error && <p className="text-red-500 mb-2">{error}</p>}

          <label className="font-semibold">Choose your dog’s name</label>
          <input
            type="text"
            value={dogName}
            onChange={(e) => setDogName(e.target.value)}
            className="border p-2 w-full mb-4 rounded"
            placeholder="Fireball"
            required
          />

          <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded w-full hover:bg-indigo-700">
            Finish&nbsp;🎉
          </button>
        </form>
      )}
    </div>
  );
}