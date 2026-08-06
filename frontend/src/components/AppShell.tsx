import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

interface NavItem {
  to: string;
  label: string;
}

const NAV_BY_ROLE: Record<string, NavItem[]> = {
  'System Admin': [
    { to: '/', label: 'Home' },
    { to: '/equipment', label: 'Fleet' },
    { to: '/map', label: 'Map' },
    { to: '/alerts', label: 'Alerts' },
    { to: '/site-manager', label: 'Site Manager' },
    { to: '/operator', label: 'Check In/Out' },
    { to: '/management', label: 'Performance' },
    { to: '/maintenance', label: 'Maintenance' },
    { to: '/admin', label: 'Admin Portal' },
  ],
  'Site Manager': [
    { to: '/', label: 'Home' },
    { to: '/site-manager', label: 'My Site' },
    { to: '/equipment', label: 'Fleet' },
    { to: '/map', label: 'Map' },
    { to: '/alerts', label: 'Alerts' },
  ],
  'Rental Operator': [
    { to: '/', label: 'Home' },
    { to: '/operator', label: 'Check In / Out' },
    { to: '/equipment', label: 'Fleet' },
    { to: '/map', label: 'Map' },
  ],
  'Company Management': [
    { to: '/', label: 'Home' },
    { to: '/management', label: 'Fleet Performance' },
    { to: '/equipment', label: 'Fleet' },
    { to: '/map', label: 'Map' },
    { to: '/alerts', label: 'Alerts' },
  ],
  'Maintenance Team': [
    { to: '/', label: 'Home' },
    { to: '/maintenance', label: 'Maintenance' },
    { to: '/equipment', label: 'Fleet' },
    { to: '/map', label: 'Map' },
    { to: '/alerts', label: 'Alerts' },
  ],
};

export function AppShell() {
  const { user, logout } = useAuth();
  const isAdminDisabled = import.meta.env.VITE_DISABLE_ADMIN === 'true';
  const roleKey = user?.role || 'System Admin';
  const rawNavItems = NAV_BY_ROLE[roleKey] || NAV_BY_ROLE['System Admin'];
  const navItems = isAdminDisabled
    ? rawNavItems.filter((item) => !item.to.startsWith('/admin'))
    : rawNavItems;

  const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'Admin User';

  return (
    <div className="app-shell">
      <nav className="app-nav">
        <Link to="/" className="app-nav-brand">
          <img src="/heavy-machine.png" alt="Heavy Machine" className="app-brand-logo" />
          <span>Smart Rental Tracking</span>
        </Link>
        <div className="app-nav-links">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => 'app-nav-link' + (isActive ? ' active' : '')}
              end={item.to === '/admin' || item.to === '/site-manager' || item.to === '/operator'
                || item.to === '/management' || item.to === '/maintenance'}
            >
              {item.label}
            </NavLink>
          ))}
        </div>
        <div className="user-badge">
          <span>{displayName} · {roleKey}</span>
          <button onClick={logout}>Sign out</button>
        </div>
      </nav>
      <main className="app-body">
        <Outlet />
      </main>
    </div>
  );
}
