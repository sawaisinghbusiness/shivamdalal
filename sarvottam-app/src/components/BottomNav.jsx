import { NavLink, useLocation } from 'react-router-dom';
import Icon from './Icon';

const ITEMS = [
  { to: '/',          icon: 'home',     label: 'Home' },
  { to: '/furniture', icon: 'clipboard',label: 'Furniture' },
  { to: '/emergency', icon: 'bolt',     label: 'Emergency', center: true },
  { to: '/painting',  icon: 'heart',    label: 'Painting' },
  { to: '/profile',   icon: 'user',     label: 'Profile' },
];

export default function BottomNav() {
  const { pathname } = useLocation();
  return (
    <nav className="bottom-nav">
      {ITEMS.map((it) => {
        const active = pathname === it.to;
        if (it.center) {
          return (
            <NavLink key={it.to} to={it.to} className="nav-item nav-center-btn">
              <div className="nav-center-icon"><Icon name={it.icon} size={24} /></div>
              <span>{it.label}</span>
            </NavLink>
          );
        }
        return (
          <NavLink key={it.to} to={it.to} className={'nav-item' + (active ? ' active' : '')}>
            <div className="nav-icon"><Icon name={it.icon} size={22} /></div>
            <span>{it.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
