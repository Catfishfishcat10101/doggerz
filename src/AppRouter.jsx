import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LayoutShell from './components/LayoutShell'
import Landing from './pages/Landing'
import AdoptPage from './pages/AdoptPage'
import GamePage from './pages/GamePage'
import NotFound from './pages/NotFound'

export default function AppRouter() {
  return (
    <BrowserRouter>
      <LayoutShell>
        <Routes>
          <Route path='/' element={<Landing />} />
          <Route path='/adopt' element={<AdoptPage />} />
          <Route path='/game' element={<GamePage />} />
          <Route path='*' element={<NotFound />} />
        </Routes>
      </LayoutShell>
    </BrowserRouter>
  )
}
// src/AppRouter.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import Landing from "@/pages/Landing.jsx";
import GamePage from "@/pages/GamePage.jsx";
import NotFoundPage from "@/pages/NotFoundPage.jsx";

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/game" element={<GamePage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
