// src/components/Auth/LogoutButton.jsx
import React from "react";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";
import { useDispatch } from "react-redux";
import { clearUser } from "../../redux/userSlice";
import { useNavigate } from "react-router-dom";

export default function LogoutButton({ className = "" }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      dispatch(clearUser());
      navigate("/login");
    } catch (err) {
      alert("Logout failed: " + err.message);
    }
  };

  return (
    <button
      className={
        "bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded font-bold transition " +
        className
      }
      onClick={handleLogout}
    >
      Log Out
    </button>
  );
}
