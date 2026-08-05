import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import type { AlertDto, EquipmentSummary } from '../api/types';
import { statusClass } from './EquipmentList';

const MAINTENANCE_INTERVAL_DAYS = 90;

function daysSince(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const diff = Date.now() - new Date(dateStr).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export function MaintenanceDashboard() {
  const [equipment, setEquipment] = useState<EquipmentSummary[]>([]);
  const [healthAlerts, setHealthAlerts] = useState<AlertDto[]>([]);
  const [maintenanceAlerts, setMaintenanceAlerts] = useState<AlertDto[]>([]);

  useEffect(() => {
    const load = () => {
      api.get<EquipmentSummary[]>('/api/equipment').then(setEquipment).catch(() => {});
      api.get<AlertDto[]>('/api/alerts?alertType=health&statusId=9').then(setHealthAlerts).catch(() => {});
      api.get<AlertDto[]>('/api/alerts?alertType=maintenance_due&statusId=9').then(setMaintenanceAlerts).catch(() => {});
    };
    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, []);

  const byHealthAscending = [...equipment].sort((a, b) => (a.health ?? 999) - (b.health ?? 999));
  const maintenanceDue = equipment
    .filter((e) => (daysSince(e.lastMaintenanceOn) ?? 0) > MAINTENANCE_INTERVAL_DAYS)
    .sort((a, b) => (daysSince(b.lastMaintenanceOn) ?? 0) - (daysSince(a.lastMaintenanceOn) ?? 0));

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Maintenance</h1>
          <p className="subtitle">Health scores, service due list, and anomaly/health alerts</p>
        </div>
      </header>

      <div className="detail-grid">
        <div className="card">
          <h2>Open health &amp; maintenance alerts</h2>
          {healthAlerts.length + maintenanceAlerts.length === 0 ? (
            <p className="hint">No open health or maintenance alerts.</p>
          ) : (
            <ul className="alert-list">
              {[...healthAlerts, ...maintenanceAlerts].map((a) => (
                <li key={a.alertId} className="alert-severity-high">
                  <strong>{a.alertType.replace(/_/g, ' ')}</strong> —{' '}
                  {a.equipmentId != null ? <Link to={`/equipment/${a.equipmentId}`}>{a.equipmentName}</Link> : null}
                  <div>{a.message}</div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card">
          <h2>Maintenance due ({'>'}{MAINTENANCE_INTERVAL_DAYS} days)</h2>
          {maintenanceDue.length === 0 ? (
            <p className="hint">Everything is within the service interval.</p>
          ) : (
            <table className="data-table">
              <thead><tr><th>Equipment</th><th>Last serviced</th><th>Days ago</th></tr></thead>
              <tbody>
                {maintenanceDue.map((e) => (
                  <tr key={e.equipmentId}>
                    <td><Link className="equipment-name" to={`/equipment/${e.equipmentId}`}>{e.name}</Link></td>
                    <td>{e.lastMaintenanceOn}</td>
                    <td>{daysSince(e.lastMaintenanceOn)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="card">
        <h2>Equipment by health score (lowest first)</h2>
        <table className="data-table">
          <thead><tr><th>Equipment</th><th>Health</th><th>Status</th><th>Last maintenance</th></tr></thead>
          <tbody>
            {byHealthAscending.map((e) => (
              <tr key={e.equipmentId}>
                <td><Link className="equipment-name" to={`/equipment/${e.equipmentId}`}>{e.name}</Link></td>
                <td>{e.health ?? '—'}%</td>
                <td><span className={statusClass(e.statusName)}>{e.statusName ?? 'Unknown'}</span></td>
                <td>{e.lastMaintenanceOn ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
