import React from "react";
import { useDispatch } from "react-redux";
import { feed, play } from "../redux/dogSlice";

const Controls = () => {
  const dispatch = useDispatch();

  return (
    <div className="flex gap-4 my-4">
      <button
        onClick={() => dispatch(feed())}
        className="bg-lime-500 px-4 py-2 rounded hover:bg-lime-600 transition font-bold"
      >
        🥩 Feed
      </button>
      <button
        onClick={() => dispatch(play())}
        className="bg-sky-500 px-4 py-2 rounded hover:bg-sky-600 transition font-bold"
      >
        🎾 Play
      </button>
    </div>
  );
};

export default Controls;
// This component is responsible for rendering the controls for feeding and playing with the dog. It uses Redux to dispatch actions when the buttons are clicked. The buttons have Tailwind CSS classes for styling and hover effects.
// The `feed` and `play` actions are imported from the Redux slice, which handles the state of the dog. The component is functional and uses React hooks to manage the dispatching of actions. The buttons are styled with Tailwind CSS for a modern look and feel.