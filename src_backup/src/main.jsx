import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css"; // ensure this exists and is the single place with @tailwind directives

createRoot(document.getElementById("root")).render(<App />);
