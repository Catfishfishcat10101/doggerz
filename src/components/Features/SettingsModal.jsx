// src/components/Features/SettingsModal.jsx
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { resetDogState } from "../../redux/dogSlice";
import { useNavigate } from "react-router-dom";

export default function SettingsModal({ isOpen = true, onClose = () => {} }) {
  const dispatch = useDispatch();
  const soundEnabled = useSelector((state) => state.dog.soundEnabled);

  // Handler for resetting dog state
  const handleReset = () => {
    if (window.confirm("Are you sure? This will reset all dog progress!")) {
      dispatch(resetDogState());
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-2xl text-gray-500 hover:text-gray-800"
          title="Close"
        >
          ×
        </button>
        <h2 className="text-2xl font-bold mb-4 text-gray-900">⚙️ Settings</h2>
        <div className="flex flex-col gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={soundEnabled}
              // onChange={...}  // Implement toggling in your Redux if you want!
              disabled
            />
            <span className="font-semibold text-gray-700">Sound Enabled</span>
          </label>
          <button
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold"
            onClick={handleReset}
          >
            Reset Dog (Danger)
          </button>
          <button
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
