import { renderApp } from "./index.jsx";
renderApp();
if (import.meta.hot) {
  import.meta.hot.accept(() => renderApp());
}
