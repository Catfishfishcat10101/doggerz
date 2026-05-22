// src/data/loadingTips.js

export const loadingTips = Object.freeze([
  {
    title: "ONE DOG",
    desc: "Build a bond with your dog that remembers you.",
  },
  {
    title: "REAL HABITS",
    desc: "Potty training, obedience, and daily routines.",
  },
  {
    title: "LIVING YARD",
    desc: "Day & Night, weather, and behavior changes over time",
  },
]);

/**
 * Starts a rotating tip cycle on the loading screen.
 * Rotates through loadingTips every 3500ms.
 *
 * @param {HTMLElement} [titleEl] - Element with id 'loading-tip-title'
 * @param {HTMLElement} [descEl] - Element with id 'loading-tip-desc'
 * @returns {() => void} Cleanup function to stop the rotation
 */
export function initLoadingTipRotation(titleEl, descEl) {
  if (!titleEl || !descEl) return () => {};

  let currentIndex = 0;

  const updateTip = () => {
    const tip = loadingTips[currentIndex];

    // Fade out
    titleEl.classList.add("opacity-0");
    descEl.classList.add("opacity-0");

    setTimeout(() => {
      titleEl.textContent = tip.title;
      descEl.textContent = tip.desc;

      // Fade in
      titleEl.classList.remove("opacity-0");
      descEl.classList.remove("opacity-0");

      currentIndex = (currentIndex + 1) % loadingTips.length;
    }, 200);
  };

  // Set initial tip
  updateTip();

  // Rotate every 3500ms
  const intervalId = setInterval(updateTip, 3500);

  // Return cleanup function
  return () => clearInterval(intervalId);
}
