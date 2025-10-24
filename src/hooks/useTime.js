import { useState, useEffect } from "react";

export function useGameTime() {
  const [gameTime, setGameTime] = useState(() => {
    const saved = localStorage.getItem("doggerz-time");
    return saved ? JSON.parse(saved) : { timestamp: Date.now(), ageDays: 0 };
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setGameTime((prev) => {
        const now = Date.now();
        const elapsed = now - prev.timestamp;
        const gameElapsed = elapsed * 20; // 1 real minute = 20 minutes game time
        const newAge = prev.ageDays + gameElapsed / (1000 * 60 * 60 * 24);
        const updated = {
          timestamp: now,
          ageDays: newAge,
        };
        localStorage.setItem("doggerz-time", JSON.stringify(updated));
        return updated;
      });
    }, 60000); // check every minute
    return () => clearInterval(interval);
  }, []);

  const hour = (new Date(gameTime.timestamp).getHours() + 2) % 24; // fake offset
  const isDay = hour >= 6 && hour < 18;

  return {
    ageDays: gameTime.ageDays,
    isDay,
    hour,
  };
}
