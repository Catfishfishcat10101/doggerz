// src/main.jsx
import { renderApp } from "./index.jsx";

renderApp();

// HMR: re-render without losing state while editing
if (import.meta.hot) {
  import.meta.hot.accept(() => renderApp());
}
