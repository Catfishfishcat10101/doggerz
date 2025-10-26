import React from "react";
export default function Settings() {
  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="text-3xl font-bold">Settings</h1>
      <ul className="mt-4 space-y-2">
        <li>Audio: on/off</li>
        <li>Animations: on/off</li>
        <li>High contrast: on/off</li>
      </ul>
    </div>
  );
}
