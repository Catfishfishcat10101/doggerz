// src/pages/Legal.jsx
import React from "react";

export default function LegalPage() {
  return (
    <div className="flex-1 px-6 py-10 flex justify-center">
      <div className="max-w-3xl w-full space-y-8 text-sm text-zinc-300">
        <header>
          <h1 className="text-3xl font-black tracking-tight mb-2">
            Legal, Terms &amp; Privacy
          </h1>
          <p className="text-xs text-zinc-500">
            Last updated: {new Date().getFullYear()}
          </p>
        </header>

        <section className="space-y-2">
          <h2 className="font-semibold text-zinc-100 text-base">
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
          <h2 className="font-semibold text-zinc-100 text-base">
            2. Privacy &amp; Data
          </h2>
          <p>
            Doggerz uses Firebase Authentication and related services to manage
            accounts and store game state. That means Google&apos;s
            infrastructure processes your basic account details (such as email,
            display name, and identifiers) and your save data.
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>
              Account data is used to sign you in and link your pup to your
              profile.
            </li>
            <li>
              Game data (pup stats and progress) is stored so your dog persists
              across sessions and devices.
            </li>
            <li>
              Aggregated, anonymized analytics may be used to understand usage
              and improve the game.
            </li>
          </ul>
          <p>
            Doggerz does not intentionally collect sensitive personal info
            beyond what&apos;s needed for auth and gameplay. Avoid putting
            private data into pet names or free-text fields.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold text-zinc-100 text-base">
            3. Third-party services
          </h2>
          <p>
            By using Doggerz you also agree to the terms and privacy policies of
            the underlying providers (e.g. Google, Firebase, app stores). Their
            data handling is outside this project&apos;s direct control.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold text-zinc-100 text-base">4. Changes</h2>
          <p>
            These terms and this privacy summary may change as Doggerz evolves.
            Significant changes will be reflected here and in future release
            notes.
          </p>
        </section>

        <p className="text-xs text-zinc-500">
          This is a high-level summary, not formal legal advice. For commercial
          release on app stores, you&apos;d want a lawyer to review and adapt
          these terms for your specific situation.
        </p>
      </div>
    </div>
  );
}
