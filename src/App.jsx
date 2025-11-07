// src/App.jsx (example)
import { Routes, Route } from "react-router-dom";
import RootLayout from "./layout/RootLayout";
import RequireAuth from "./layout/RequireAuth";
import RequireGuest from "./layout/RequireGuest";
import Splash from "./pages/Splash";
import Login from "./pages/Login";
import Game from "./pages/Game";
import Adopt from "./pages/Adopt";

export default function App() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route index element={<Splash />} />
        <Route path="login" element={<RequireGuest><Login /></RequireGuest>} />
        <Route path="adopt" element={<RequireAuth><Adopt /></RequireAuth>} />
        <Route path="game" element={<RequireAuth><Game /></RequireAuth>} />
      </Route>
    </Routes>
  );
}