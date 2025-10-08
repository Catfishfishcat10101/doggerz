// src/layout/RootLayout.jsx
import AuthListener from "@/components/Auth/AuthListener.jsx";
export default function RootLayout() {
  return (
    <>
      <AuthListener />
      {/* Header/Nav */}
      <main className="container mx-auto px-4 py-6">
        <Outlet />
      </main>
      {/* Footer */}
    </>
  );
}
