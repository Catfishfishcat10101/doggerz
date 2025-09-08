// src/components/UI/DogName.jsx
import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setDogName } from "../../redux/dogSlice.js";
import { Helmet } from "react-helmet-async"; // Optional: for meta title SEO

const DogName = () => {
  const dispatch = useDispatch();
  const currentName = useSelector((state) => state.dog.name);
  const [input, setInput] = useState("");
  const [editing, setEditing] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if ((!currentName || editing) && inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentName, editing]);

  const handleNameSubmit = (e) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (trimmed.length > 0) {
      dispatch(setDogName(trimmed));
      setInput("");
      setEditing(false);
    }
  };

  const handleRename = () => {
    setEditing(true);
    setInput(currentName);
  };

  return (
    <div className="mb-6 text-center animate-fadeIn">
      {/* Meta title for SEO */}
      <Helmet>
        <title>{currentName ? `🐾 Meet ${currentName}` : "Name Your Dog"}</title>
      </Helmet>

      {currentName && !editing ? (
        <div className="space-y-4">
          <h2 className="text-3xl font-extrabold text-yellow-300 drop-shadow-md transition-opacity duration-500">
            🐶 Meet <span className="underline">{currentName}</span>!
          </h2>
          <button
            onClick={handleRename}
            className="text-sm text-yellow-200 hover:underline focus:outline-none"
          >
            Rename Dog
          </button>
        </div>
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
