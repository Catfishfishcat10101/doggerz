// src/layout/AppShellContext.js
import * as React from "react";

export const AppShellContext = React.createContext({
  withinAppShell: false,
  mainId: "app-main",
});
