import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

interface NavItem {
  to: string;
  label: string;
}

const NAV_BY_ROLE: Record<string, NavItem[]> = {
  'System Admin': [
    { to: '/admin', label: 'Overview' },
    { to: '/equipment', label: 'Fleet' },
    { to: '/map', label: 'Map' },
    { to: '/alerts', label: 'Alerts' },
    { to: '/admin/sites', label: 'Sites' },
    { to: '/admin/customers', label: 'Customers' },
    { to: '/admin/operators', label: 'Operators' },
    { to: '/admin/users', label: 'Users' },
  ],
  'Site Manager': [
    { to: '/site-manager', label: 'My Site' },
    { to: '/map', label: 'Map' },
  ],
  'Rental Operator': [
    { to: '/operator', label: 'Check In / Out' },
    { to: '/equipment', label: 'Fleet' },
    { to: '/map', label: 'Map' },
  ],
  'Company Management': [
    { to: '/management', label: 'Fleet Performance' },
    { to: '/alerts', label: 'Alerts' },
  ],
  'Maintenance Team': [
    { to: '/maintenance', label: 'Maintenance' },
    { to: '/map', label: 'Map' },
    { to: '/alerts', label: 'Alerts' },
  ],
};

export function AppShell() {
  const { user, logout } = useAuth();
  const navItems = (user?.role && NAV_BY_ROLE[user.role]) || [];

  return (
    <div className="app-shell">
      <nav className="app-nav">
        <div className="app-nav-brand">Smart Rental Tracking</div>
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
          <span>{user?.firstName} {user?.lastName} · {user?.role}</span>
          <button onClick={logout}>Sign out</button>
        </div>
      </nav>
      <main className="app-body">
        <Outlet />
      </main>
    </div>
  );
}
