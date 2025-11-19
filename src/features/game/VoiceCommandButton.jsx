// src/features/game/VoiceCommandButton.jsx
import React, { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { trainObedience } from "@/redux/dogSlice.js";

const hasSpeech =
  typeof window !== "undefined" &&
  ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

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
  const timeoutRef = useRef(null);

  const [isListening, setIsListening] = useState(false);
  const [lastTranscript, setLastTranscript] = useState("");
  const [lastCommand, setLastCommand] = useState(null);
  const [error, setError] = useState(null);

  // Setup Web Speech recognition instance
  useEffect(() => {
    if (!hasSpeech) return;

    const SpeechRecognition =
      // @ts-ignore
      window.SpeechRecognition || window.webkitSpeechRecognition;

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);

      // Timeout after 10 seconds to prevent infinite listening
      timeoutRef.current = setTimeout(() => {
        if (recognitionRef.current) {
          try {
            recognitionRef.current.stop();
            setError("Listening timeout. Try again.");
          } catch (e) {
            console.warn("[Voice] timeout stop error:", e);
          }
        }
      }, 10000);
    };

    recognition.onerror = (event) => {
      console.error("[Voice] recognition error:", event);
      if (event.error === "not-allowed") {
        setError("Mic access blocked. Check browser permissions.");
      } else if (event.error === "no-speech") {
        setError("Didn’t hear anything. Try again a bit closer to the mic.");
      } else {
        setError("Speech recognition error. Try again.");
      }
      setIsListening(false);
    };

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((r) => r[0]?.transcript || "")
        .join(" ")
        .trim();

      if (!transcript) {
        setLastTranscript("");
        setLastCommand(null);
        setError("Heard silence. Try again.");
        return;
      }

      setLastTranscript(transcript);

      const commandId = findCommandFromTranscript(transcript);
      setLastCommand(commandId);

      if (commandId) {
        // Hook into your training reducer
        dispatch(
          trainObedience({
            commandId,
            success: true,
          })
        );
        setError(null);
      } else {
        setError(
          "catch a known command. Try 'sit', 'stay', 'roll over', or 'speak'."
        );
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      try {
        recognition.stop();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    };
  }, [dispatch]);

  const startListening = () => {
    if (!hasSpeech || !recognitionRef.current) return;
    if (isListening) return; // avoid double-start exceptions

    setError(null);
    setLastCommand(null);

    try {
      recognitionRef.current.start();
    } catch (e) {
      // Chrome throws if start() is called twice
      console.warn("[Voice] start error:", e);
    }
  };

  const stopListening = () => {
    if (!hasSpeech || !recognitionRef.current) return;
    try {
      recognitionRef.current.stop();
    } catch (e) {
      console.warn("[Voice] stop error:", e);
    }
  };

  if (!hasSpeech) {
    return (
      <div className="space-y-2">
        <button
          type="button"
          disabled
          className="w-full cursor-not-allowed rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-2 text-sm font-semibold text-zinc-500"
        >
          Voice Training Not Supported
        </button>
        <p className="text-xs text-zinc-500">
          Your browser doesn't support in-browser speech recognition. Try
          Chrome on desktop for voice commands.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        // “Hold to train” UX
        onMouseDown={startListening}
        onMouseUp={stopListening}
        onMouseLeave={stopListening}
        onTouchStart={startListening}
        onTouchEnd={stopListening}
        className={`w-full rounded-xl border px-4 py-2 text-sm font-semibold transition active:scale-[0.98]
          ${isListening ? "border-emerald-500 bg-zinc-900" : "border-zinc-700 bg-zinc-900 hover:bg-zinc-800"}`}
      >
        {isListening ? "Listening…" : "Hold to Train (Voice)"}
      </button>

      {lastTranscript && (
        <p className="text-xs text-zinc-400">
          Last heard:{" "}
          <span className="text-zinc-100">&ldquo;{lastTranscript}&rdquo;</span>
          {lastCommand && (
            <>
              {" "}
              → mapped to{" "}
              <span className="font-semibold text-emerald-400">
                {lastCommand}
              </span>
            </>
          )}
        </p>
      )}

      {error && <p className="text-xs text-red-400">{error}</p>}

      {!error && !lastTranscript && (
        <p className="text-[11px] text-zinc-500">
          Try saying{" "}
          <span className="font-medium text-zinc-300">
            &quot;sit&quot;, &quot;stay&quot;, &quot;roll over&quot;
          </span>{" "}
          or <span className="font-medium text-zinc-300">&quot;speak&quot;</span>{" "}
          while holding the button.
        </p>
      )}
    </div>
  );
}
