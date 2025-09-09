import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen grid place-items-center bg-slate-900 text-slate-200">
      <div className="text-center p-8">
        <h1 className="text-6xl font-black">404</h1>
        <p className="mt-3">Page not found.</p>
        <Link to="/" className="mt-6 inline-block underline">Go home</Link>
      </div>
    </div>
  );
}