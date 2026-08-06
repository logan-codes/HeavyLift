import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

const LANDING_BY_ROLE: Record<string, string> = {
  'System Admin': '/admin',
  'Site Manager': '/site-manager',
  'Rental Operator': '/operator',
  'Company Management': '/management',
  'Maintenance Team': '/maintenance',
};

export function RoleLanding() {
  const { user } = useAuth();
  const isAdminDisabled = import.meta.env.VITE_DISABLE_ADMIN === 'true';
  let target = (user?.role && LANDING_BY_ROLE[user.role]) || '/equipment';
  if (isAdminDisabled && target.startsWith('/admin')) {
    target = '/equipment';
  }
  return <Navigate to={target} replace />;
}
