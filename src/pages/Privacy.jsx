// src/pages/Privacy.jsx
import Header from "@/components/Header.jsx";
import Footer from "@/components/Footer.jsx";

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <div className="flex-1 px-6 py-10 flex justify-center">
        <div className="max-w-3xl w-full space-y-8 text-sm text-zinc-300">
          <header>
            <h1 className="text-3xl font-black tracking-tight mb-2">
              Privacy Policy
            </h1>
            <p className="text-xs text-zinc-500">Last updated: 2026-01-02</p>
          </header>
          <section className="space-y-2">
            <h2 className="font-semibold text-zinc-100 text-base">1. The short version</h2>
            <p>
              Doggerz is designed to work in <b>offline / local-only mode</b>.
              By default, your dog and settings live in your browser storage on
              this device.
            </p>
            <p>
              If you choose to sign in and enable cloud features, Doggerz uses
              Firebase (Google) to store account info and (optionally) sync your
              save.
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li><b>No third-party ads</b> are served by Doggerz.</li>
              <li><b>No selling data</b>: this project is not built to sell personal data.</li>
              <li><b>Minimal data</b>: only what’s needed to run the features you use.</li>
            </ul>
          </section>
          <section className="space-y-2">
            <h2 className="font-semibold text-zinc-100 text-base">2. What we store locally</h2>
            <p>
              Doggerz stores gameplay state locally so your pup persists between
              sessions. This may include:
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>Your dog’s stats/progress (level, needs, journal, etc.)</li>
              <li>Settings (accessibility, audio toggles, preferences)</li>
              <li>Optional flags like onboarding dismissal</li>
            </ul>
            <p className="text-xs text-zinc-500">
              You can clear local data via Settings (or by clearing site data in
              your browser).
            </p>
          </section>
          <section className="space-y-2">
            <h2 className="font-semibold text-zinc-100 text-base">3. Cloud sync (optional)</h2>
            <p>
              If you sign in, Firebase may process and store basic account
              identifiers (such as email) and your cloud save data.
            </p>
            <p>
              Cloud sync is meant to keep your progress across devices. If cloud
              is unavailable or misconfigured, Doggerz should still be playable
              locally.
            </p>
          </section>
          <section className="space-y-2">
            <h2 className="font-semibold text-zinc-100 text-base">4. Voice features</h2>
            <p>
              If you enable voice training, Doggerz uses your browser’s speech
              recognition capability. This may require microphone permission,
              and speech processing may be handled by your browser or device
              vendor.
            </p>
            <p>
              Voice controls are optional and can be disabled in Settings.
            </p>
          </section>
          <section className="space-y-2">
            <h2 className="font-semibold text-zinc-100 text-base">5. Location</h2>
            <p>
              Doggerz does not use GPS/geolocation. A user-provided ZIP code may
              be used to improve day/night timing and weather features.
            </p>
          </section>
          <section className="space-y-2">
            <h2 className="font-semibold text-zinc-100 text-base">6. Third-party services</h2>
            <p>
              Doggerz may rely on third-party services (e.g. Firebase, app
              stores). Their data handling is governed by their own policies.
            </p>
          </section>
          <section className="space-y-2">
            <h2 className="font-semibold text-zinc-100 text-base">7. Contact</h2>
            <p>
              Questions about privacy? Email{' '}
              <a
                className="text-emerald-300 underline-offset-2 hover:text-emerald-200 hover:underline"
                href="mailto:catfishfishcat10101@gmail.com?subject=Doggerz%20Privacy"
              >
                catfishfishcat10101@gmail.com
              </a>
              .
            </p>
          </section>
          <section className="space-y-2">
            <h2 className="font-semibold text-zinc-100 text-base">8. Changes</h2>
            <p>
              This policy may change as Doggerz evolves. Significant changes
              will be reflected on this page.
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </>
  );
}
