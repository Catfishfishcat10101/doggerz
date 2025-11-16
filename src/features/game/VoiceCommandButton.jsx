// src/features/game/VoiceCommandButton.jsx
import React, { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { trainObedience } from "@/redux/dogSlice.js";

const hasSpeech =
  typeof window !== "undefined" &&
  ("SpeechRecognition" in window ||
    "webkitSpeechRecognition" in window);

const commandMap = [
  { id: "sit", keywords: ["sit", "sit down"] },
  { id: "stay", keywords: ["stay"] },
  { id: "rollOver", keywords: ["roll over", "rollover", "roll"] },
  { id: "speak", keywords: ["speak", "bark", "talk"] },
];

function findCommandFromTranscript(text) {
  const lower = text.toLowerCase();
  for (const cmd of commandMap) {
    if (cmd.keywords.some((k) => lower.includes(k))) {
      return cmd.id;
    }
  }
  return null;
}

export default function VoiceCommandButton() {
  const dispatch = useDispatch();
  const recognitionRef = useRef(null);
  const [isListening, setIsListening] = useState(false);
  const [lastTranscript, setLastTranscript] = useState("");
  const [lastCommand, setLastCommand] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!hasSpeech) return;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
      setLastTranscript("");
      setLastCommand(null);
    };

    recognition.onerror = (event) => {
      setIsListening(false);
      setError(event.error || "Voice recognition error.");
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setLastTranscript(transcript);

      const commandId = findCommandFromTranscript(transcript);
      setLastCommand(commandId);

      if (commandId) {
        dispatch(
          trainObedience({
            commandId,
            success: true,
          })
        );
      } else {
        setError("Didn’t catch a known command. Try 'sit', 'stay', 'roll over', or 'speak'.");
      }
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop?.();
      recognitionRef.current = null;
    };
  }, [dispatch]);

  const handleClick = () => {
    if (!hasSpeech) {
      setError("Voice recognition is not supported on this device/browser.");
      return;
    }
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.start();
    } catch (e) {
      // Chrome sometimes throws if already started
      console.warn(e);
    }
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleClick}
        className={`w-full rounded-xl border px-4 py-2 text-sm font-semibold
          ${isListening ? "border-emerald-500" : "border-zinc-700"}
          bg-zinc-900 hover:bg-zinc-800 active:scale-[0.98] transition`}
      >
        {isListening ? "Listening…" : "Hold to Train (Voice)"}
      </button>

      {lastTranscript && (
        <p className="text-xs text-zinc-400">
          Last heard: <span className="text-zinc-100">“{lastTranscript}”</span>
          {lastCommand && (
            <>
              {" "}
              → mapped to <span className="font-semibold">{lastCommand}</span>
            </>
          )}
        </p>
      )}

      {error && (
        <p className="text-xs text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
