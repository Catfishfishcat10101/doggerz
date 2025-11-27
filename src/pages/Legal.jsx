// src/pages/Legal.jsx
// Doggerz: Legal/terms/privacy page. Usage: <LegalPage /> summarizes terms and privacy.
// Accessibility: ARIA roles and meta tags are documented for SEO and screen readers.

import React from "react";
import PageContainer from "@/features/game/components/PageContainer.jsx";

/**
 * LegalPage: Terms and privacy summary for Doggerz.
 * - Terms of service, privacy, third-party, changes
 * - ARIA roles and meta tags for accessibility
 */
export default function LegalPage() {
  const year = new Date().getFullYear();
  return (
    <PageContainer
      title="Legal, Terms & Privacy"
      subtitle={`High-level summary of Doggerz usage terms & data handling. Last updated: ${year}`}
      metaDescription="Doggerz legal terms and privacy summary: data usage, third-party services, changes, responsibilities."
      padding="px-6 py-10"
    >
      {/* Terms of Service section */}
      <section
        className="space-y-2 text-sm text-zinc-300"
        aria-labelledby="tos-heading"
      >
        <h2 id="tos-heading" className="font-semibold text-zinc-100 text-base">
          1. Terms of Service
        </h2>
        <p>
          Doggerz is provided “as is” for entertainment. Uptime, features and
          balance may change. No guarantees of data retention.
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li>No abuse, security attacks, or cheating impacting others.</li>
          <li>You are responsible for device, data usage & connectivity.</li>
          <li>
            Accounts violating terms/community standards may be suspended.
          </li>
        </ul>
      </section>
      {/* Privacy & Data section */}
      <section
        className="space-y-2 text-sm text-zinc-300"
        aria-labelledby="privacy-heading"
      >
        <h2
          id="privacy-heading"
          className="font-semibold text-zinc-100 text-base"
        >
          2. Privacy & Data
        </h2>
        <p>
          Firebase services handle auth and game state. Basic account details
          and pup progress sync across devices.
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li>Account data links your pup to your profile.</li>
          <li>Game data stores stats & progression.</li>
          <li>Aggregated anonymized analytics may inform improvements.</li>
        </ul>
        <p>Avoid entering sensitive personal info into free-text fields.</p>
      </section>
      {/* Third-party services section */}
      <section
        className="space-y-2 text-sm text-zinc-300"
        aria-labelledby="third-party-heading"
      >
        <h2
          id="third-party-heading"
          className="font-semibold text-zinc-100 text-base"
        >
          3. Third-party services
        </h2>
        <p>
          Using Doggerz implies agreement with provider terms (Firebase/Google,
          app stores). Their policies govern underlying data handling.
        </p>
      </section>
      {/* Changes section */}
      <section
        className="space-y-2 text-sm text-zinc-300"
        aria-labelledby="changes-heading"
      >
        <h2
          id="changes-heading"
          className="font-semibold text-zinc-100 text-base"
        >
          4. Changes
        </h2>
        <p>
          Terms & privacy may evolve. Significant updates will appear here & in
          release notes.
        </p>
      </section>
      <p className="text-xs text-zinc-300" role="note">
        Informational summary only; obtain formal legal review for commercial
        release.
      </p>
    </PageContainer>
  );
}
