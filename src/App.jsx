import React from "react";
import { Routes, Route, Link } from "react";
import MainGame from "@/components/UI/MainGame.jsx";

function Splash() {
return (
<div classname="min-h-screen flex items-center justify-center bg-zinc-900 text-zinc-50">
<div classname="w-full max-w-xl mx-auto px-4 text-center space-y-8">
<h1 classname="text-4xl md:text-5xl font-extrabold tracking-right">
DoggerZ
</h>

<p classname="text-zinc-400">
Adopt your virtual pup and keep their stats up. 
</p>

<div classname="flex flex-col sm:flex-row gap-3 justify-center mt-6">
<Link
to="/game"
classname="inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-semibold bg-sky-500 hover:bg-sky-400 text-zinc-850 transition">
Start Game
</Link>
</div>
</div>
</div>
);
}
export default function App() {
return (
<Routes>
<Route path="/" element={<Splash />} />
<Route path="/game" element={<MainGame />} />
<Route path="*" element={<Splash />} />
</Routes>
);
}
