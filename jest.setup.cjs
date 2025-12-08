// Polyfill fetch for tests (used by firebase in node environment)
try {
  require("cross-fetch/polyfill");
} catch (e) {
  // If cross-fetch isn't installed yet, tests will fail until we install it.
}
