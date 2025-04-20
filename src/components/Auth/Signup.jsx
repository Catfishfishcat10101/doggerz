import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../../firebase/firebase";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCred.user.uid;

      await setDoc(doc(db, "dogs", uid), {
        name: "",
        happiness: 100,
        energy: 100,
        age: 0,
        xp: 0,
        tricksLearned: [],
        pottyTrained: false,
        soundEnabled: true,
        x: 96,
        y: 96,
        direction: "down"
      });

      navigate("/login");
    } catch (err) {
      setError("⚠️ " + err.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-500 to-blue-600 text-white">
      <div className="bg-white p-6 rounded-lg shadow-md max-w-sm w-full text-black">
        <h2 className="text-3xl font-bold text-center mb-2 text-purple-700">🐾 Doggerz</h2>
        <p className="text-sm text-center mb-4 text-gray-700">Create your puppy profile</p>
        {error && <p className="text-red-600 mb-2 text-center text-sm">{error}</p>}

        <form onSubmit={handleSignup}>
          <input
            className="w-full p-2 border border-gray-300 rounded mb-2"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="w-full p-2 border border-gray-300 rounded mb-4"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded font-bold"
          >
            Sign Up
          </button>
        </form>

        <p className="mt-4 text-center text-sm">
          Already have an account?{" "}
          <span
            className="text-purple-600 hover:underline cursor-pointer"
            onClick={() => navigate("/login")}
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
};

export default Signup;
