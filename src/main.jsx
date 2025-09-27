import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import store from "./redux/store.js";
import { attachAuthListener } from "@/redux/bootAuth.js";
import "./index.css";

attachAuthListener(store); // <-- single source of truth for auth state

ReactDOM.createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <BrowserRouter>
      <App />
      <bootAnalytics />
    </BrowserRouter>
  </Provider>
);
