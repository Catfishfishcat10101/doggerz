import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { ageUp } from "./redux/dogSlice";

import DogName from "./components/DogName";
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
    <div className="min-h-screen bg-gradient-to-br from-green-
500 to-blue-500 flex flex-col items-center justify-center text-white">
      <h1 className="text-4xl font-bold mb-4">Doggerz App</h1>
      <DogName />
      <Dog />
      <Controls />
      <Status />
      <Tricks />
      <footer className="mt-4 text-sm">
        <p>© 2025 Doggerz. All rights reserved.</p>
        <p>Made with ❤️ by [William Johnson]</p>
        <p>Powered by React and Redux</p>
      </footer>
    </div>
  );
}
export default App;
// import React from "react";
// import { Provider } from "react-redux";
// import store from "./redux/store";
// import DogName from "./components/DogName";
// import Dog from "./components/Dog";
// import Controls from "./components/Controls";
// import Status from "./components/Status";
// import Tricks from "./components/Tricks";