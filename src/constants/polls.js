// src/constants/polls.js
// Dog poll configuration for Doggerz

export const DOG_POLL_CONFIG = {
  intervalMs: 1000 * 60 * 25, // ~25 minutes
  timeoutMs: 1000 * 60 * 2, // 2 minutes
  prompts: [
    {
      id: "walk_outside",
      prompt: "Could we go outside for a quick walk?",
      effects: {
        happiness: +10,
        energy: -5,
        cleanliness: -3,
      },
    },
    {
      id: "play_fetch",
      prompt: "I brought you a toy. Want to play fetch?",
      effects: {
        happiness: +12,
        energy: -8,
      },
    },
    {
      id: "snack_time",
      prompt: "I’m feeling snacky. Maybe a small treat?",
      effects: {
        hunger: -15,
        happiness: +6,
      },
    },
    {
      id: "bath_suggestion",
      prompt: "I feel kind of grimy. Is it bath time?",
      effects: {
        cleanliness: +25,
        happiness: -4,
      },
    },
  ],
};

// Add more poll-related constants or helpers here as needed
