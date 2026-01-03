// src/pages/Help.jsx
import { Link } from "react-router-dom";

import Header from "@/components/Header.jsx";
import Footer from "@/components/Footer.jsx";

export default function HelpPage() {
  return (
    <>
      <Header />
      <div className="flex-1 px-6 py-10 flex justify-center">
        <div className="max-w-3xl w-full space-y-6">
          <h1 className="text-3xl font-black tracking-tight">Help</h1>

          <p className="text-sm text-zinc-300">
            Need a hand? Here are the quickest ways to get unstuck.
          </p>

          <section className="space-y-2 text-sm text-zinc-300">
            <h2 className="font-semibold text-zinc-100">Common fixes</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>Try refreshing the page if something looks frozen.</li>
              <li>If you installed the app, restarting it can clear stale state.</li>
              <li>Check your connection if sign-in isn’t working.</li>
            </ul>
          </section>

          <section className="space-y-2 text-sm text-zinc-300">
            <h2 className="font-semibold text-zinc-100">Need support?</h2>
            <p>
              Reach out via <Link to="/contact" className="text-emerald-300 hover:text-emerald-200">Contact Us</Link>.
            </p>
          </section>

          <div className="pt-2 text-sm">
            <Link to="/" className="text-emerald-300 hover:text-emerald-200">← Back to home</Link>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
