import { useEffect, useState } from "react";

export default function useKeyPressed(targetKey) {
  const [pressed, setPressed] = useState(false);
  useEffect(() => {
    const down = (e) => e.key === targetKey && setPressed(true);
    const up = (e) => e.key === targetKey && setPressed(false);
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [targetKey]);
  return pressed;
}
// src/components/UI/Controls.jsx