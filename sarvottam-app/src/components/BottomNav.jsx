import { NavLink, useLocation } from 'react-router-dom';
import Icon from './Icon';

// 4 Main navigation tabs: Home, All Services (left), Emergency (middle), Profile (right)
const ITEMS = [
  { to: '/',          icon: 'home',  label: 'Home' },
  { to: '/services',  icon: 'grid',  label: 'All Services' },
  { to: '/emergency', icon: 'bolt',  label: 'Emergency', isEmergency: true },
  { to: '/profile',   icon: 'user',  label: 'Profile' },
];

export default function BottomNav() {
  const { pathname } = useLocation();

  return (
    <nav className="bottom-nav apple-tab-bar">
      {ITEMS.map((it) => {
        const active =
          it.to === '/'
            ? pathname === '/'
            : pathname === it.to || pathname.startsWith(it.to);

        if (it.isEmergency) {
          return (
            <NavLink
              key={it.to}
              to={it.to}
              className={'nav-item nav-emergency-item' + (active ? ' active' : '')}
            >
              <div className="nav-emergency-circle">
                <Icon name="bolt" size={20} />
              </div>
              <span className="nav-label nav-emergency-label">{it.label}</span>
            </NavLink>
          );
        }

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
