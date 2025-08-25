import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // DO NOT set "root" here; default is project root (where index.html lives)
  // base: "/"  // fine for Firebase at site root
});
