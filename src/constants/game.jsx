// src/pages/Game.jsx
// @ts-nocheck

import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { selectDog } from "@/redux/dogSlice.js";
import { getCleanlinessEffects } from "@/constants/game.jsx";

import GameTopBar from "@/components/GameTopBar.jsx";
import EnhancedDogSprite from "@/components/EnhancedDogSprite.jsx";
import NeedsDashboard from "@/features/game/components/NeedsDashboard.jsx";
import VoiceCommandButton from "@/features/game/VoiceCommandButton.jsx";

/**
 * Single-yard background using CSS to fake night mode.
 */
function getYardBackgroundStyle() {
  const hour = new Date().getHours();
  const isNight = hour < 6 || hour >= 19;

  if (!isNight) {
    return {
      backgroundImage: "url(/backgrounds/yard_day.png)",
      backgroundSize: "cover",
      backgroundPosition: "center",
    };
  }

  // Night: same yard, darkened with a bluish overlay
  return {
    backgroundImage: `
      linear-gradient(
        rgba(0, 8, 32, 0.85),
        rgba(0, 0, 0, 0.95)
      ),
      url(/backgrounds/yard_day.png)
    `,
    backgroundSize: "cover",
    backgroundPosition: "center",
    filter: "brightness(0.4) saturate(0.85)",
  };
}

/**
 * Derive potty text from dog state if present.
 */
function getPottyStatus(dog) {
  if (!dog || !dog.potty) return "Learning the routine.";

  const training = Math.round(dog.potty.training ?? 0);
  if (training >= 100) return "Fully potty trained. Accidents are rare.";
  if (training >= 70) return "Mostly trained, occasional accidents.";
  if (training >= 40) return "Getting the hang of it.";
  if (training > 0) return "Just starting training.";
  return "Not potty trained yet.";
}

/**
 * Cheap mood system based on basic stats + cleanliness tier.
 */
function deriveMoodLabel(dog) {
  if (!dog) return "Unknown";

  const hunger = Number(dog.hunger ?? 0); // higher = hungrier
  const happiness = Number(dog.happiness ?? 0);
  const energy = Number(dog.energy ?? 0);
  const cleanliness = Number(dog.cleanliness ?? 0);

  const { tier } = getCleanlinessEffects(cleanliness);

  // Very rough – you can tune later.
  if (tier === "MANGE") return "Unwell";
  if (happiness >= 80 && hunger <= 30 && energy >= 40) return "Thriving";
  if (happiness >= 55 && hunger <= 55) return "Content";
  if (hunger >= 75) return "Very hungry";
  if (energy <= 20) return "Exhausted";

  return "A little off";
}

/**
 * Main game page component.
 */
