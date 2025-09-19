import { useEffect, useState } from "react";

/** Returns a Set of currently pressed keys. */
export default function useKeyPressed() {
  const [pressed, setPressed] = useState(() => new Set());

  useEffect(() => {
    const down = (e) => setPressed((s) => new Set(s).add(e.key));
    const up = (e) => setPressed((s) => { const n = new Set(s); n.delete(e.key); return n; });
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
  }, []);

  return pressed;
}
