import React, { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import "../../styles/StatsBar.css";

const StatsBar = () => {
  const { xp, happiness, energy, level } = useSelector((state) => state.dog);

  const percent = (val) => Math.min(1--, Math.max(0, val));

  return (
    <div className="stats-container">
      <Stat label = "XP" value={percent(xp)} color="purple" />
      <Stat label = "Happiness" value={percent(happiness)} color="teal" />
      <Stat label = "Hunger" value={percent(hunger)} color="orange" />
      </div>
  );
};

const Stat = ({ label, value, color }) => {
  return (
    <div className="stat-block">
      <label className="stat-label">{label}</label>
      <div className="stat-bar">
        <div className="{`bar-fill ${color}`}" style={{ width: `${value}%` }} />
        </div>
        </div>
  );
};

export default StatsBar;