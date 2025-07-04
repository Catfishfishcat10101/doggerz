// src/FeaturesRouter.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Feature components
import Affection from "./components/Features/Affection";
import BackgroundScene from "./components/Features/BackgroundScene";
import DailyLoginReward from "./components/Features/DailyLoginReward";
import Dog from "./components/Features/Dog";
import Memory from "./components/Features/Memory";
import PottyTraining from "./components/Features/PottyTraining";
import PoopRenderer from "./components/Features/PoopRenderer";
import SettingsModal from "./components/Features/SettingsModal";
import Shop from "./components/Features/Shop";
import UpgradeYard from "./components/Features/UpgradeYard";

export default function FeaturesRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dog" replace />} />
      <Route path="/dog" element={<Dog />} />
      <Route path="/affection" element={<Affection />} />
      <Route path="/background" element={<BackgroundScene />} />
      <Route path="/reward" element={<DailyLoginReward />} />
      <Route path="/memory" element={<Memory />} />
      <Route path="/potty" element={<PottyTraining />} />
      <Route path="/poop" element={<PoopRenderer />} />
      <Route
        path="/settings"
        element={<SettingsModal isOpen={true} onClose={() => {}} />}
      />
      <Route path="/shop" element={<Shop />} />
      <Route path="/upgrade" element={<UpgradeYard />} />
    </Routes>
  );
}
