import React, {
  useMemo,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  increasePottyLevel,
  selectPottyLevel,
  selectIsPottyTrained,
  selectPottyStreak,
  selectPottyLastTrainedAt,
  markAccident,
} from "@/redux/dogSlice.js";
import { useNavigate } from "react-router-dom";
import ProgressBar from "@/UI/ProgressBar.jsx";
import {
  CheckCircle2,
  RotateCcw,
  ArrowLeft,
  Award,
  AlertTriangle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const COOLDOWN_MS = 600;
const TRAIN_STEP = 15;

export default function PottyTraining() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const pottyLevel = useSelector(selectPottyLevel);
  const isPottyTrained = useSelector(selectIsPottyTrained);
  const pottyStreak = useSelector(selectPottyStreak);
  const lastTrainedAt = useSelector(selectPottyLastTrainedAt);

  const [cooldown, setCooldown] = useState(false);
  const [showCongrats, setShowCongrats] = useState(false);
  const [message, setMessage] = useState("");
  const tRef = useRef(0);

  const progressLabel = useMemo(
    () => (isPottyTrained ? "Fully potty trained" : "Training in progress"),
    [isPottyTrained],
  );

  useEffect(() => {
    setMessage(
      isPottyTrained
        ? "Your dog is fully potty trained! 🎉"
        : "Keep training to reach 100%!",
    );
  }, [isPottyTrained]);

  useEffect(() => {
    if (isPottyTrained) setShowCongrats(true);
  }, [isPottyTrained]);

  const onTrain = useCallback(() => {
    if (cooldown || isPottyTrained) return;
    setCooldown(true);
    dispatch(increasePottyLevel(TRAIN_STEP));
    clearTimeout(tRef.current);
    tRef.current = setTimeout(() => setCooldown(false), COOLDOWN_MS);
  }, [cooldown, isPottyTrained, dispatch]);

  const onReset = useCallback(() => {
    dispatch(resetPottyLevel());
    setShowCongrats(false);
  }, [dispatch]);

  const onBack = useCallback(() => navigate("/game"), [navigate]);

  const onAccident = useCallback(() => {
    // If your reducer expects an object, use { amount: 10 }
    dispatch(markAccident(10));
  }, [dispatch]);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e) => {
      const tag = (e.target?.tagName || "").toLowerCase();
      if (tag === "input" || tag === "textarea" || e.target?.isContentEditable)
        return;

      // Prefer e.code for space to avoid IME/locale weirdness
      if ((e.code === "Space" || e.key === "Enter") && !cooldown) {
        e.preventDefault();
        onTrain();
      }
      if (e.key.toLowerCase() === "r") onReset();
      const k = e.key.toLowerCase();
      if (k === "b" || k === "arrowleft") onBack();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onTrain, onReset, onBack, cooldown]);

  useEffect(() => () => clearTimeout(tRef.current), []);

  const lastTrainedLabel = useMemo(() => {
    if (!lastTrainedAt) return "Not trained yet today.";
    try {
      const d = new Date(lastTrainedAt);
      return `Last trained: ${d.toLocaleString()}`;
    } catch {
      return "Last trained: unknown";
    }
  }, [lastTrainedAt]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 to-green-300 dark:from-slate-900 dark:to-slate-800 flex flex-col items-center justify-center p-4">
      <div className="bg-white/95 dark:bg-slate-900/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 md:p-8 max-w-lg w-full ring-1 ring-black/5 dark:ring-white/10">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl md:text-3xl font-extrabold text-green-900 dark:text-emerald-300 tracking-tight">
            🚽 Potty Training
          </h2>
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            aria-label="Back to game"
            title="Back to Game (B or ←)"
          >
            <ArrowLeft size={18} />
            <span className="hidden sm:inline">Back</span>
          </button>
        </div>

        {/* Progress */}
        <div className="mt-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-700 dark:text-white/80">
              Progress
            </span>
            <span className="font-mono text-sm text-gray-600 dark:text-white/70">
              {Math.round(pottyLevel)}%
            </span>
          </div>

          <ProgressBar
            value={pottyLevel}
            max={100}
            label={progressLabel}
            success={isPottyTrained}
          />

          <div
            className="mt-3 text-gray-700 dark:text-white/80"
            role="status"
            aria-live="polite"
          >
            {message}
          </div>

          <div className="mt-2 flex items-center gap-2 text-sm text-gray-600 dark:text-white/70">
            <Award size={16} className="opacity-80" />
            <span>
              Daily streak: <b>{pottyStreak}</b> day
              {pottyStreak === 1 ? "" : "s"}
            </span>
          </div>
          <div className="text-xs text-gray-500 dark:text-white/60 mt-1">
            {lastTrainedLabel}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-6">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={onTrain}
            disabled={isPottyTrained || cooldown}
            className={`px-4 py-2 rounded-lg font-semibold text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
              isPottyTrained
                ? "bg-green-500 cursor-not-allowed"
                : cooldown
                  ? "bg-yellow-400/70 cursor-wait"
                  : "bg-yellow-500 hover:bg-yellow-600"
            }`}
            aria-disabled={isPottyTrained || cooldown}
            title={
              isPottyTrained ? "Already fully trained" : "Train (Space/Enter)"
            }
          >
            Train Potty 🚾
          </motion.button>

          <button
            onClick={onReset}
            disabled={pottyLevel === 0}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-white/10 dark:hover:bg-white/20 dark:text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 disabled:opacity-60"
            title="Reset training (R)"
          >
            <div className="inline-flex items-center gap-2">
              <RotateCcw size={18} />
              Reset
            </div>
          </button>

          {/* Demo/QA: Accidents reduce progress slightly */}
          <button
            onClick={onAccident}
            className="ml-auto bg-red-100 hover:bg-red-200 text-red-800 dark:bg-rose-900/20 dark:hover:bg-rose-900/30 dark:text-rose-200 px-3 py-2 rounded-lg border border-red-200 dark:border-rose-700/40 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-400"
            title="Simulate accident (debug)"
          >
            <div className="inline-flex items-center gap-2">
              <AlertTriangle size={18} />
              Accident
            </div>
          </button>
        </div>
      </div>

      {/* Congrats modal */}
      <AnimatePresence>
        {showCongrats && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-label="Potty training complete"
          >
            <motion.div
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 w-full max-w-md text-center border border-black/10 dark:border-white/10"
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
            >
              <CheckCircle2 className="mx-auto text-green-600" size={64} />
              <h3 className="text-2xl font-bold mt-3">
                Potty Training Complete! 🎉
              </h3>
              <p className="text-gray-700 dark:text-white/80 mt-2">
                Your dog mastered potty training. Keep up daily reinforcement to
                maintain the habit.
              </p>
              <div className="mt-5 flex gap-2 justify-center">
                <button
                  onClick={() => setShowCongrats(false)}
                  className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/20 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
                >
                  Close
                </button>
                <button
                  onClick={() => navigate("/game")}
                  className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Back to Game
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
