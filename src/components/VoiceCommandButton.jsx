// src/components/VoiceCommandButton.jsx
// @ts-nocheck  // Remove this if you want TS to type-check this file

import React, { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { trainObedience } from "@/redux/dogSlice.js";

const hasSpeech =
  typeof window !== "undefined" &&
  ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

export const DEFAULT_COMMANDS = [
  { id: "sit", keywords: ["sit", "sit down"] },
  { id: "stay", keywords: ["stay"] },
  { id: "rollOver", keywords: ["roll over", "rollover", "roll"] },
  { id: "speak", keywords: ["speak", "bark", "talk"] },
];

function findCommandFromTranscript(text, commands) {
  const lower = (text || "").toLowerCase();
  for (const cmd of commands) {
    if (cmd.keywords?.some((k) => lower.includes(k))) return cmd.id;
  }
  return null;
}

/**
 * VoiceCommandButton
 * Props:
 * - mode: "hold" | "tap" (default: "hold")
 * - expectedCommand?: string (e.g., "sit")
 * - onCommand?: (data: { transcript: string, commandId: string|null, match:boolean }) => void
 * - onTranscript?: (transcript: string) => void
 * - commands?: Array<{id:string, keywords:string[]}>
 * - disabled?: boolean
 * - lang?: string (default: en-US)
 * - maxDurationMs?: number (default: 10000)
 * - className?: string (extra classes for the button)
 */
export default function VoiceCommandButton({
  mode = "hold",
  expectedCommand,
  onCommand,
  onTranscript,
  commands = DEFAULT_COMMANDS,
  disabled = false,
  lang = "en-US",
  maxDurationMs = 10_000,
  className = "",
}) {
  const dispatch = useDispatch();
  const recognitionRef = useRef(null);
  const timeoutRef = useRef(null);
  const visibilityStopRef = useRef(() => { });

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
    recognition.lang = lang;
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
      // Timeout to prevent infinite listening
      timeoutRef.current = setTimeout(() => {
        if (recognitionRef.current) {
          try {
            recognitionRef.current.stop();
            setError("Listening timeout. Try again.");
          } catch (e) {
            console.warn("[Voice] timeout stop error:", e);
          }
        }
      }, maxDurationMs);
    };

    recognition.onerror = (event) => {
      console.error("[Voice] recognition error:", event);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      switch (event?.error) {
        case "not-allowed":
        case "service-not-allowed":
          setError(
            "Microphone blocked. Enable mic permissions in your browser settings."
          );
          break;
        case "no-speech":
          setError("Didn’t hear anything. Try again closer to the mic.");
          break;
        default:
          setError("Speech recognition error. Try again.");
      }
      setIsListening(false);
    };

    recognition.onresult = (event) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      const transcript = Array.from(event.results)
        .map((r) => r?.[0]?.transcript || "")
        .join(" ")
        .trim();

      setLastTranscript(transcript);
      onTranscript?.(transcript);

      if (!transcript) {
        setLastCommand(null);
        setError("Heard silence. Try again.");
        return;
      }

      const commandId = findCommandFromTranscript(transcript, commands);
      setLastCommand(commandId);

      const match = expectedCommand
        ? Boolean(commandId && commandId.toLowerCase() === expectedCommand.toLowerCase())
        : Boolean(commandId);

      // Callback first if provided
      onCommand?.({ transcript, commandId, match });

      // Fallback to built-in training dispatch if no callback provided
      if (!onCommand && commandId) {
        dispatch(
          trainObedience({
            commandId,
            success: true,
          })
        );
      }

      if (!commandId) {
        setError(
          "Couldn’t catch a known command. Try 'sit', 'stay', 'roll over', or 'speak'."
        );
      } else {
        setError(null);
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

    // Stop listening when page/tab hides (prevents dangling mic)
    const handleVisibility = () => {
      if (document.hidden && recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch { }
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    visibilityStopRef.current = () =>
      document.removeEventListener("visibilitychange", handleVisibility);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      try {
        recognition.stop();
      } catch { }
      recognitionRef.current = null;
      visibilityStopRef.current?.();
    };
  }, [dispatch, commands, expectedCommand, lang, maxDurationMs, onCommand, onTranscript]);

  const startListening = () => {
    if (disabled || !hasSpeech || !recognitionRef.current) return;
    if (isListening && mode === "hold") return; // avoid double-start exceptions
    setError(null);
    setLastCommand(null);
    try {
      recognitionRef.current.start();
    } catch (e) {
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

  const toggleListening = () => {
    if (isListening) stopListening();
    else startListening();
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
          Your browser doesn&apos;t support in-browser speech recognition. Try
          Chrome on desktop for voice commands.
        </p>
      </div>
    );
  }

  const baseBtnClass = `w-full rounded-xl border px-4 py-2 text-sm font-semibold transition ${isListening ? "border-emerald-500 bg-zinc-900" : "border-zinc-700 bg-zinc-900 hover:bg-zinc-800"
    } ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`;

  return (
    <div className="space-y-2">
      {mode === "hold" ? (
        <button
          type="button"
          onPointerDown={startListening}
          onPointerUp={stopListening}
          onPointerCancel={stopListening}
          onContextMenu={(e) => e.preventDefault()}
          disabled={disabled}
          className={`${baseBtnClass} active:scale-[0.98]`}
          aria-pressed={isListening}
        >
          {isListening ? "Listening…" : "Hold to Train (Voice)"}
        </button>
      ) : (
        <button
          type="button"
          onClick={toggleListening}
          disabled={disabled}
          className={`${baseBtnClass} ${isListening ? "animate-pulse" : ""}`}
          aria-pressed={isListening}
        >
          {isListening ? "Listening… Tap to Stop" : "Tap to Train (Voice)"}
        </button>
      )}

      {lastTranscript && (
        <p className="text-xs text-zinc-400">
          Last heard:{" "}
          <span className="text-zinc-100">&ldquo;{lastTranscript}&rdquo;</span>
          {lastCommand && (
            <>
              {" "}→ mapped to {" "}
              <span className="font-semibold text-emerald-400">{lastCommand}</span>
              {expectedCommand && (
                <span
                  className={`ml-2 text-[11px] font-mono uppercase tracking-wide ${lastCommand?.toLowerCase() === expectedCommand.toLowerCase()
                      ? 'text-emerald-400'
                      : 'text-zinc-500'
                    }`}
                >
                  target: {expectedCommand}
                </span>
              )}
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
          {mode === "hold" ? " while holding the button." : " then tap again to stop."}
        </p>
      )}
    </div>
  );
}
