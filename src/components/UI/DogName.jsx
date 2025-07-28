// src/components/DogName.jsx
import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setDogName } from "../../redux/dogSlice";

const DogName = () => {
  const dispatch = useDispatch();
  const currentName = useSelector((state) => state.dog.name);
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
    <div className="mb-6 text-center animate-fadeIn">
      {currentName ? (
        <h2 className="text-3xl font-extrabold text-yellow-300 drop-shadow-lg transition-opacity duration-500">
          🐶 Meet <span className="underline">{currentName}</span>!
        </h2>
      ) : (
        <form
          onSubmit={handleNameSubmit}
          className="flex flex-col items-center gap-4"
        >
          <input
            ref={inputRef}
            className="text-black px-5 py-2 rounded-xl shadow w-72 outline-none focus:ring-2 focus:ring-yellow-400 transition"
            type="text"
            placeholder="Name your dog..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            maxLength={20}
          />
          <button
            type="submit"
            className="bg-yellow-400 text-black px-6 py-2 rounded-full font-bold hover:bg-yellow-500 transition-all hover:scale-105 shadow"
          >
            Confirm Name
          </button>
        </form>
      )}
    </div>
  );
};

export default DogName;
