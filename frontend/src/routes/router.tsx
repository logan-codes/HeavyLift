import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { MainLayout } from '../components/layout/MainLayout'
import { Skeleton } from '../components/ui/skeleton'

// Lazy load all pages
const LoginPage = lazy(() => import('../features/auth/LoginPage'))
const DashboardPage = lazy(() => import('../features/dashboard/DashboardPage'))
const EquipmentListPage = lazy(() => import('../features/equipment/EquipmentListPage'))
const EquipmentDetailPage = lazy(() => import('../features/equipment/EquipmentDetailPage'))
const FleetMapPage = lazy(() => import('../features/fleet-map/FleetMapPage'))
const UsageAnalyticsPage = lazy(() => import('../features/analytics/UsageAnalyticsPage'))
const RentalManagementPage = lazy(() => import('../features/rental/RentalManagementPage'))
const AlertCenterPage = lazy(() => import('../features/alerts/AlertCenterPage'))
const ForecastingPage = lazy(() => import('../features/forecasting/ForecastingPage'))
const AIInsightsPage = lazy(() => import('../features/ai-insights/AIInsightsPage'))
const MaintenancePage = lazy(() => import('../features/maintenance/MaintenancePage'))
const ReportsPage = lazy(() => import('../features/reports/ReportsPage'))
const SettingsPage = lazy(() => import('../features/settings/SettingsPage'))

function PageLoader() {
  return (
    <div className="space-y-6 p-6">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-96" />
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
      </div>
      <Skeleton className="h-64 rounded-xl" />
    </div>
  )
}

function SuspenseWrap({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>
}

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <SuspenseWrap><LoginPage /></SuspenseWrap>,
  },
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <SuspenseWrap><DashboardPage /></SuspenseWrap> },
      { path: 'equipment', element: <SuspenseWrap><EquipmentListPage /></SuspenseWrap> },
      { path: 'equipment/:id', element: <SuspenseWrap><EquipmentDetailPage /></SuspenseWrap> },
      { path: 'fleet-map', element: <SuspenseWrap><FleetMapPage /></SuspenseWrap> },
      { path: 'analytics', element: <SuspenseWrap><UsageAnalyticsPage /></SuspenseWrap> },
      { path: 'rentals', element: <SuspenseWrap><RentalManagementPage /></SuspenseWrap> },
      { path: 'alerts', element: <SuspenseWrap><AlertCenterPage /></SuspenseWrap> },
      { path: 'forecasting', element: <SuspenseWrap><ForecastingPage /></SuspenseWrap> },
      { path: 'ai-insights', element: <SuspenseWrap><AIInsightsPage /></SuspenseWrap> },
      { path: 'maintenance', element: <SuspenseWrap><MaintenancePage /></SuspenseWrap> },
      { path: 'reports', element: <SuspenseWrap><ReportsPage /></SuspenseWrap> },
      { path: 'settings', element: <SuspenseWrap><SettingsPage /></SuspenseWrap> },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
])
