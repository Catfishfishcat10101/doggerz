// Keep the entry super minimal. It matches the script in /index.html.
import { renderApp } from "./index.jsx";

renderApp();

// Optional: HMR accept to avoid full reloads while editing.
if (import.meta.hot) {
  import.meta.hot.accept(() => {
    // Re-render on hot updates without losing state
    renderApp();
  });
}