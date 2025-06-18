import React from "react";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";
import { useDispatch } from "react-redux";
import { clearUser } from "../../redux/userSlice.js";
import { useNavigate } from "react-router-dom";

const LogoutButton = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    dispatch(clearUser());
    navigate("/login");
  };

  return (
    <button
      onClick={handleLogout}
      className="absolute top-4 right-4 text-xs bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded shadow"
    >
      Logout
    </button>
  );
};

export default LogoutButton;
