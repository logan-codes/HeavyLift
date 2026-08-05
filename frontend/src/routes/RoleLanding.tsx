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
  const target = (user?.role && LANDING_BY_ROLE[user.role]) || '/equipment';
  return <Navigate to={target} replace />;
}
