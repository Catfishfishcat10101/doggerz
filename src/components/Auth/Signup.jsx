import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../firebase/firebase";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUser } from "../../redux/userSlice";

const Signup = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCred.user.uid;
      dispatch(setUser(userCred.user));

      await setDoc(doc(db, "dogs", uid), {
        happiness: 100,
        energy: 100,
        age: 0,
        xp: 0,
        level: 1,
        x: 96,
        y: 96,
        direction: "down",
        tricksLearned: [],
        pottyTrained: false,
        soundEnabled: true,
        name: "",
      });

      navigate("/");
    } catch {
      setError("Signup failed.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-yellow-400 to-pink-500 text-white px-4">
      <h2 className="text-4xl font-bold mb-4">🐾 Sign Up for Doggerz</h2>
      <form onSubmit={handleSignup} className="bg-white p-6 text-black rounded w-full max-w-sm shadow-lg">
        {error && <p className="text-red-500 mb-2">{error}</p>}
        <label>Email</label>
        <input className="border p-2 rounded w-full mb-4" value={email} onChange={(e) => setEmail(e.target.value)} />
        <label>Password</label>
        <input className="border p-2 rounded w-full mb-4" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button className="bg-pink-600 hover:bg-pink-700 text-white w-full p-2 rounded">Sign Up</button>
        <p className="mt-4 text-sm text-center">
          Already have an account? <Link className="text-pink-600 underline" to="/login">Login here</Link>
        </p>
      </form>
    </div>
  );
};

export default Signup;
