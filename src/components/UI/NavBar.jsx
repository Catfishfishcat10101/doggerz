import { slide as Menu } from 'react-burger-menu';
import './BurgerMenu.css';

export default function NavBar() {
  return (
    <Menu right>
        <a className="menu-item" href="/">Home</a>
        <a className="menu-item" href="/about">About</a>
        <a className="menu-item" href="/services">Services</a>
        <a className="menu-item" href="/contact">Contact</a>
    </Menu>
  );
}