// src/pages/Contact.jsx
import React from "react";

export default function ContactPage() {
  return (
    <div className="flex-1 px-6 py-10 flex justify-center">
      <div className="max-w-2xl w-full space-y-4">
        <h1 className="text-3xl font-black tracking-tight mb-2">Contact</h1>
        <p className="text-sm text-zinc-300">
          Got feedback, bug reports, or feature ideas for Doggerz? Send them
          over.
        </p>
        <p className="text-sm text-zinc-300">
          You can reach the developer at{" "}
          <span className="font-mono text-emerald-300">
            catfishfishcat10101@gmail.com
          </span>{" "}
          or through your usual social channels.
        </p>
        <p className="text-xs text-zinc-500">
          Please keep messages focused on the app and don&apos;t send sensitive
          personal information.
        </p>
      </div>
    </div>
  );
}
