// src/components/Features/TricksTrainer.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import useGameClock from "../../hooks/useGameClock";
import useKeyboardShortcuts from "../../hooks/useKeyboardShortcuts";
import {
  addCoins,
  addXP,
  changeHappiness,
  learnTrick,
} from "../../redux/dogSlice";

const TRICKS = /** @type {const} */ ([
  { name: "sit", label: "Sit", key: "s", type: "tap" },
  { name: "stay", label: "Stay", key: "k", type: "hold", holdSec: 1.5 },
  { name: "paw", label: "Paw", key: "p", type: "tap" },
  { name: "rollOver", label: "Roll Over", key: "r", type: "tap" },
]);

export default function TricksTrainer() {
  const dispatch = useDispatch();
  const { delta } = useGameClock({ running: true, speed: 1 });

  const [round, setRound] = useState(1);
  const [prompt, setPrompt] = useState(() => TRICKS[Math.floor(Math.random() * TRICKS.length)]);
  const [timeLeft, setTimeLeft] = useState(3.0);  // seconds to act
  const [holdLeft, setHoldLeft] = useState(0);    // for "stay"
  const [combo, setCombo] = useState(0);
  const [msg, setMsg] = useState("Press the right key in time!");

  const difficulty = useMemo(() => {
    // Scale: faster timers as combo grows; floor to keep it fair
    const base = 3.0;
    const min = 1.4;
    return Math.max(min, base - combo * 0.1);
  }, [combo]);

  // New round
  const nextPrompt = () => {
    const next = TRICKS[Math.floor(Math.random() * TRICKS.length)];
    setPrompt(next);
    setTimeLeft(difficulty);
    setHoldLeft(next.type === "hold" ? (next.holdSec ?? 1.5) : 0);
    setRound((r) => r + 1);
  };

  // Decrement timers
  useEffect(() => {
    setTimeLeft((t) => Math.max(0, t - delta));
    if (prompt.type === "hold" && holdLeft > 0 && isHoldingRef.current) {
      setHoldLeft((h) => Math.max(0, h - delta));
    }
  }, [delta]); // eslint-disable-line

  // Failure when timer runs out
  useEffect(() => {
    if (timeLeft > 0) return;
    // failed the round
    setCombo(0);
    setMsg(`Too slow! Lost the round.`);
    dispatch(changeHappiness(-2));
    nextPrompt();
  }, [timeLeft]); // eslint-disable-line

  // Key handling (tap or hold)
  const isHoldingRef = useRef(false);

  useKeyboardShortcuts(
    {
      [prompt.key]: (e) => {
        if (prompt.type === "tap") {
          succeed(prompt.name);
        } else {
          // start holding for "Stay"
          if (!isHoldingRef.current) {
            isHoldingRef.current = true;
            setMsg("Hold… hold…");
          }
        }
      },
    },
    { enabled: true, preventDefault: true, allowRepeat: false }
  );

  // Release handler for hold action
  useEffect(() => {
    const onKeyUp = (ev) => {
      if (prompt.type !== "hold") return;
      if (ev.key?.toLowerCase() === prompt.key) {
        if (holdLeft <= 0.02) {
          succeed(prompt.name);
        } else {
          // released too soon
          isHoldingRef.current = false;
          setCombo(0);
          setMsg("Released too early! Try again.");
          dispatch(changeHappiness(-2));
          nextPrompt();
        }
      }
    };
    window.addEventListener("keyup", onKeyUp);
    return () => window.removeEventListener("keyup", onKeyUp);
  }, [prompt, holdLeft]); // eslint-disable-line

  function succeed(trickName) {
    isHoldingRef.current = false;
    // reward scales a bit with combo
    const deltaSkill = 2 + Math.floor(combo / 3);
    const xp = 5 + Math.floor(combo / 5);
    const coins = 3 + Math.floor(combo / 4);
    dispatch(learnTrick({ name: trickName, delta: deltaSkill }));
    dispatch(addXP(xp));
    dispatch(addCoins(coins));
    dispatch(changeHappiness(+2));
    setCombo((c) => c + 1);
    setMsg(`Great! +${deltaSkill} ${trickName}, +${xp} XP, +${coins} coins`);
    nextPrompt();
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center bg-gradient-to-br from-indigo-50 to-purple-100">
      {/* Header */}
      <div className="w-full max-w-4xl px-4 py-3 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-indigo-900">Tricks Trainer</h2>
        <Link to="/game" className="px-3 py-2 rounded-xl bg-white shadow hover:shadow-md active:scale-95">
          ← Back to Game
        </Link>
      </div>

      {/* Trainer Card */}
      <div className="w-full max-w-3xl px-4">
        <div className="rounded-2xl bg-white shadow p-6">
          <div className="flex items-center justify-between">
            <div className="text-indigo-900">
              <div className="text-sm opacity-70">Round</div>
              <div className="text-2xl font-bold">{round}</div>
            </div>

            <div className="text-center">
              <div className="text-sm opacity-70">Prompt</div>
              <div className="text-3xl font-extrabold text-indigo-700 tracking-wide">
                {prompt.label}
              </div>
              <div className="text-xs mt-1 text-indigo-900/70">
                Press <span className="font-mono uppercase">{prompt.key}</span>
                {prompt.type === "hold" ? " and hold" : ""}.
              </div>
            </div>

            <div className="text-right text-indigo-900">
              <div className="text-sm opacity-70">Time Left</div>
              <div className="text-2xl font-bold">{timeLeft.toFixed(1)}s</div>
            </div>
          </div>

          {/* Hold progress for "Stay" */}
          {prompt.type === "hold" && (
            <div className="mt-6">
              <div className="text-sm text-indigo-900/70 mb-1">Hold meter</div>
              <div className="h-3 w-full bg-indigo-100 rounded">
                <div
                  className="h-3 bg-indigo-500 rounded"
                  style={{ width: `${Math.max(0, 100 * (1 - holdLeft / (prompt.holdSec ?? 1.5)))}%` }}
                />
              </div>
            </div>
          )}

          {/* Status message */}
          <div className="mt-6 text-indigo-900">{msg}</div>

          {/* Difficulty hint */}
          <div className="mt-2 text-xs text-indigo-900/60">
            Difficulty scales with combo. Sit (S), Stay (K hold), Paw (P), Roll Over (R).
          </div>
        </div>
      </div>
    </div>
  );
}
