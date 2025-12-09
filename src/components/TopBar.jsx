import React from "react";
import { Link } from "react-router-dom";

export default function TopBar() {
  return (
    <header className="bg-white border-b">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold">
          Doggerz
        </Link>
        <nav className="space-x-4">
          <Link to="/adopt" className="text-slate-700 hover:underline">
            Adopt
          </Link>
          <Link to="/game" className="text-slate-700 hover:underline">
            Play
          </Link>
        </nav>
      </div>
    </header>
  );
}
