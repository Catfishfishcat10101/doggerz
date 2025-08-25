import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import NavBar from "./components/UI/NavBar";
import GameScreen from "./components/UI/GameScreen";

const Home = () => <div style={{padding:24}}><h2>Home</h2></div>;
const About = () => <div style={{padding:24}}><h2>About</h2></div>;
const Contact = () => <div style={{padding:24}}><h2>Contact</h2></div>;
const Settings = () => <div style={{padding:24}}><h2>Settings</h2></div>;

export default function App() {
  return (
    <BrowserRouter>
      {/* Must match outerContainerId */}
      <div id="outer-container">
        <NavBar />
        {/* Must match pageWrapId */}
        <main id="page-wrap">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/game" element={<GameScreen />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
