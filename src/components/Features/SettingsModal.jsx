import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { resetDogState, toggleSound } from "../../redux/dogSlice";
import "../../styles/Modal.css"; // <-- add this file below

export default function SettingsModal({ isOpen = true, onClose = () => {} }) {
  const dispatch = useDispatch();
  const soundEnabled = useSelector((state) => state.dog.soundEnabled);
  const dialogRef = useRef(null);

  // Close on ESC
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  // Simple focus trap (focus the dialog when opened)
  useEffect(() => {
    if (isOpen && dialogRef.current) {
      dialogRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackdrop = (e) => {
    if (e.target.classList.contains("modal-backdrop")) onClose();
  };

  const handleReset = () => {
    if (window.confirm("Are you sure? This will reset all dog progress!")) {
      dispatch(resetDogState());
      onClose();
    }
  };

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      onMouseDown={handleBackdrop}
    >
      <div
        className="modal-card"
        tabIndex={-1}
        ref={dialogRef}
        aria-label="Settings"
      >
        <button
          className="modal-close"
          onClick={onClose}
          aria-label="Close settings"
          title="Close"
        >
          ×
        </button>

        <h2 className="modal-title">⚙️ Settings</h2>

        <div className="modal-content">
          <label className="modal-row">
            <input
              type="checkbox"
              checked={soundEnabled}
              onChange={() => dispatch(toggleSound())}
            />
            <span>Sound Enabled</span>
          </label>

          <button className="btn-danger" onClick={handleReset}>
            Reset Dog (Danger)
          </button>

          <button className="btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}