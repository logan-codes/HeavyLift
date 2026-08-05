import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, ApiError } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import type { AlertDto } from '../api/types';
import { ALERT_STATUS_ACKNOWLEDGED, ALERT_STATUS_RESOLVED } from '../constants';

interface AlertsPageProps {
  siteId?: number;
  alertType?: string;
}

const SEVERITY_BY_TYPE: Record<string, string> = {
  overdue: 'alert-severity-high',
  health: 'alert-severity-high',
  geofence: 'alert-severity-high',
  maintenance_due: 'alert-severity-medium',
  no_operator: 'alert-severity-medium',
};

export function AlertsPage({ siteId, alertType }: AlertsPageProps) {
  const [alerts, setAlerts] = useState<AlertDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const canManage = user?.role !== 'Company Management';

  const load = async () => {
    try {
      const params = new URLSearchParams();
      params.set('statusId', '9'); // open only
      if (siteId != null) params.set('siteId', String(siteId));
      if (alertType) params.set('alertType', alertType);
      const data = await api.get<AlertDto[]>(`/api/alerts?${params.toString()}`);
      setAlerts(data);
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load alerts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteId, alertType]);

  const updateStatus = async (alertId: number, statusId: number) => {
    try {
      await api.patch(`/api/alerts/${alertId}/status`, { statusId });
      setAlerts((prev) => prev.filter((a) => a.alertId !== alertId));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to update alert');
    }
  };

  const embedded = siteId != null || alertType != null;

  return (
    <div className={embedded ? '' : 'page'}>
      {!embedded && (
        <header className="page-header">
          <div>
            <h1>Alerts</h1>
            <p className="subtitle">Open alerts, refreshing every 15s</p>
          </div>
        </header>
      )}

      {error && <div className="error-banner">{error}</div>}
      {loading && <p>Loading…</p>}

      {!loading && alerts.length === 0 && !error && (
        <p className="hint">No open alerts.</p>
      )}

      {alerts.length > 0 && (
        <ul className="alert-list">
          {alerts.map((a) => (
            <li key={a.alertId} className={SEVERITY_BY_TYPE[a.alertType] ?? ''}>
              <div className="alert-list-row">
                <div>
                  <strong>{a.alertType.replace(/_/g, ' ')}</strong>
                  {a.equipmentId != null && (
                    <> — <Link to={`/equipment/${a.equipmentId}`}>{a.equipmentName}</Link></>
                  )}
                  {a.siteName && <span className="hint"> · {a.siteName}</span>}
                  <div>{a.message}</div>
                  <span className="anomaly-time">{new Date(a.createdOn).toLocaleString()}</span>
                </div>
                {canManage && (
                  <div className="alert-actions">
                    <button className="secondary" onClick={() => updateStatus(a.alertId, ALERT_STATUS_ACKNOWLEDGED)}>Acknowledge</button>
                    <button onClick={() => updateStatus(a.alertId, ALERT_STATUS_RESOLVED)}>Resolve</button>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
