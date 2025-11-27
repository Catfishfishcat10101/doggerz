// src/pages/Landing.jsx
// Doggerz: Main landing/start screen. Usage: <Landing /> is the marketing/start route.
// Accessibility: ARIA roles and meta tags are documented for SEO and screen readers.

import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

import PageContainer from "@/features/game/components/PageContainer.jsx";
import EnhancedDogSprite from "@/features/game/components/EnhancedDogSprite.jsx";
import { selectUser } from "@/redux/userSlice.js";
import { selectDog } from "@/features/game/redux/dogSlice.js";
import { DOG_STORAGE_KEY } from "@/redux/dogSlice.js";
import { useToast } from "@/components/ToastProvider.jsx";

import AnimatedBackground from "@/features/game/components/AnimatedBackground.jsx";
import MiniAdoptCTA from "@/features/game/components/MiniAdoptCTA.jsx";
import AchievementTicker from "@/features/game/components/AchievementTicker.jsx";
import CinematicIntro from "@/features/game/components/CinematicIntro.jsx";
import HowItWorksModal from "@/components/HowItWorksModal.jsx";
import { useState } from "react";

/**
 * Landing: Main landing/start screen for Doggerz.
 * - Brand, hero, calls to action, sprite showcase
 * - ARIA roles and meta tags for accessibility
 */
export default function Landing() {
  const user = useSelector(selectUser);
  const dog = useSelector(selectDog);

  const isLoggedIn = Boolean(user);
  const hasPup = Boolean(dog && dog.adoptedAt);

  // Primary CTA: always encourage adoption (routes to /adopt)
  const primaryHref = "/adopt";
  const primaryLabel = "Adopt a pup";

  // Secondary CTA: learn more about the project (opens modal)
  const secondaryLabel = "Learn More?";
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [naming, setNaming] = useState(true);
  const [nameInput, setNameInput] = useState("Pup");
  const [animating, setAnimating] = useState(true);
  const navigate = useNavigate();
  const toast = useToast();

  return (
    <>
      <PageContainer className="px-4 pb-16 pt-10">
        <CinematicIntro />
        <AnimatedBackground
          zip={
            typeof window !== "undefined"
              ? (() => {
                  try {
                    const s = window.localStorage.getItem("doggerz:settings");
                    if (s) return JSON.parse(s).zip;
                  } catch {}
                  return undefined;
                })()
              : undefined
          }
          useRealTime={
            typeof window !== "undefined"
              ? (() => {
                  try {
                    const s = window.localStorage.getItem("doggerz:settings");
                    if (s) return JSON.parse(s).useRealTime;
                  } catch {}
                  return false;
                })()
              : false
          }
        />

        <AchievementTicker />

        <div
          className="mx-auto flex flex-col gap-10 md:flex-row md:items-center md:justify-between lg:gap-24"
          aria-label="Landing hero layout"
        >
          {/* Left: marketing + CTAs */}
          <section className="flex-1 space-y-6" aria-label="Marketing intro">
            <div>
              <div className="inline-flex flex-col" aria-label="Doggerz brand">
                <span className="text-6xl font-extrabold tracking-tight text-emerald-400 drop-shadow-[0_8px_24px_rgba(0,0,0,0.6)]">
                  DOGGERZ
                </span>
              </div>
              <h2 className="mt-3 max-w-md text-sm font-medium leading-snug text-slate-300 md:text-base">
                {hasPup
                  ? "Your pup’s still ticking. Jump back in and keep them thriving."
                  : "Adopt your pup & keep them thriving in real time."}
              </h2>
            </div>

            <div
              className="mt-6 flex items-center gap-3"
              aria-label="Primary calls to action"
            >
              <MiniAdoptCTA
                primaryHref={primaryHref}
                primaryLabel={primaryLabel}
                onLearnMore={() => setShowHowItWorks(true)}
              />

              <button
                onClick={() => setShowHowItWorks(true)}
                className="inline-flex items-center justify-center rounded-md border border-zinc-700 bg-zinc-900/60 px-3 py-2 text-sm font-medium uppercase tracking-wide text-zinc-200 transition hover:-translate-y-0.5"
              >
                {secondaryLabel}
              </button>
            </div>

            {/* hero extras removed: only sprite shown on the right per request */}
          </section>

          {/* Right: live pup snapshot */}
          <section className="flex-1" aria-label="Sprite showcase">
            <style>{`
            @keyframes pup-jump { 0% { transform: translateY(0) } 30% { transform: translateY(-40px) } 70% { transform: translateY(6px) } 100% { transform: translateY(0) } }
            .pup-jump { animation: pup-jump 700ms ease; }
            .name-board { min-width: 160px; max-width: 260px; }
          `}</style>

            <div className="relative mx-auto flex max-w-lg items-center justify-center rounded-3xl border border-zinc-800 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 px-8 py-10 shadow-[0_18px_60px_rgba(0,0,0,0.7)]">
              <div className="pointer-events-none absolute -top-10 flex items-center justify-center w-full">
                <div className="name-board rounded-md bg-zinc-900/80 border border-zinc-800 px-3 py-2 text-sm text-emerald-200 text-center shadow">
                  {nameInput}
                </div>
              </div>

              <div
                className={`relative flex items-center justify-center ${animating ? "pup-jump" : ""}`}
              >
                <EnhancedDogSprite />
              </div>

              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-full flex items-center justify-center">
                {naming ? (
                  <input
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    onKeyDown={async (e) => {
                      if (e.key === "Enter") {
                        // Trigger adopt animation, save pup locally, then navigate to /game
                        try {
                          setAnimating(true);
                          try {
                            toast?.add(`${nameInput || "Pup"}: BARK!`);
                          } catch {}
                          // save dog locally
                          const now = Date.now();
                          const dog = {
                            id: `local-${now}`,
                            name: nameInput || "Pup",
                            adoptedAt: now,
                            level: 1,
                            xp: 0,
                            stats: {
                              hunger: 100,
                              happiness: 100,
                              energy: 100,
                              cleanliness: 100,
                              pottyProgress: 0,
                            },
                            lifeStage: "PUPPY",
                          };
                          window.localStorage.setItem(
                            DOG_STORAGE_KEY,
                            JSON.stringify(dog),
                          );
                          // small delay to show animation
                          setTimeout(() => {
                            navigate("/game");
                          }, 800);
                        } catch (err) {
                          console.error("Adopt flow failed", err);
                        }
                      }
                    }}
                    className="w-64 rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    placeholder="Name your pup"
                  />
                ) : (
                  <button
                    onClick={() => setNaming(true)}
                    className="rounded-md border border-zinc-800 px-3 py-2 text-sm text-zinc-200"
                  >
                    Name your pup
                  </button>
                )}
              </div>
            </div>
          </section>
        </div>
      </PageContainer>
      <HowItWorksModal
        open={showHowItWorks}
        onClose={() => setShowHowItWorks(false)}
      />
    </>
  );
}
