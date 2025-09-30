import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import store from "./redux/store";
import "./index.css";
import "./styles.css";
import "@fontsource/inter/variable.css"; // or /400.css etc.
import "@/styles.css"; // or index.css


// If you have Firebase init, load it once here so providers are ready app-wide
// import "@/lib/firebase";

/** Minimal error boundary to avoid white screens on unexpected crashes */
class RootErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, err: null };
  }
  static getDerivedStateFromError(err) {
    return { hasError: true, err };
  }
  componentDidCatch(err, info) {
    // TODO: wire to your telemetry if you want
    console.error("RootErrorBoundary:", err, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-dvh grid place-items-center bg-zinc-950 text-zinc-100 p-6">
          <div className="max-w-lg w-full space-y-4">
            <h1 className="text-2xl font-bold">Something broke.</h1>
            <p className="opacity-80">
              The UI crashed. Check the console for details. A hard refresh usually clears transient state issues.
            </p>
            <button
              className="rounded-xl bg-emerald-500 px-4 py-2 font-semibold text-zinc-900 hover:bg-emerald-400"
              onClick={() => location.reload()}
            >
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <RootErrorBoundary>
          <App />
        </RootErrorBoundary>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);