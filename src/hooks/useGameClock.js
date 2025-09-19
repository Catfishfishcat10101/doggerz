import { useEffect, useRef, useState } from "react";

/**
 * RequestAnimationFrame clock with pause/resume.
 * Returns { time, dt, playing, pause, resume, toggle }.
 */
export default function useGameClock(playingDefault = true) {
  const [playing, setPlaying] = useState(playingDefault);
  const [time, setTime] = useState(0);   // ms since start
  const [dt, setDt] = useState(16.67);   // ms since last frame

  const ref = useRef({ last: 0, start: 0, raf: 0 });

  useEffect(() => {
    const loop = (t) => {
      if (!ref.current.start) ref.current.start = t;
      if (!ref.current.last) ref.current.last = t;
      const elapsed = t - ref.current.start;
      const delta = t - ref.current.last;
      ref.current.last = t;
      setTime(elapsed);
      setDt(delta);
      ref.current.raf = requestAnimationFrame(loop);
    };

    if (playing) ref.current.raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(ref.current.raf);
  }, [playing]);

  const pause = () => setPlaying(false);
  const resume = () => setPlaying(true);
  const toggle = () => setPlaying((p) => !p);

  return { time, dt, playing, pause, resume, toggle };
}
