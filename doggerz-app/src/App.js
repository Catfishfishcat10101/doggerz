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
    }, 60000); // age increases every minute
    return () => clearInterval(interval);
  }, [dispatch]);

  return (
    <div>
      <h1>Doggerz</h1>
      <Dog />
      <Controls />
      <Status />
      <Tricks />
    </div>
  );
};

export default App;
