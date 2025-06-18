import React, {useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useSelector } from "react-redux";

import Splash from "./components/UI/Splash.jsx";
import GameScreen from "./components/UI/GameScreen.jsx";
import BackgroundScene from "./components/Features/BackgroundScene.jsx";
import Signup from "./components/Auth/Signup.jsx";
import Login from "./components/Auth/Login.jsx";
import LogoutButton from "./components/Auth/LogoutButton.jsx";
import DogName from "./components/UI/DogName.jsx";
import Controls from "./components/UI/Controls.jsx";
import Tricks from "./components/UI/Tricks.jsx";
import FirebaseAutoSave from "./components/UI/FirebaseAutoSave.jsx";
import ToyBox from "./components/UI/ToyBox.jsx";
import ResetGame from "./components/UI/ResetGame.jsx";
import Status from "./components/UI/Status.jsx";
import StatsBar from "./components/UI/StatsBar.jsx";
import './styles/App.css';

const MainApp = () => {
  const [showSplash, setShowSplash] = useState(true);
  const xp = useSelector((state) => state.dog.xp);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setShowSplash(false);
    },3000);

    return () => clearTimeout(timeout);
  },[]);

  if (showSplash) {
    return <Splash />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-500 to-blue-600 flex flex-col items-center justify-center p-4 text-white relative">
      <h1 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow">🐾 Doggerz</h1>
      <BackgroundScene>
      <FirebaseAutoSave />
      <GameScreen />
      <DogName />
      <StatsBar xp={xp} />
      <Controls />
      <ToyBox />
      <Status />
      <Tricks />
      <ResetGame />
      <LogoutButton />
      </BackgroundScene>
    </div>
  );
};

const App = () => (
  <Router>
    <Routes>
      <Route path="/" element={<MainApp />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
    </Routes>
  </Router>
);

export default App;
