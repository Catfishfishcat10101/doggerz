import { Link, useLocation } from "react-router-dom";
import LogoutButton from "../components/Auth/LogoutButton";

export default function NavBar() {
  const { pathname } = useLocation();
  // Hide on splash/login to keep focus on the CTA
  if (pathname === "/" || pathname === "/login") return null;

  return (
    <nav className="w-full bg-black/20 backdrop-blur border-b border-white/10">
      <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between text-white">
        <div className="flex items-center gap-4">
          <Link to="/" className="font-extrabold tracking-wide">🐾 Doggerz</Link>
          <Link to="/game" className="text-white/80 hover:text-white">Game</Link>
          <Link to="/shop" className="text-white/80 hover:text-white">Shop</Link>
        </div>
        <LogoutButton />
      </div>
    </nav>
  );
}