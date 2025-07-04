import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setDogName } from "../../redux/dogSlice.js";

const DogName = () => {
  const dispatch = useDispatch();
  const { name } = useSelector((state) => state.dog);
  return <div className="text-xl font-bold">{name || "Your Dog"}</div>;
  const [input, setInput] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (!currentName && inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentName]);

  const handleNameSubmit = (e) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (trimmed.length > 0) {
      dispatch(setDogName(trimmed));
      setInput("");
    }
  };

  return (
    <div className="mb-4 text-center animate-fadeIn">
      {currentName ? (
        <h2 className="text-2xl font-semibold drop-shadow-sm">🐶 Meet {currentName}!</h2>
      ) : (
        <form onSubmit={handleNameSubmit} className="flex flex-col items-center gap-2">
          <input
            ref={inputRef}
            className="text-black px-4 py-1 rounded shadow w-60"
            type="text"
            placeholder="Name your dog..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            maxLength={20}
          />
          <button
            type="submit"
            className="bg-yellow-400 text-black px-4 py-1 rounded font-bold hover:bg-yellow-500 transition"
          >
            Confirm Name
          </button>
        </form>
      )}
    </div>
  );
};

export default DogName;