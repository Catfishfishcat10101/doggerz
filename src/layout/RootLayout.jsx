// src/layout/RootLayout.jsx
import { Outlet } from "react-router-dom";

import ErrorBoundary from "./ErrorBoundary.jsx";
import NavBar from "./NavBar.jsx";
import Footer from "./Footer.jsx";
import FirebaseAutoSave from "./FirebaseAutoSave.jsx";
import InstallPrompt from "./InstallPrompt.jsx";

export default function RootLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-bgd-900 text-zinc-100">
      {/* Autosave while the app runs */}
      <FirebaseAutoSave />
      {/* PWA install CTA */}
      <InstallPrompt />

      <NavBar />

      <main className="flex-1">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>

      <Footer />
    </div>
  );
}