// src/components/Controls.jsx
import { useDispatch } from "react-redux";
import { play, feed, gainXP } from "../redux/dogSlice.js";  // gainXP now exists

export default function Controls() {
  const dispatch = useDispatch();

  return (
    <div>
      <button onClick={() => dispatch(feed())}>Feed</button>
      <button onClick={() => dispatch(play())}>Play</button>
      <button onClick={() => dispatch(gainXP(5))}>+5 XP</button>
    </div>
  );
}
