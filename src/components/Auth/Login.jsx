import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase/firebase";
import { useNavigate, Link, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "../../redux/userSlice";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.user.currentUser);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  if (currentUser) return <Navigate to="/" />;

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      dispatch(setUser(userCred.user));
      navigate("/");
    } catch (err) {
      setError("Login failed. Check your credentials.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 text-white px-4">
      <h2 className="text-4xl font-bold mb-4 drop-shadow">🐾 Doggerz Login</h2>
      <form onSubmit={handleLogin} className="bg-white text-black p-6 rounded shadow-md w-full max-w-sm">
        {error && <p className="text-red-500 mb-2">{error}</p>}
        <label>Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="border p-2 w-full mb-4 rounded" required />
        <label>Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="border p-2 w-full mb-4 rounded" required />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded w-full hover:bg-blue-700">Log In</button>
        <p className="text-sm text-center mt-4">
          Don’t have an account? <Link to="/signup" className="text-blue-600 hover:underline">Sign up here</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
