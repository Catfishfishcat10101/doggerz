// src/components/ResetGame.jsx
import { useDispatch } from "react-redux";
import { resetDog } from "../redux/dogSlice";   // not resetGame

export default function ResetGame() {
  const dispatch = useDispatch();
  return (
    <button onClick={() => dispatch(resetDog())}>
      Reset
    </button>
  );
}
