import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useSelector } from "react-redux";
import Dog from "./components/Dog";
import DogName from "./components/DogName";
import Controls from "./components/Controls";
import Status from "./components/Status";
import Tricks from "./components/Tricks";
import FirebaseAutoSave from "./components/FirebaseAutoSave";
import ToyBox from "./components/ToyBox";
import ResetGame from "./components/ResetGame";
import PoopScoop from "./components/PoopScoop";
import StatsBar from "./components/StatsBar";
import Signup from "./components/Auth/Signup";
import Login from "./components/Auth/Login";
import LogoutButton from "./components/Auth/LogoutButton";
import "./styles/App.css";

const MainApp = () => {
  const [poops, setPoops] = useState([]);
  const { xp } = useSelector((state) => state.dog);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-500 to-blue-600 flex flex-col items-center justify-center p-4 text-white">
      <h1 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow">🐾 Doggerz</h1>
      <FirebaseAutoSave />
      <DogName />
      <Dog poops={poops} setPoops={setPoops} />
      <PoopScoop clearPoops={() => setPoops([])} />
      <StatsBar xp={xp} />
      <Controls />
      <ToyBox />
      <Status />
      <Tricks />
      <ResetGame />
      <LogoutButton />
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
