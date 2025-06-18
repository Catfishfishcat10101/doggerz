import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setDogName } from "../../redux/dogSlice.js";

export default function DogName() {
  const dispatch = useDispatch();
  const currentName = useSelector((state) => state.dog.name);
  const [input, setInput] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  const handleNameSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      dispatch(setDogName(input.trim()));
      setInput("");
      setConfirmed(true);
      setTimeout(() => setConfirmed(false), 3000);
    }
  };

  return (
    <div className="mb-4 text-center">
      {currentName ? (
        <h2 className="text-2xl font-semibold">🐶 Meet {currentName}!</h2>
      ) : (
        <>
        <h2 className="text-2xl font-semibold"> Name your dog</h2>
        <form onSubmit={handleNameSubmit} className="flex flex-col items-center gap-2">
          <input
            className="text-black px-4 py-1 rounded shadow"
            type="text"
            placeholder="Name your dog..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            type="submit"
            className="bg-yellow-400 text-black px-4 py-1 rounded font-bold hover:bg-yellow-500 transition"
          >
            Confirm Name
          </button>
        </form>
        </>
      )}

        {confirmed && (
          <div className="mt-2 text-green-600 font-semibold">
          You named your dog <span className="text-blue-500">{currentName}</span>!
          </div>
      )}
      </div>
  );
}