export default function GamePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const dog = useSelector(selectDog);

  // If no pup exists, bounce to adoption.
  useEffect(() => {
    if (!dog) {
      navigate("/adopt", { replace: true });
    }
  }, [dog, navigate]);

  if (!dog) {
    return (
      <div className='min-h-[calc(100vh-7rem)] bg-zinc-950 text-zinc-50 flex items-center'>
        <div className='container mx-auto px-4 max-w-lg space-y-4'>
          <h1 className='text-2xl font-bold'>No pup yet</h1>
          <p className='text-sm text-zinc-300'>
            You don&apos;t have a Doggerz pup adopted on this device yet. Adopt
            your first pup to start the journey.
          </p>
          <button
            type='button'
            onClick={() => navigate("/adopt")}
            className='rounded-full bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-semibold px-5 py-2.5 transition'>
            Adopt your pup
          </button>
        </div>
      </div>
    );
  }

  const needs = {
    hunger: dog.hunger ?? 0,
    happiness: dog.happiness ?? 0,
    energy: dog.energy ?? 0,
    cleanliness: dog.cleanliness ?? 0,
  };

  const pottyText = getPottyStatus(dog);

  const cleanlinessValue = Number(dog.cleanliness ?? 0);
  const { label: cleanlinessLabel, journalSummary } =
    getCleanlinessEffects(cleanlinessValue);

  const yardCleanText =
    typeof dog.yardCleanliness === "string"
      ? dog.yardCleanliness
      : dog.yardIsSpotless
      ? "Yard is spotless"
      : "Yard needs a cleanup soon";

  const moodLabel = deriveMoodLabel(dog);

  // NOTE: these are plain string action types on purpose.
  // Redux won't explode if you haven't added reducers yet;
  // it just ignores unknown actions. You can wire them up later.
  const handleFeed = () => {
    dispatch({ type: "dog/FEED_ONCE" });
  };

  const handlePlay = () => {
    dispatch({ type: "dog/PLAY_ONCE" });
  };

  const handleBathe = () => {
    dispatch({ type: "dog/BATHE_ONCE" });
  };

  const handlePottyWalk = () => {
    dispatch({ type: "dog/POTTY_SUCCESS", payload: Date.now() });
  };

  const handleScoopYard = () => {
    dispatch({ type: "dog/SCOOP_YARD", payload: Date.now() });
  };

  return (
    <div className='min-h-[calc(100vh-7rem)] bg-zinc-950 text-zinc-50'>
      <div className='container mx-auto px-3 sm:px-4 py-6 lg:py-8 max-w-5xl space-y-4'>
        {/* Trainer / coins / streak bar */}
        <GameTopBar />

        {/* Main game card */}
        <section className='mt-3 rounded-3xl border border-zinc-800/90 bg-gradient-to-b from-zinc-950 to-zinc-900/90 shadow-xl shadow-black/50 overflow-hidden'>
          {/* Card header: name + mood + cleanliness summary */}
          <div className='px-4 pt-4 pb-3 border-b border-zinc-800/80 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
            <div className='space-y-0.5'>
              <p className='text-xs uppercase tracking-[0.22em] text-emerald-400/90'>
                Your pup
              </p>
              <h2 className='text-lg font-semibold'>
                {dog.name || "Pup"}{" "}
                <span className='text-xs text-zinc-400 font-normal'>
                  • Level {dog.level ?? 1}
                </span>
              </h2>
              <p className='text-[11px] text-zinc-400'>
                Check in, feed them, keep them clean — Doggerz tracks time while
                you&apos;re away.
              </p>
            </div>

            <div className='flex flex-col items-start sm:items-end gap-1 text-xs'>
              <div className='flex items-center gap-2'>
                <span className='px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-700 text-[11px] text-zinc-200'>
                  Mood: <span className='font-semibold'>{moodLabel}</span>
                </span>
                <span className='px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-700 text-[11px] text-zinc-200'>
                  Cleanliness:{" "}
                  <span className='font-semibold'>{cleanlinessLabel}</span>
                </span>
              </div>
              {journalSummary && (
                <p className='text-[11px] text-zinc-400 max-w-sm text-right'>
                  {journalSummary}
                </p>
              )}
            </div>
          </div>

          {/* Main content grid */}
          <div className='px-4 pb-4 pt-3 grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1.1fr)]'>
            {/* LEFT: Stage + potty + voice training */}
            <div className='space-y-3'>
              {/* Stage */}
              <div
                className='relative w-full h-[240px] sm:h-[280px] rounded-3xl overflow-hidden shadow-lg shadow-black/70 border border-zinc-800/80'
                style={getYardBackgroundStyle()}>
                <div className='absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none' />
                <div className='relative w-full h-full flex items-center justify-center'>
                  <EnhancedDogSprite />
                </div>
              </div>

              {/* Potty + yard status */}
              <div className='rounded-2xl border border-zinc-800 bg-zinc-950/70 px-3 py-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2'>
                <p className='text-xs text-zinc-300'>
                  <span className='font-semibold text-zinc-100'>Potty:</span>{" "}
                  {pottyText}
                </p>
                <p className='text-xs text-zinc-400'>
                  <span className='font-semibold text-zinc-100'>Yard:</span>{" "}
                  {yardCleanText}
                </p>
              </div>

              {/* Voice training block */}
              <div className='rounded-2xl border border-zinc-800 bg-zinc-950/80 px-3 py-3 space-y-2'>
                <p className='text-xs font-semibold text-zinc-100'>
                  Training drills
                </p>
                <p className='text-[11px] text-zinc-400'>
                  Hold the button and say{" "}
                  <span className='font-medium text-zinc-200'>
                    “sit”, “stay”, “roll over”
                  </span>{" "}
                  or <span className='font-medium text-zinc-200'>“speak”</span>{" "}
                  to run voice-based obedience training.
                </p>
                <VoiceCommandButton />
              </div>
            </div>

            {/* RIGHT: Needs + action buttons */}
            <div className='space-y-3'>
              {/* Needs dashboard */}
              <NeedsDashboard needs={needs} />

              {/* Action panel */}
              <div className='bg-zinc-900/80 border border-zinc-700/80 rounded-2xl p-3 shadow-lg shadow-black/50 space-y-3'>
                <p className='text-sm font-semibold text-zinc-100'>Actions</p>

                <div className='grid grid-cols-2 gap-2 text-sm'>
                  <button
                    type='button'
                    onClick={handleFeed}
                    className='rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold py-2 transition'>
                    🍖 Feed
                  </button>

                  <button
                    type='button'
                    onClick={handlePlay}
                    className='rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold py-2 transition'>
                    🐾 Play
                  </button>

                  <button
                    type='button'
                    onClick={handleBathe}
                    className='rounded-xl bg-sky-500 hover:bg-sky-400 text-black font-semibold py-2 transition'>
                    🛁 Bathe
                  </button>

                  <button
                    type='button'
                    onClick={handlePottyWalk}
                    className='rounded-xl bg-indigo-500 hover:bg-indigo-400 text-black font-semibold py-2 transition'>
                    🚶 Potty Walk
                  </button>
                </div>

                <button
                  type='button'
                  onClick={handleScoopYard}
                  className='w-full rounded-xl border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-xs text-zinc-200 py-2 transition'>
                  🧹 Scoop yard
                </button>

                <p className='text-[11px] text-zinc-500'>
                  Tip: Feed → Potty Walk → Play → Rest is a good daily rhythm to
                  keep hunger, energy, and potty training in a healthy range.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
// src/constants/game.js