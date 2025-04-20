import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../../firebase/firebase";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "../../redux/userSlice";
import { useNavigate, Link, Navigate } from "react-router-dom";

const Signup = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.user.currentUser);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  if (currentUser) return <Navigate to="/" />;

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
        tricksLearned: [],
        x: 96,
        y: 96,
        direction: "down",
        pottyTrained: false,
        soundEnabled: true,
        name: "",
      });

      navigate("/");
    } catch (err) {
      console.error(err);
      setError("Signup failed. Try again.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-yellow-500 to-pink-500 p-4 text-white">
      <h1 className="text-4xl font-bold mb-4">🐶 Join Doggerz</h1>
      <form onSubmit={handleSignup} className="bg-white text-black p-6 rounded shadow w-full max-w-sm">
        {error && <p className="text-red-500">{error}</p>}
        <label>Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
        />
        <label>Password</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
        />
        <button type="submit" className="bg-pink-600 text-white px-4 py-2 w-full rounded hover:bg-pink-700">
          Sign Up
        </button>
        <p className="text-sm text-center mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-pink-700 hover:underline">
            Log in
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Signup;
