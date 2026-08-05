import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import type { AlertSummary, EquipmentSummary, Site } from '../../api/types';

export function AdminOverview() {
  const [equipment, setEquipment] = useState<EquipmentSummary[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [alertSummary, setAlertSummary] = useState<AlertSummary | null>(null);

  useEffect(() => {
    api.get<EquipmentSummary[]>('/api/equipment').then(setEquipment).catch(() => {});
    api.get<Site[]>('/api/sites').then(setSites).catch(() => {});
    api.get<AlertSummary>('/api/alerts/summary').then(setAlertSummary).catch(() => {});
  }, []);

  const activeCount = equipment.filter((e) => e.statusName === 'Active').length;
  const idleCount = equipment.filter((e) => e.statusName === 'Idle').length;

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>System Admin Overview</h1>
          <p className="subtitle">Fleet-wide summary and management shortcuts</p>
        </div>
      </header>

      <div className="stat-grid">
        <div className="stat-tile">
          <div className="stat-tile-label">Total equipment</div>
          <div className="stat-tile-value">{equipment.length}</div>
        </div>
        <div className="stat-tile">
          <div className="stat-tile-label">Active / Idle</div>
          <div className="stat-tile-value">{activeCount} / {idleCount}</div>
        </div>
        <div className="stat-tile">
          <div className="stat-tile-label">Sites</div>
          <div className="stat-tile-value">{sites.length}</div>
        </div>
        <div className="stat-tile">
          <div className="stat-tile-label">Open alerts</div>
          <div className="stat-tile-value">{alertSummary?.totalOpen ?? '—'}</div>
        </div>
      </div>

      <div className="detail-grid">
        <div className="card">
          <h2>Manage</h2>
          <ul className="quick-links">
            <li><Link to="/equipment">Fleet dashboard</Link></li>
            <li><Link to="/map">Fleet map</Link></li>
            <li><Link to="/alerts">Alert notification center</Link></li>
            <li><Link to="/admin/sites">Sites</Link></li>
            <li><Link to="/admin/customers">Customers</Link></li>
            <li><Link to="/admin/operators">Operators</Link></li>
            <li><Link to="/admin/users">Users</Link></li>
          </ul>
        </div>
        <div className="card">
          <h2>Open alerts by type</h2>
          {alertSummary && Object.keys(alertSummary.openByType).length > 0 ? (
            <ul className="quick-links">
              {Object.entries(alertSummary.openByType).map(([type, count]) => (
                <li key={type}>{type.replace(/_/g, ' ')}: <strong>{count}</strong></li>
              ))}
            </ul>
          ) : (
            <p className="hint">No open alerts.</p>
          )}
        </div>
      </div>
    </div>
  );
}
