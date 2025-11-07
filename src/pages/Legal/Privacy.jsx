import React from "react";

export default function Privacy() {
  return (
    <div className="container py-6 text-white">
      <div className="card prose prose-invert max-w-none">
        <h1>Privacy</h1>
        <p>
          Doggerz stores your pup data in Firebase. Authentication and database
          are provided by Google Firebase.
        </p>
        <p>
          See the official policy:{" "}
          <a href="https://firebase.google.com/support/privacy" target="_blank" rel="noreferrer">
            Firebase Privacy &amp; Security
          </a>.
        </p>
      </div>
    </div>
  );
}