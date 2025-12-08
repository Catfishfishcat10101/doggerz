// src/config/polls.js
// Default poll configuration for Doggerz. Import this from `dogSlice` or
// override at runtime by providing your own configuration.

const DEFAULT_DOG_POLL_CONFIG = {
  prompts: [],
  // interval for automatic polling (0 = disabled)
  intervalMs: 0,
  // how long a poll waits before timing out
  timeoutMs: 60000,
};

export default DEFAULT_DOG_POLL_CONFIG;
