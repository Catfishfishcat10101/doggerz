import { slide as Menu } from 'react-burger-menu';
import './BurgerMenu.css'; // same-folder import
import { Home, Info, Bones, Phone } from 'lucide-react';

export default function NavBar() {
  return (
    <Menu right>
      <a className="menu-item" href="/"><Home size={16}/> Home</a>
      <a className="menu-item" href="/about"><Info size={16}/> About</a>
      <a className="menu-item" href="/game"><Bones size={16}/> Play</a>
      <a className="menu-item" href="/contact"><Phone size={16}/> Contact</a>
    </Menu>
  );
}