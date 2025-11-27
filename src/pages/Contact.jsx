// src/pages/Contact.jsx
// Doggerz: Contact/feedback page. Usage: <Contact /> provides support info.
// Accessibility: ARIA roles and meta tags are documented for SEO and screen readers.
import React from "react";
import PageContainer from "@/features/game/components/PageContainer.jsx";

/**
 * Contact: Feedback and support page for Doggerz.
 * - Email link, instructions, and privacy note
 * - ARIA roles and meta tags for accessibility
 */
export default function Contact() {
  return (
    <PageContainer
      title="Contact"
      subtitle="Feedback, bug reports & feature ideas keep Doggerz improving."
      metaDescription="Contact Doggerz developer: send feedback, bug reports, feature suggestions via email."
      padding="px-4 py-10"
    >
      <section
        className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5 space-y-4 text-sm text-zinc-300"
        aria-label="Contact instructions"
      >
        <p>
          Email is fastest. Include what you were doing, what happened, and what
          you expected. Screenshots or short clips help reproduce issues
          quickly.
        </p>
        <a
          href="mailto:catfishfishcat10101@gmail.com?subject=Doggerz%20Feedback"
          className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400 transition"
        >
          Email the developer
        </a>
        <p className="text-xs text-zinc-300" aria-live="polite">
          Avoid sharing sensitive personal information.
        </p>
      </section>
    </PageContainer>
  );
}
