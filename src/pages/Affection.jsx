// src/pages/Affection.jsx
// Doggerz: Affection/bonding preview page. Usage: <Affection /> previews future mechanics.
// Accessibility: ARIA roles and meta tags are documented for SEO and screen readers.
import React from "react";
import PageContainer from "@/features/game/components/PageContainer.jsx";

/**
 * Affection: Preview page for future bonding mechanics in Doggerz.
 * - Placeholder for toys, visit cadence, reactions
 * - ARIA roles and meta tags for accessibility
 */
export default function Affection() {
  return (
    <PageContainer
      title="Affection & Bonding"
      subtitle="Future system: toys, visit cadence, reactions to unmet needs will shape a unique bond curve."
      metaDescription="Doggerz affection system preview: upcoming mechanics for bonding via routines, toys, and consistent care."
      padding="px-4 py-10"
    >
      <section
        className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5 text-sm text-zinc-300"
        aria-label="Affection system overview"
      >
        <p>
          Affection systems will track favorite toys, visit frequency, and how
          you respond when needs dip. Over time your pup’s emotional profile and
          loyalty will diverge from others.
        </p>
        <p className="mt-3 text-xs text-zinc-300">
          Placeholder content while temperament & memory backbones evolve.
        </p>
      </section>
    </PageContainer>
  );
}
