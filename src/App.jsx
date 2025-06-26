import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Signup from "./components/Auth/Signup";
import Login from "./components/Auth/Login";
import LogoutButton from "./components/Auth/LogoutButton";
import MainGame from "./components/MainGame";
import { useSelector } from "react-redux";
import React from "react";
// Importing necessary components and hooks from React, React Router, Redux, and local components

const App = () => {
  const user = useSelector((state) => state.user.currentUser);
  // Using Redux to get the current user from the state

  return (
    <Router>
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 py-10 bg-gradient-to-br from-green-500 to-blue-500 font-sans">
        {user && <LogoutButton />}
        <Routes>
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/logout" element={<LogoutButton />} />
          <Route path="/game" element={user ? <MainGame /> : <Login />} />
          <Route path="/" element={user ? <MainGame /> : <Login />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;