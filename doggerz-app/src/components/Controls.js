import React from "react";
import { useDispatch } from "react-redux";
import { feed, play } from "../redux/dogSlice";

const Controls = () => {
  const dispatch = useDispatch();

  return (
    <div>
      <button onClick={() => dispatch(feed())}>Feed</button>
      <button onClick={() => dispatch(play())}>Play</button>
    </div>
  );
};

export default Controls;
