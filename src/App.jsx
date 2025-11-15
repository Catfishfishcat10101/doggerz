// src/App.jsx
import React, { useState } from "react";
import {
  Routes,
  Route,
  Link,
  useNavigate,
} from "react-router-dom";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { auth } from "@/firebase.js";
import MainGame from "@/features/game/MainGame.jsx";

/* ---------- Layout shell (header + footer) ---------- */

function AppShell({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-50">
      <header className="border-b border-zinc-800 bg-zinc-950/90 backdrop-blur">
        <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-baseline gap-2">
            <span className="text-2xl font-black tracking-tight">
              Doggerz
            </span>
            <span className="text-xs uppercase tracking-[0.2em] text-zinc-400">
              Virtual Pup Simulator
            </span>
          </Link>

          <nav className="flex items-center gap-4 text-sm">
            <Link
              to="/"
              className="text-zinc-300 hover:text-white transition"
            >
              Home
            </Link>
            <Link
              to="/about"
              className="text-zinc-300 hover:text-white transition"
            >
              About
            </Link>
            <Link
              to="/contact"
              className="text-zinc-300 hover:text-white transition"
            >
              Contact
            </Link>
            <div className="w-px h-5 bg-zinc-700 mx-1" />
            <Link
              to="/login"
              className="text-zinc-300 hover:text-white transition"
            >
              Log in
            </Link>
            <Link
              to="/signup"
              className="rounded-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold px-3 py-1.5 transition"
            >
              Sign up
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-zinc-800 bg-zinc-950/90">
        <div className="mx-auto max-w-5xl px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-zinc-400">
          <span>
            Doggerz – Created by William Johnson – 2025. All Rights Reserved.
          </span>
          <div className="flex items-center gap-3">
            <Link to="/about" className="hover:text-zinc-200 transition">
              About
            </Link>
            <Link to="/contact" className="hover:text-zinc-200 transition">
              Contact
            </Link>
            <Link to="/legal" className="hover:text-zinc-200 transition">
              Legal
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ---------- Pages ---------- */

function SplashPage() {
  return (
    <AppShell>
      <section className="mx-auto max-w-5xl px-4 py-16 lg:py-24 flex flex-col lg:flex-row items-center gap-12">
        <div className="flex-1 space-y-6">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-400">
              Adopt. Care. Level up.
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight">
              Your <span className="text-emerald-400">virtual pup</span>,
              always one tap away.
            </h1>
          </div>

          <p className="text-sm sm:text-base text-zinc-300 max-w-xl">
            Adopt your pup and take care of them over real time. Keep them fed,
            entertained, rested, and clean. How you treat your dog determines
            how long they live — no click-spamming, no idle mining.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/signup"
              className="inline-flex items-center justify-center rounded-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold px-6 py-3 text-sm sm:text-base transition"
            >
              Adopt your pup
            </Link>
          </div>

          <p className="text-xs text-zinc-400">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-emerald-400 hover:text-emerald-300 font-medium"
            >
              Log in
            </Link>
          </p>
        </div>

        {/* Right-hand card: explain the aging/condition system instead of fake preview */}
        <div className="flex-1">
          <div className="relative rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-950 p-6 shadow-xl">
            <div className="text-xs uppercase tracking-[0.25em] text-zinc-500 mb-4">
              How Doggerz works
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 px-4 py-5 space-y-3 text-sm text-zinc-300">
              <p>
                • Your dog slowly ages even while you&apos;re logged out.
              </p>
              <p>
                • Hunger, boredom, and dirtiness creep up over real hours, not
                button mashing.
              </p>
              <p>
                • As cleanliness drops, your pup goes from dirty → fleas →
                mange, so regular baths matter.
              </p>
              <p>
                • Taking good care of your dog extends their life; ignoring
                them shortens it.
              </p>
            </div>
          </div>
        </div>
      </section>
    </AppShell>
  );
}

/* ---------- Auth pages (Firebase wired) ---------- */

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      navigate("/game");
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to log in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <section className="mx-auto max-w-md px-4 py-16">
        <h2 className="text-3xl font-bold mb-2">Log in</h2>
        <p className="text-sm text-zinc-400 mb-8">
          Welcome back. Your pup has been waiting.
        </p>
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-1">
            <label className="text-xs text-zinc-400">Email</label>
            <input
              type="email"
              className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm outline-none focus:border-emerald-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-zinc-400">Password</label>
            <input
              type="password"
              className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm outline-none focus:border-emerald-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          {error && (
            <p className="text-xs text-red-400 bg-red-950/40 border border-red-900 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed text-zinc-950 font-semibold py-2.5 text-sm transition"
          >
            {loading ? "Logging in..." : "Log in"}
          </button>
          <p className="text-xs text-zinc-400 text-center">
            Don&apos;t have an account?{" "}
            <Link
              to="/signup"
              className="text-emerald-400 hover:text-emerald-300 font-medium"
            >
              Adopt your pup
            </Link>
          </p>
        </form>
      </section>
    </AppShell>
  );
}

function SignupPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pupName, setPupName] = useState("Fireball");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      if (pupName.trim()) {
        await updateProfile(cred.user, {
          displayName: pupName.trim(),
        });
      }

      // TODO: also create initial dog document in Firestore later.
      navigate("/game");
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to create account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <section className="mx-auto max-w-md px-4 py-16">
        <h2 className="text-3xl font-bold mb-2">Adopt your pup</h2>
        <p className="text-sm text-zinc-400 mb-8">
          Create your Doggerz profile and claim your first pup. They&apos;ll
          age and need care even while you&apos;re away.
        </p>
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-1">
            <label className="text-xs text-zinc-400">Email</label>
            <input
              type="email"
              className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm outline-none focus:border-emerald-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-zinc-400">Password</label>
            <input
              type="password"
              className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm outline-none focus:border-emerald-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-zinc-400">Pup name</label>
            <input
              type="text"
              className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm outline-none focus:border-emerald-500"
              value={pupName}
              onChange={(e) => setPupName(e.target.value)}
              placeholder="Fireball"
            />
          </div>

          {error && (
            <p className="text-xs text-red-400 bg-red-950/40 border border-red-900 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed text-zinc-950 font-semibold py-2.5 text-sm transition"
          >
            {loading ? "Creating account..." : "Create account & adopt"}
          </button>
          <p className="text-xs text-zinc-400 text-center">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-emerald-400 hover:text-emerald-300 font-medium"
            >
              Log in
            </Link>
          </p>
        </form>
      </section>
    </AppShell>
  );
}

// For now, adopt just reuses signup flow.
function AdoptPage() {
  return <SignupPage />;
}

/* ---------- Info pages ---------- */

function AboutPage() {
  return (
    <AppShell>
      <section className="mx-auto max-w-3xl px-4 py-16 space-y-6">
        <h2 className="text-3xl font-bold">About Doggerz</h2>
        <p className="text-sm text-zinc-300">
          Doggerz is a virtual pup simulator designed and built by William
          Johnson. Your dog ages slowly over real time, and their stats
          continue drifting while you&apos;re offline. It&apos;s closer to
          taking care of a real dog than a clicker game.
        </p>
        <p className="text-sm text-zinc-300">
          Keep your pup fed, entertained, rested, and clean. Ignore them and
          they&apos;ll get dirty, pick up fleas, and eventually develop mange.
          Take care of them and you&apos;ll see how long you can keep your pup
          thriving.
        </p>
      </section>
    </AppShell>
  );
}

function ContactPage() {
  return (
    <AppShell>
      <section className="mx-auto max-w-3xl px-4 py-16 space-y-6">
        <h2 className="text-3xl font-bold">Contact</h2>
        <p className="text-sm text-zinc-300">
          Have feedback, bug reports, or feature ideas? This section will be
          wired up to a real contact form or backend endpoint in a later
          milestone.
        </p>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5 text-sm text-zinc-300 space-y-2">
          <p>
            For now, you can share feedback directly wherever you&apos;re
            testing Doggerz from (store listing, repo issues, etc.).
          </p>
        </div>
      </section>
    </AppShell>
  );
}

function LegalPage() {
  return (
    <AppShell>
      <section className="mx-auto max-w-3xl px-4 py-16 space-y-4 text-sm text-zinc-300">
        <h2 className="text-2xl font-bold">Legal</h2>
        <p>
          Doggerz is under active development. All names, branding, and assets
          are owned by William Johnson unless otherwise noted. Proper Terms of
          Service and Privacy Policy will be added before public release.
        </p>
      </section>
    </AppShell>
  );
}

/* ---------- Router ---------- */

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<SplashPage />} />
      <Route path="/game" element={<MainGame />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/adopt" element={<AdoptPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/legal" element={<LegalPage />} />
      <Route path="*" element={<SplashPage />} />
    </Routes>
  );
}
