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
    setError("");
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCred.user.uid;
      dispatch(setUser(userCred.user));
      await setDoc(doc(db, "dogs", uid), {
        happiness: 100,
        energy: 100,
        age: 0,
        x: 96,
        y: 96,
        direction: "down",
        xp: 0,
        tricksLearned: [],
        pottyTrained: false,
        soundEnabled: true,
        name: "",
      });
      navigate("/");
    } catch (err) {
      setError("Signup failed. Try again.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-yellow-500 to-pink-500 text-white px-4">
      <h2 className="text-4xl font-bold mb-4 drop-shadow">🐾 Sign Up for Doggerz</h2>
      <form onSubmit={handleSignup} className="bg-white text-black p-6 rounded shadow-md w-full max-w-sm">
        {error && <p className="text-red-500 mb-2">{error}</p>}
        <label>Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="border p-2 w-full mb-4 rounded" required />
        <label>Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="border p-2 w-full mb-4 rounded" required />
        <button type="submit" className="bg-pink-600 text-white px-4 py-2 rounded w-full hover:bg-pink-700">Sign Up</button>
        <p className="text-sm text-center mt-4">
          Already have an account? <Link to="/login" className="text-pink-600 hover:underline">Log in here</Link>
        </p>
      </form>
    </div>
  );
};

export default Signup;
