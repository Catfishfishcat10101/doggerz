// src/pages/Settings.jsx
import React from "react";
export default function Settings() {
  return (
    <section className="py-6">
      <h1 className="text-2xl font-bold mb-2">Settings</h1>
      <ul className="list-disc pl-6 space-y-1 opacity-90">
        <li>Audio: Bark volume, music toggle</li>
        <li>Accessibility: Reduced motion, high-contrast</li>
        <li>Account: Email, display name, delete account</li>
      </ul>
    </section>
  );
}
