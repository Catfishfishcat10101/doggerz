import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Signup from "./components/Auth/Signup";
import Login from "./components/Auth/Login";
import LogoutButton from "./components/Auth/LogoutButton";
import Dog from "./components/Dog";
import StatusBar from "./components/UI/StatsBar";
import CleanlinessBar from "./components/UI/CleanlinessBar";
import PoopScoop from "./components/UI/PoopScoop";
import Controls from "./components/UI/Controls";
import { useSelector } from "react-redux";

const App = () => {
  const user = useSelector((state) => state.user.currentUser);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 py-10 bg-gradient-to-br from-green-500 to-blue-500 font-sans">
      <Router>
        {user && <LogoutButton />}
        <Routes>
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              user ? (
                <div className="w-full max-w-4xl flex flex-col items-center gap-4">
                  <Dog />
                  <StatusBar />
                  <CleanlinessBar />
                  <Controls />
                  <PoopScoop />
                </div>
              ) : (
                <Login />
              )
            }
          />
        </Routes>
      </Router>
    </div>
  );
};

export default App;
