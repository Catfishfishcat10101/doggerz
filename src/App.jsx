import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { ageUp } from "./redux/dogSlice";
import Dog from "./components/Dog";
import Controls from "./components/Controls";
import Status from "./components/Status";
import Tricks from "./components/Tricks";
import DogName from "./components/DogName";
import "./styles/App.css"; // Still valid if you have non-Tailwind base styles

const App = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const interval = setInterval(() => {
      dispatch(ageUp());
    }, 60000);
    return () => clearInterval(interval);
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-500 to-blue-500 flex flex-col items-center justify-start p-4 text-white">
      <h1 className="text-4xl font-bold mb-4 drop-shadow-lg">🐾 Doggerz</h1>

      <div className="w-full max-w-md bg-white/10 rounded-lg p-4 backdrop-blur-md shadow-xl">
        <DogName />
        <div className="flex justify-center mt-4">
          <Dog />
        </div>

        <div className="mt-4">
          <Controls />
        </div>

        <div className="mt-4">
          <Status />
        </div>

        <div className="mt-4">
          <Tricks />
        </div>
      </div>

      <footer className="mt-6 text-xs text-white/70 text-center">
        <p>© 2025 Doggerz. All rights reserved.</p>
        <p>Made by William Johnson</p>
        <p>Powered by React + Redux</p>
      </footer>
    </div>
  );
};

export default App;
