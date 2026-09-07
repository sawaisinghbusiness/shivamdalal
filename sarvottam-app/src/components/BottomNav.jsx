import { NavLink, useLocation } from 'react-router-dom';
import Icon from './Icon';

// 3 Main navigation tabs matching the Apple HIG screenshot design
const ITEMS = [
  { to: '/',          icon: 'home', label: 'Home' },
  { to: '/emergency', icon: 'grid', label: 'All Services' },
  { to: '/profile',   icon: 'user', label: 'Profile' },
];

export default function BottomNav() {
  const { pathname } = useLocation();

  return (
    <nav className="bottom-nav apple-tab-bar">
      {ITEMS.map((it) => {
        const active = pathname === it.to || (it.to === '/emergency' && pathname.startsWith('/emergency'));
        return (
          <NavLink
            key={it.to}
            to={it.to}
            className={'nav-item' + (active ? ' active' : '')}
          >
            <div className="nav-icon">
              <Icon name={it.icon} size={22} />
            </div>
            <span className="nav-label">{it.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
