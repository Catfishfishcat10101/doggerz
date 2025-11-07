import { Outlet } from "react-router-dom";
import ErrorBoundary from "./ErrorBoundary";
import NavBar from "./NavBar";
import Footer from "./Footer";
import FirebaseAutoSave from "./FirebaseAutoSave";
import InstallPrompt from "./InstallPrompt";

export default function RootLayout() {
  return (
    <>
      <ErrorBoundary>
        <NavBar />
        <main className="min-h-[calc(100dvh-3.5rem-3rem)] bg-[#0b1020]">
          {/* Autosave while the app runs */}
          <FirebaseAutoSave />
          {/* PWA CTA */}
          <InstallPrompt />
          <Outlet />
        </main>
        <Footer />
      </ErrorBoundary>
    </>
  );
}