import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { ageUp } from "./redux/dogSlice";
import Dog from "./components/Dog";
import Controls from "./components/Controls";
import Status from "./components/Status";
import Tricks from "./components/Tricks";

const App = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const interval = setInterval(() => {
      dispatch(ageUp());
    }, 60000);
    return () => clearInterval(interval);
  }, [dispatch]);

  return (
    <div className="bg-slate-900 min-h-screen p-4 text-white">
      <h1 className="text-3xl font-bold text-center mb-6">🐶 Doggerz</h1>
      <Dog />
      <Status />
      <Controls />
      <Tricks />
    </div>
  );
};

export default App;
