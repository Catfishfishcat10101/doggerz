import React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom"; // HashRouter is also fine (see note)
import App from "./App.jsx";
import store from "./redux/store";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter basename="/"> 
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
