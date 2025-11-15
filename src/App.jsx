// src/App.jsx
import React, { useEffect, useState } from "react";
import {
  Routes,
  Route,
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithPopup,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import {
  auth,
  googleProvider,
  facebookProvider,
} from "@/firebase.js";

/* ---------- Layout shell (header + footer) ---------- */

function AppShell({ children, currentUser, onLogout }) {
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

            {currentUser ? (
              <>
                <span className="hidden sm:inline text-xs text-zinc-400">
                  Hi,&nbsp;
                  <span className="font-semibold text-zinc-200">
                    {currentUser.displayName ||
                      currentUser.email ||
                      "Pup Parent"}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={onLogout}
                  className="rounded-full border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-200 hover:bg-zinc-800 transition"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
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
              </>
            )}
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

/* ---------- Splash / marketing page ---------- */

function SplashPage({ currentUser }) {
  return (
    <AppShell currentUser={currentUser}>
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
              to={currentUser ? "/game" : "/signup"}
              className="inline-flex items-center justify-center rounded-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold px-6 py-3 text-sm sm:text-base transition"
            >
              {currentUser ? "Resume your pup" : "Adopt your pup"}
            </Link>
          </div>

          {currentUser ? (
            <p className="text-xs text-zinc-400">
              Logged in as{" "}
              <span className="font-semibold text-zinc-200">
                {currentUser.displayName || currentUser.email}
              </span>
              .{" "}
              <Link
                to="/game"
                className="text-emerald-400 hover:text-emerald-300 font-medium"
              >
                Jump back into the yard.
              </Link>
            </p>
          ) : (
            <p className="text-xs text-zinc-400">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-emerald-400 hover:text-emerald-300 font-medium"
              >
                Log in
              </Link>
            </p>
          )}
        </div>

        <div className="flex-1">
          <div className="relative rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-950 p-6 shadow-xl">
            <div className="text-xs uppercase tracking-[0.25em] text-zinc-500 mb-4">
              How Doggerz works
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 px-4 py-5 space-y-3 text-sm text-zinc-300">
              <p>• Your dog slowly ages even while you&apos;re logged out.</p>
              <p>
                • Hunger, boredom, and dirtiness creep up over real hours, not
                button mashing.
              </p>
              <p>
                • As cleanliness drops, your pup goes from dirty → fleas → mange,
                so regular baths matter.
              </p>
              <p>
                • Taking good care of your dog extends their life; ignoring them
                shortens it.
              </p>
            </div>
          </div>
        </div>
      </section>
    </AppShell>
  );
}

/* ---------- Game page shell (MainGame component already exists) ---------- */

import MainGame from "@/features/game/MainGame.jsx";

/* ---------- Auth pages: LOGIN + SIGNUP (with social login) ---------- */

function LoginPage({ currentUser }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [loadingSocial, setLoadingSocial] = useState(false);
  const [error, setError] = useState("");
  const [socialError, setSocialError] = useState("");

  useEffect(() => {
    if (currentUser) {
      navigate("/game");
    }
  }, [currentUser, navigate]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSocialError("");
    setLoadingEmail(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      navigate("/game");
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to log in.");
    } finally {
      setLoadingEmail(false);
    }
  };

  const handleSocialLogin = async (providerName) => {
    setError("");
    setSocialError("");
    setLoadingSocial(true);

    try {
      const provider =
        providerName === "google" ? googleProvider : facebookProvider;

      await signInWithPopup(auth, provider);
      navigate("/game");
    } catch (err) {
      console.error(err);
      setSocialError(
        err.code === "auth/popup-closed-by-user"
          ? "Login popup was closed before completing."
          : err.message || "Social login failed."
      );
    } finally {
      setLoadingSocial(false);
    }
  };

  return (
    <AppShell currentUser={currentUser}>
      <section className="mx-auto max-w-md px-4 py-16 space-y-6">
        <div>
          <h2 className="text-3xl font-bold mb-2">Log in</h2>
          <p className="text-sm text-zinc-400">
            Welcome back. Your pup has been waiting.
          </p>
        </div>

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
            disabled={loadingEmail || loadingSocial}
            className="w-full rounded-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed text-zinc-950 font-semibold py-2.5 text-sm transition"
          >
            {loadingEmail ? "Logging in..." : "Log in"}
          </button>
        </form>

        <div className="flex items-center gap-3 text-xs text-zinc-500">
          <div className="h-px flex-1 bg-zinc-800" />
          <span>Or continue with</span>
          <div className="h-px flex-1 bg-zinc-800" />
        </div>

        <div className="flex flex-col gap-3">
          <button
            type="button"
            disabled={loadingSocial}
            onClick={() => handleSocialLogin("google")}
            className="w-full inline-flex items-center justify-center gap-2 rounded-full border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-sm py-2.5 disabled:opacity-60 disabled:cursor-not-allowed transition"
          >
            {/* You can swap this for a real Google icon later */}
            <span className="text-lg">G</span>
            <span>Continue with Google</span>
          </button>

          <button
            type="button"
            disabled={loadingSocial}
            onClick={() => handleSocialLogin("facebook")}
            className="w-full inline-flex items-center justify-center gap-2 rounded-full border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-sm py-2.5 disabled:opacity-60 disabled:cursor-not-allowed transition"
          >
            {/* You can swap this for a real Facebook icon later */}
            <span className="text-lg">f</span>
            <span>Continue with Facebook</span>
          </button>
        </div>

        {socialError && (
          <p className="text-xs text-red-400 bg-red-950/40 border border-red-900 rounded-lg px-3 py-2">
            {socialError}
          </p>
        )}

        <p className="text-xs text-zinc-400 text-center pt-2">
          Don&apos;t have an account?{" "}
          <Link
            to="/signup"
            className="text-emerald-400 hover:text-emerald-300 font-medium"
          >
            Adopt your pup
          </Link>
        </p>
      </section>
    </AppShell>
  );
}

function SignupPage({ currentUser }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pupName, setPupName] = useState("Fireball");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (currentUser) {
      navigate("/game");
    }
  }, [currentUser, navigate]);

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

      navigate("/game");
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to create account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell currentUser={currentUser}>
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
          <p className="text-xs text-zinc-400 text-center pt-2">
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
function AdoptPage({ currentUser }) {
  return <SignupPage currentUser={currentUser} />;
}

