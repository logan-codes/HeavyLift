import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, ApiError } from '../api/client';
import type { EquipmentSummary } from '../api/types';

export function statusClass(status: string | null): string {
  switch (status) {
    case 'Active':
      return 'status-badge status-active';
    case 'Idle':
      return 'status-badge status-idle';
    case 'In Maintenance':
      return 'status-badge status-maintenance';
    case 'Overdue':
      return 'status-badge status-overdue';
    default:
      return 'status-badge';
  }
}

interface EquipmentListProps {
  siteId?: number;
}

export function EquipmentList({ siteId }: EquipmentListProps) {
  const [equipment, setEquipment] = useState<EquipmentSummary[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const query = siteId != null ? `?siteId=${siteId}` : '';
      const data = await api.get<EquipmentSummary[]>(`/api/equipment${query}`);
      setEquipment(data);
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load equipment');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteId]);

  return (
    <div className={siteId ? '' : 'page'}>
      {!siteId && (
        <header className="page-header">
          <div>
            <h1>Fleet Dashboard</h1>
            <p className="subtitle">Live equipment status, refreshing every 5s</p>
          </div>
          <Link className="link-button" to="/map">View on map</Link>
        </header>
      )}

      {error && <div className="error-banner">{error}</div>}
      {loading && <p>Loading…</p>}

      {!loading && equipment.length === 0 && !error && (
        <p className="hint">No equipment yet — run the data generator to seed and stream telemetry.</p>
      )}

      {equipment.length > 0 && (
        <table className="equipment-table">
          <thead>
            <tr>
              <th>Equipment</th>
              <th>Status</th>
              <th>Health</th>
              <th>Fuel</th>
              <th>Operator</th>
              <th>Last Maintenance</th>
              <th>Location</th>
            </tr>
          </thead>
          <tbody>
            {equipment.map((e) => (
              <tr key={e.equipmentId}>
                <td>
                  <Link className="equipment-name" to={`/equipment/${e.equipmentId}`}>{e.name}</Link>
                  <div className="equipment-sub">{e.fuelType ?? '—'}</div>
                </td>
                <td><span className={statusClass(e.statusName)}>{e.statusName ?? 'Unknown'}</span></td>
                <td>{e.health != null ? `${e.health}%` : '—'}</td>
                <td>{e.fuelGauge != null ? `${e.fuelGauge}%` : '—'}</td>
                <td>{e.operatorName ?? '—'}</td>
                <td>{e.lastMaintenanceOn ?? '—'}</td>
                <td>{e.latitude != null && e.longitude != null ? `${e.latitude.toFixed(4)}, ${e.longitude.toFixed(4)}` : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
