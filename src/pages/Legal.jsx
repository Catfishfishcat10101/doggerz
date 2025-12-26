// src/pages/Legal.jsx
import * as React from "react";
import PageShell from "@/components/PageShell.jsx";

export default function LegalPage() {
  return (
    <PageShell>
      <div className="mx-auto w-full max-w-3xl space-y-8 text-sm text-zinc-700 dark:text-white/75">
        <header className="space-y-2">
          <h1 className="text-3xl font-black tracking-tight mb-2">
            Legal, Terms &amp; Privacy
          </h1>
          <p className="text-xs text-zinc-500 dark:text-white/50">Last updated: 2025-12-25</p>
        </header>

        <section className="space-y-2">
          <h2 className="font-semibold text-zinc-900 dark:text-white/90 text-base">
            1. Terms of Service
          </h2>
          <p>
            Doggerz is provided &quot;as is&quot; for entertainment purposes.
            There is no guarantee of uptime, feature availability, or data
            retention. Game balance, progression rules, and rewards may change
            over time.
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>
              Don&apos;t abuse the service, attack security, or cheat in ways
              that impact other players.
            </li>
            <li>
              You&apos;re responsible for your own device, data usage, and
              connectivity.
            </li>
            <li>
              Accounts that violate these terms or basic community standards may
              be suspended.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold text-zinc-900 dark:text-white/90 text-base">
            2. Privacy &amp; Data
          </h2>
          <p>
            Doggerz is designed to work in <b>offline mode</b> by default. Your
            pup and settings are stored locally on your device (browser storage)
            unless you choose to enable cloud features.
          </p>
          <p>
            If you enable cloud features by signing in (Firebase), Google/Firebase
            infrastructure will process basic account details (such as email and
            identifiers) and your game save data.
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>
              <b>Local data</b>: pup stats/progress and settings may be stored on
              your device to keep your dog persistent across sessions.
            </li>
            <li>
              <b>Cloud data (optional)</b>: when signed in, your pup save may be
              stored in Firebase/Firestore so it can persist across devices.
            </li>
            <li>
              <b>No advertising</b>: Doggerz does not include third-party ads.
            </li>
          </ul>
          <p>
            Doggerz does not intentionally collect sensitive personal info
            beyond what&apos;s needed for auth and gameplay. Avoid putting
            private data into pet names or free-text fields.
          </p>

          <h3 className="pt-2 font-semibold text-zinc-900 dark:text-white/90">Voice features</h3>
          <p>
            If you enable and use voice training, Doggerz uses your browser&apos;s
            speech recognition capability. This may require microphone
            permission, and speech processing may be handled by your browser or
            device vendor. Voice controls are optional and can be disabled in
            Settings.
          </p>

          <h3 className="pt-2 font-semibold text-zinc-900 dark:text-white/90">Location</h3>
          <p>
            Doggerz does not use GPS/geolocation. A user-provided ZIP code may be
            used to improve day/night timing and weather features.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold text-zinc-900 dark:text-white/90 text-base">
            3. Account deletion
          </h2>
          <p>
            If you created an account and enabled cloud sync, you can request
            deletion of your cloud account and cloud save from within the app in
            <b> Settings → Account &amp; cloud</b>. Local data on your device can be
            removed via Settings as well.
          </p>
          <p>
            If you have trouble deleting your account in-app, contact support via
            <a
              className="text-emerald-700 underline-offset-2 hover:text-emerald-600 hover:underline dark:text-emerald-300 dark:hover:text-emerald-200"
              href="mailto:catfishfishcat10101@gmail.com?subject=Doggerz%20Account%20Deletion"
            >
              email
            </a>
            .
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold text-zinc-900 dark:text-white/90 text-base">
            4. Third-party services
          </h2>
          <p>
            By using Doggerz you also agree to the terms and privacy policies of
            the underlying providers (e.g. Google, Firebase, app stores). Their
            data handling is outside this project&apos;s direct control.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold text-zinc-900 dark:text-white/90 text-base">5. Changes</h2>
          <p>
            These terms and this privacy summary may change as Doggerz evolves.
            Significant changes will be reflected here and in future release
            notes.
          </p>
        </section>

        <p className="text-xs text-zinc-500 dark:text-white/50">
          This is a high-level summary, not formal legal advice. For commercial
          release on app stores, you&apos;d want a lawyer to review and adapt
          these terms for your specific situation.
        </p>
      </div>
    </PageShell>
  );
}