/* ---------- Info pages ---------- */

function AboutPage({ currentUser }) {
  return (
    <AppShell currentUser={currentUser}>
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

function ContactPage({ currentUser }) {
  return (
    <AppShell currentUser={currentUser}>
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

function LegalPage({ currentUser }) {
  return (
    <AppShell currentUser={currentUser}>
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

/* ---------- Router + auth state wiring ---------- */

function AppRoutes({ currentUser }) {
  const location = useLocation();

  return (
    <Routes location={location}>
      <Route path="/" element={<SplashPage currentUser={currentUser} />} />
      <Route path="/game" element={<MainGame />} />
      <Route path="/login" element={<LoginPage currentUser={currentUser} />} />
      <Route path="/signup" element={<SignupPage currentUser={currentUser} />} />
      <Route path="/adopt" element={<AdoptPage currentUser={currentUser} />} />
      <Route path="/about" element={<AboutPage currentUser={currentUser} />} />
      <Route
        path="/contact"
        element={<ContactPage currentUser={currentUser} />}
      />
      <Route path="/legal" element={<LegalPage currentUser={currentUser} />} />
      <Route path="*" element={<SplashPage currentUser={currentUser} />} />
    </Routes>
  );
}

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user || null);
      setInitializing(false);
    });

    return () => unsub();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Failed to log out", err);
    }
  };

  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-200">
        <p className="text-sm text-zinc-400">Booting Doggerz…</p>
      </div>
    );
  }

  // Wrap routes in AppShell to pass logout handler (header/footer) from here
  return (
    <AppShell currentUser={currentUser} onLogout={handleLogout}>
      {/* We render routes *inside* the shell's main slot */}
      <AppRoutes currentUser={currentUser} />
    </AppShell>
  );
}
