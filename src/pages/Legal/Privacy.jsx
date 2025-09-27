// src/pages/Legal/Privacy.jsx
import React from "react";
export default function Privacy() {
  return (
    <section className="mx-auto max-w-3xl px-4 sm:px-6 py-10 leading-relaxed">
      <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
      <p className="opacity-80 mb-4">
        We collect minimal data required to operate Doggerz (e.g., account email, gameplay stats).
      </p>
      <h2 className="text-xl font-semibold mt-6 mb-2">Data We Collect</h2>
      <ul className="list-disc pl-6 opacity-80 space-y-1">
        <li>Account identifiers (email, UID)</li>
        <li>Gameplay state (dog name, progression, inventory)</li>
        <li>Device and usage diagnostics in aggregate</li>
      </ul>
      <h2 className="text-xl font-semibold mt-6 mb-2">How We Use Data</h2>
      <p className="opacity-80">Provide, secure, and improve the app experience.</p>
      <h2 className="text-xl font-semibold mt-6 mb-2">Your Choices</h2>
      <p className="opacity-80">
        You can request data export or deletion via Settings &rarr; Account.
      </p>
    </section>
  );
}
