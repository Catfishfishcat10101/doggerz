// src/components/UI/DogName.jsx
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

let setNameAction, selectNameSelector;
try {
  // Optional: if your slice provides these
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const dogSlice = require("../../redux/dogSlice");
  setNameAction = dogSlice.setName;
  selectNameSelector = dogSlice.selectName;
} catch {}

export default function DogName({ onSubmit }) {
  const dispatch = useDispatch();
  const reduxName = useSelector(selectNameSelector || (() => null));
  const [name, setName] = useState(reduxName || "");

  useEffect(() => {
    if (reduxName != null) setName(reduxName);
  }, [reduxName]);

  const submit = (e) => {
    e.preventDefault();
    if (setNameAction) dispatch(setNameAction(name));
    if (onSubmit) onSubmit(name);
  };

  return (
    <form onSubmit={submit} className="w-full max-w-md mx-auto p-4 bg-white rounded-2xl shadow">
      <label className="block text-sm font-medium text-emerald-900 mb-2">Name your dog</label>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Fireball"
        className="w-full px-3 py-2 rounded-xl border border-emerald-900/10 focus:outline-none focus:ring-2 focus:ring-emerald-400"
      />
      <button
        className="mt-3 w-full px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold hover:shadow active:scale-95"
        type="submit"
      >
        Save
      </button>
    </form>
  );
}
