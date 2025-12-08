// @ts-nocheck
// src/components/VoiceCommandButton.jsx
//
// Simple voice-command trigger using Web Speech API.
// When activated, sends recognized text back via onCommand() callback (optional).

import React, { useState, useRef } from "react";
import PropTypes from "prop-types";

export default function VoiceCommandButton({ onCommand }) {
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

  function startListening() {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice recognition not supported on this device.");
      return;
    }

    if (!recognitionRef.current) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (onCommand) onCommand(transcript);
        setListening(false);
      };

      recognitionRef.current.onerror = () => {
        setListening(false);
      };

      recognitionRef.current.onend = () => {
        setListening(false);
      };
    }

    setListening(true);
    recognitionRef.current.start();
  }

  return (
    <button
      onClick={startListening}
      className={`px-4 py-2 rounded-full border transition-all duration-300 ${listening ? "bg-emerald-600 border-emerald-400 text-white scale-105" : "bg-black/40 border-emerald-500/50 text-emerald-300"}`}
    >
      {listening ? "Listening…" : "Voice Command"}
    </button>
  );
}

VoiceCommandButton.propTypes = {
  onCommand: PropTypes.func,
};
