import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase/firebase";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUser } from "../../redux/userSlice";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      dispatch(setUser(userCred.user));
      navigate("/");
    } catch {
      setError("Login failed. Check your credentials.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-600 to-blue-600 text-white px-4">
      <h2 className="text-4xl font-bold mb-4">🐶 Welcome Back to Doggerz</h2>
      <form onSubmit={handleLogin} className="bg-white p-6 text-black rounded w-full max-w-sm shadow-lg">
        {error && <p className="text-red-500 mb-2">{error}</p>}
        <label>Email</label>
        <input className="border p-2 rounded w-full mb-4" value={email} onChange={(e) => setEmail(e.target.value)} />
        <label>Password</label>
        <input className="border p-2 rounded w-full mb-4" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button className="bg-blue-600 hover:bg-blue-700 text-white w-full p-2 rounded">Log In</button>
        <p className="mt-4 text-sm text-center">
          Don’t have an account? <Link className="text-blue-600 underline" to="/signup">Sign up here</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
