import { useEffect, useState } from 'react';
import { api } from '../api/client';
import type { AiResult, AlertSummary, EquipmentSummary, ForecastResponse, RentalDto, Site } from '../api/types';
import { BarChart } from '../components/BarChart';
import { SparklineChart } from '../components/SparklineChart';

const STATUS_COLORS: Record<string, string> = {
  Active: '#0ca30c',
  Idle: '#fab219',
  'In Maintenance': '#ec835a',
  Overdue: '#e66767',
};

export function CompanyDashboard() {
  const [equipment, setEquipment] = useState<EquipmentSummary[]>([]);
  const [rentals, setRentals] = useState<RentalDto[]>([]);
  const [alertSummary, setAlertSummary] = useState<AlertSummary | null>(null);
  const [sites, setSites] = useState<Site[]>([]);
  const [siteId, setSiteId] = useState<number | ''>('');
  const [forecast, setForecast] = useState<AiResult<ForecastResponse> | null>(null);

  useEffect(() => {
    api.get<EquipmentSummary[]>('/api/equipment').then(setEquipment).catch(() => {});
    api.get<RentalDto[]>('/api/rentals').then(setRentals).catch(() => {});
    api.get<AlertSummary>('/api/alerts/summary').then(setAlertSummary).catch(() => {});
    api.get<Site[]>('/api/sites').then(setSites).catch(() => {});
  }, []);

  useEffect(() => {
    const query = siteId ? `?siteId=${siteId}` : '';
    api.get<AiResult<ForecastResponse>>(`/api/ai/forecast${query}`).then(setForecast).catch(() => setForecast(null));
  }, [siteId]);

  const statusCounts = equipment.reduce<Record<string, number>>((acc, e) => {
    const key = e.statusName ?? 'Unknown';
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  const activeRentals = rentals.filter((r) => r.isActive);
  const overdueRentals = rentals.filter((r) => r.statusName === 'Overdue');
  const completedRentals = rentals.filter((r) => r.statusName === 'Completed');
  const onTimeRate = completedRentals.length > 0
    ? Math.round((completedRentals.length - overdueRentals.length) / completedRentals.length * 100)
    : null;

  const alertRows = alertSummary
    ? Object.entries(alertSummary.openByType).map(([type, count]) => ({
      label: type.replace(/_/g, ' '), value: count, color: '#3987e5',
    }))
    : [];

  const statusRows = Object.entries(statusCounts).map(([status, count]) => ({
    label: status, value: count, color: STATUS_COLORS[status] ?? '#898781',
  }));

  const firstCategory = forecast?.data?.categories[0];
  const forecastSeries = firstCategory
    ? [...firstCategory.history, ...firstCategory.forecast].map((w) => ({ x: w.weekStart, y: w.count }))
    : [];

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Fleet Performance</h1>
          <p className="subtitle">Read-only rollups — utilization, downtime, and demand across the fleet</p>
        </div>
      </header>

      <div className="stat-grid">
        <div className="stat-tile">
          <div className="stat-tile-label">Total equipment</div>
          <div className="stat-tile-value">{equipment.length}</div>
        </div>
        <div className="stat-tile">
          <div className="stat-tile-label">Currently rented</div>
          <div className="stat-tile-value">{activeRentals.length}</div>
        </div>
        <div className="stat-tile">
          <div className="stat-tile-label">Open alerts</div>
          <div className="stat-tile-value">{alertSummary?.totalOpen ?? '—'}</div>
        </div>
        <div className="stat-tile">
          <div className="stat-tile-label">Historical on-time rate</div>
          <div className="stat-tile-value">{onTimeRate != null ? `${onTimeRate}%` : '—'}</div>
        </div>
      </div>

      <div className="detail-grid">
        <div className="card">
          <BarChart title="Fleet status breakdown" rows={statusRows} />
        </div>
        <div className="card">
          <BarChart title="Open alerts by type" rows={alertRows} />
        </div>
      </div>

      <div className="card">
        <div className="page-header" style={{ marginBottom: '0.75rem' }}>
          <h2 style={{ margin: 0 }}>Demand forecast</h2>
          <label>
            Site
            <select value={siteId} onChange={(e) => setSiteId(e.target.value ? Number(e.target.value) : '')}>
              <option value="">All sites</option>
              {sites.map((s) => <option key={s.siteId} value={s.siteId}>{s.name}</option>)}
            </select>
          </label>
        </div>
        {forecast?.available && firstCategory ? (
          <>
            <SparklineChart
              title={`${firstCategory.category} rentals started per week (history + ${forecast.data?.weeksAhead}-week forecast)`}
              data={forecastSeries}
              color="#3987e5"
            />
            <p className="hint">Showing the first equipment category with rental history. Dashed distinction between
              history and forecast isn't drawn in this simple view — the last {forecast.data?.weeksAhead} points are the forecast.</p>
          </>
        ) : (
          <p className="hint">Forecast unavailable — AI service is unreachable, or there isn't enough rental history yet.</p>
        )}
      </div>
    </div>
  );
}
