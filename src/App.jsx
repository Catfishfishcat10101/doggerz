// src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Splash from './pages/Splash';
import Home from './pages/Home';
import Game from './pages/Game';
import Shop from './pages/Shop';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

// Optional pages
import Adopt from './pages/Adopt';
import Affection from './pages/Affection';
import Landing from './pages/Landing';
import Memory from './pages/Memory';
import Onboarding from './pages/Onboarding';
import Potty from './pages/Potty';
import Upgrade from './pages/Upgrade';
import Legal from './pages/Legal'; // If it's a folder with index.js inside

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Splash />} />
      <Route path="/home" element={<Home />} />
      <Route path="/game" element={<Game />} />
      <Route path="/shop" element={<Shop />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/adopt" element={<Adopt />} />
      <Route path="/affection" element={<Affection />} />
      <Route path="/landing" element={<Landing />} />
      <Route path="/memory" element={<Memory />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/potty" element={<Potty />} />
      <Route path="/upgrade" element={<Upgrade />} />
      <Route path="/legal" element={<Legal />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;
