import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import NavBar from "./components/UI/NavBar";
import Dog from "./components/Features/Dog";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-900 text-white">
        <NavBar />
        <main className="p-6">
          <Dog />
        </main>
      </div>
    </Router>
  );
}
