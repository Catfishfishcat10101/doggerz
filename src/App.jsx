import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { ageUp } from "./redux/dogSlice";
import Dog from "./components/Dog";
import DogName from "./components/DogName";
import Controls from "./components/Controls";
import Status from "./components/Status";
import Tricks from "./components/Tricks";
import FirebaseAutoSave from "./components/FirebaseAutoSave";

import "./styles/App.css";

const App = () => {
  const dispatch = useDispatch();

  // Age increases every minute
  useEffect(() => {
    const interval = setInterval(() => {
      dispatch(ageUp());
    }, 60000); // every 1 minute
    return () => clearInterval(interval);
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-500 to-blue-600 flex flex-col items-center justify-center p-4 text-white">
      <h1 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow">🐾 Doggerz</h1>

      <FirebaseAutoSave />

      <DogName />
      <Dog />

      <Status />

      <Controls />

      <Tricks />

      <footer className="mt-6 text-xs opacity-80">
        <p>© 2025 Doggerz. All rights reserved.</p>
        <p>Created by William Johnson</p>
        <p>Powered by React, Redux, and Firebase</p>
      </footer>
    </div>
  );
};

export default App;
