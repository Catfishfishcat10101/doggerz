// src/features/game/components/VoiceCommandButton.jsx
// @ts-nocheck
//
// Doggerz: VoiceCommandButton
// - Uses Web Speech API (if available) to listen for simple commands.
// - Maps words like "sit", "stay", "roll over", "speak" to trainObedience.
// - Falls back to a simple "not supported" message if API is missing.

import React, { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { trainObedience } from "@/features/game/redux/dogSlice.js";

function getSpeechRecognition() {
  if (typeof window === "undefined") return null;
  const AnyWindow = window;
  return (
    AnyWindow.SpeechRecognition || AnyWindow.webkitSpeechRecognition || null
  );
}

export default function VoiceCommandButton() {
  const dispatch = useDispatch();
  const recognitionRef = useRef(null);

  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [lastHeard, setLastHeard] = useState("");
  const [lastCommand, setLastCommand] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Initialize recognition (if available) on mount
  useEffect(() => {
    const Recognition = getSpeechRecognition();
    if (!Recognition) {
      setSupported(false);
      return;
    }

    setSupported(true);
    const recognition = new Recognition();
    recognitionRef.current = recognition;

    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let finalTranscript = "";
      for (let i = 0; i < event.results.length; i++) {
        const res = event.results[i];
        if (res.isFinal) {
          finalTranscript += res[0].transcript;
        }
      }

      const transcript = (
        finalTranscript ||
        event.results[0]?.[0]?.transcript ||
        ""
      )
        .trim()
        .toLowerCase();

      if (!transcript) return;

      setLastHeard(transcript);
      const cmd = resolveCommandFromTranscript(transcript);

      if (cmd) {
        setLastCommand(cmd);
        dispatch(
          trainObedience({
            commandId: cmd,
            success: true,
            xp: 10,
            now: Date.now(),
          }),
        );
      }
    };

    recognition.onerror = (event) => {
      setErrorMessage(event.error || "voice error");
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };

    return () => {
      try {
        recognition.stop();
      } catch {
        // ignore
      }
    };
  }, [dispatch]);

  function resolveCommandFromTranscript(text) {
    const t = text.toLowerCase();

    // You can expand this list as needed.
    if (t.includes("sit")) return "sit";
    if (t.includes("stay")) return "stay";
    if (
      t.includes("roll over") ||
      t.includes("rollover") ||
      t.includes("roll")
    ) {
      return "rollOver";
    }
    if (t.includes("speak") || t.includes("bark")) return "speak";

    return null;
  }

  function handleToggleListening() {
    if (!supported || !recognitionRef.current) return;

    const recognition = recognitionRef.current;

    if (!listening) {
      setErrorMessage("");
      setLastHeard("");
      try {
        recognition.start();
        setListening(true);
      } catch (err) {
        setErrorMessage(err?.message || "Unable to start microphone");
        setListening(false);
      }
    } else {
      try {
        recognition.stop();
      } catch {
        // ignore
      }
      setListening(false);
    }
  }

  if (!supported) {
    return (
      <div className="space-y-1 text-xs text-zinc-400">
        <p className="font-semibold text-zinc-200">
          Voice training (microphone)
        </p>
        <p>
          This browser does not support the Web Speech API. You can still log
          training manually in the training panel.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-mono uppercase tracking-[0.18em] text-zinc-500">
            Voice training
          </p>
          <p className="text-xs text-zinc-300">
            Say commands like “sit”, “stay”, “roll over”, or “speak”.
          </p>
        </div>
        <div className="text-right text-[11px] text-zinc-400">
          <p className="font-mono">
            Mic:{" "}
            <span
              className={
                listening ? "text-emerald-300 font-semibold" : "text-zinc-400"
              }
            >
              {listening ? "Listening…" : "Idle"}
            </span>
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={handleToggleListening}
        className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 ${
          listening
            ? "border-emerald-400 bg-emerald-500/15 text-emerald-100 shadow-[0_0_16px_rgba(52,211,153,0.45)] focus-visible:ring-emerald-400"
            : "border-zinc-600 bg-zinc-900 text-zinc-100 hover:border-emerald-400 hover:bg-zinc-900/90 focus-visible:ring-emerald-400"
        }`}
        aria-pressed={listening}
      >
        <span
          className={`h-2 w-2 rounded-full ${
            listening ? "bg-emerald-400" : "bg-zinc-500"
          } shadow-[0_0_8px_rgba(52,211,153,0.6)]`}
        />
        {listening ? "Stop listening" : "Start voice training"}
      </button>

      <div className="space-y-1 text-[11px] text-zinc-400">
        {lastHeard && (
          <p className="font-mono">
            Heard: <span className="text-zinc-200">{lastHeard}</span>
          </p>
        )}
        {lastCommand && (
          <p className="font-mono text-emerald-300">
            Matched command: {lastCommand.toUpperCase()}
          </p>
        )}
        {errorMessage && (
          <p className="font-mono text-amber-300">Mic error: {errorMessage}</p>
        )}
      </div>
    </div>
  );
}
