// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App.jsx";
import { store } from "./redux/store.js";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <RouterProvider
        router={createBrowserRouter(
          [
            {
              path: "*",
              element: <App />,
            },
          ],
          {
            // Opt-in to React Router v7 future behaviors to silence warnings
            future: {
              v7_startTransition: true,
              v7_relativeSplatPath: true,
            },
          }
        )}
      />
    </Provider>
  </React.StrictMode>
);
