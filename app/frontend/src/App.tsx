import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { Login } from './pages/Login';
import { EquipmentList } from './pages/EquipmentList';
import { EquipmentDetail } from './pages/EquipmentDetail';
import { MapView } from './pages/MapView';
import { AlertsPage } from './pages/AlertsPage';
import { CheckInOut } from './pages/CheckInOut';
import { SiteManagerDashboard } from './pages/SiteManagerDashboard';
import { CompanyDashboard } from './pages/CompanyDashboard';
import { MaintenanceDashboard } from './pages/MaintenanceDashboard';
import { AdminOverview } from './pages/admin/AdminOverview';
import { SitesPage } from './pages/admin/SitesPage';
import { CustomersPage } from './pages/admin/CustomersPage';
import { OperatorsPage } from './pages/admin/OperatorsPage';
import { UsersPage } from './pages/admin/UsersPage';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { RoleLanding } from './routes/RoleLanding';
import { AppShell } from './components/AppShell';

export function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route path="/" element={<RoleLanding />} />

            <Route path="/equipment" element={<EquipmentList />} />
            <Route path="/equipment/:id" element={<EquipmentDetail />} />
            <Route path="/map" element={<MapView />} />
            <Route path="/alerts" element={<AlertsPage />} />

            <Route path="/admin" element={<AdminOverview />} />
            <Route path="/admin/sites" element={<SitesPage />} />
            <Route path="/admin/customers" element={<CustomersPage />} />
            <Route path="/admin/operators" element={<OperatorsPage />} />
            <Route path="/admin/users" element={<UsersPage />} />

            <Route path="/site-manager" element={<SiteManagerDashboard />} />
            <Route path="/operator" element={<CheckInOut />} />
            <Route path="/management" element={<CompanyDashboard />} />
            <Route path="/maintenance" element={<MaintenanceDashboard />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
