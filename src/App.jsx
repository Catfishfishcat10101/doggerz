import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useSelector } from "react-redux";

import Signup       from "./components/Auth/Signup";
import Login        from "./components/Auth/Login";
import LogoutButton from "./components/Auth/LogoutButton";
import MainGame     from "./components/MainGame";

const App = () => {
  const loggedIn = useSelector((s) => s.user.loggedIn);

  return (
    <BrowserRouter basename="/doggerz">
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 py-10 bg-gradient-to-br from-green-500 to-blue-500 font-sans">
        {loggedIn && <LogoutButton />}

        <Routes>
          {/* ⬇️  this line handles “/doggerz” */}
          <Route index element={loggedIn ? <MainGame /> : <Login />} />

          <Route path="/signup" element={<Signup />} />
          <Route path="/login"  element={<Login  />} />
          <Route path="/logout" element={<LogoutButton />} />
          <Route path="/game"   element={loggedIn ? <MainGame /> : <Login />} />
          {/* optional 404 fallback */}
          <Route path="*" element={<div className="text-white p-4">Not Found</div>} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;