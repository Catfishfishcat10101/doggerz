// src/pages/Legal/Privacy.jsx
import React from "react";
export default function Privacy() {
  return (
    <section className="mx-auto max-w-3xl px-4 sm:px-6 py-10 leading-relaxed">
      <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
      <p className="opacity-80 mb-4">
        We collect minimal data required to operate Doggerz (e.g., account
        email, gameplay stats).
      </p>
      <h2 className="text-xl font-semibold mt-6 mb-2">Data We Collect</h2>
      <ul className="list-disc pl-6 opacity-80 space-y-1">
        <li>Account identifiers (email, UID)</li>
        <li>Gameplay state (dog name, progression, inventory)</li>
        <li>Device info (IP address, OS version)</li>
        <li>Usage data (session duration, feature interactions)</li>
      </ul>
      <h2 className="text-xl font-semibold mt-6 mb-2">How We Use Data</h2>
      <p className="opacity-80">
        Provide, secure, and improve the app experience.
      </p>
      <p className="opacity-80 mt-2">
        Communicate updates, promotions, and support.
      </p>
      <p className="opacity-80 mt-2">
        Analyze usage trends to enhance features.
      </p>
      <h2 className="text-xl font-semibold mt-6 mb-2">Your Choices</h2>
      <p className="opacity-80">
        You can request data export or deletion via Settings &rarr; Account.
      </p>
      <section className="text-sm text-gray-500 mt-10">
        <p>Last updated: June 10, 2024</p>
        <h4 className="text-lg font-semibold mt-6 mb-2">Contact Us</h4>
        <p className="opacity-80">
          For privacy questions, email us at: catfishfishcat10101@gmail.com.
        </p>
        <p>
          {" "}
          We retain user data as long as the account is active or as required by
          law.
        </p>
        <p>
          {" "}
          Doggerz is not intended for users under the age of 13. We do not
          knowingly collect data from children.
        </p>
        <p>
          We use Firebase services for authentication and analytics. You can
          review{" "}
        </p>
      </section>
    </section>
  );
}
