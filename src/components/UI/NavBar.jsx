import React from 'react';
import { slide as Menu } from 'react-burger-menu';
import './BurgerMenu.css'; // same-folder import
import * as Icons from 'lucide-react';

// keep backwards-compatible symbol for any existing JSX that uses <Bones />
// prefer actual exports if present, fall back to a no-op component
const Bones = Icons.Bones ?? Icons.Bone ?? (() => null);

export default function NavBar() {
  return (
    <header className="flex items-center justify-between p-4 bg-slate-800/60">
      <div className="text-xl font-bold">Home</div>
      <nav>
        <button className="px-3 py-1 bg-slate-700 rounded">Menu</button>
      </nav>
    </header>
  );
}
// where the file used <Bones ... /> it will now resolve to the real export if present