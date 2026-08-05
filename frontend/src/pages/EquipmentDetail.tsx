import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, ApiError } from '../api/client';
import type { AiResult, AnomalyResponse, EquipmentDetail as EquipmentDetailType, UtilizationResponse } from '../api/types';
import { statusClass } from './EquipmentList';
import { SparklineChart } from '../components/SparklineChart';

const SEQUENTIAL_BLUE = '#3987e5';
const SEQUENTIAL_ORANGE = '#d95926';

const SEVERITY_CLASS: Record<string, string> = {
  high: 'alert-severity-high',
  medium: 'alert-severity-medium',
  low: 'alert-severity-low',
};

export function EquipmentDetail() {
  const { id } = useParams<{ id: string }>();
  const [detail, setDetail] = useState<EquipmentDetailType | null>(null);
  const [utilization, setUtilization] = useState<AiResult<UtilizationResponse> | null>(null);
  const [anomalies, setAnomalies] = useState<AiResult<AnomalyResponse> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      api.get<EquipmentDetailType>(`/api/equipment/${id}`),
      api.get<AiResult<UtilizationResponse>>(`/api/ai/utilization/${id}`).catch(() => null),
      api.get<AiResult<AnomalyResponse>>(`/api/ai/anomalies/${id}`).catch(() => null),
    ])
      .then(([detailData, utilizationData, anomalyData]) => {
        setDetail(detailData);
        setUtilization(utilizationData);
        setAnomalies(anomalyData);
        setError(null);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Failed to load equipment'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="page"><p>Loading…</p></div>;
  if (error) return <div className="page"><div className="error-banner">{error}</div></div>;
  if (!detail) return null;

  const { equipment, currentRental, openAlerts, recentHistory } = detail;

  const healthSeries = recentHistory
    .filter((h) => h.health != null)
    .map((h) => ({ x: h.recordedAt, y: h.health as number }));
  const fuelSeries = recentHistory
    .filter((h) => h.fuelGauge != null)
    .map((h) => ({ x: h.recordedAt, y: h.fuelGauge as number }));

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <Link to="/equipment" className="back-link">&larr; Back to fleet</Link>
          <h1>{equipment.name}</h1>
          <p className="subtitle">
            <span className={statusClass(equipment.statusName)}>{equipment.statusName ?? 'Unknown'}</span>
            {' · '}Health {equipment.health ?? '—'}% · {equipment.fuelType ?? 'Unknown fuel'}
          </p>
        </div>
      </header>

      <section className="detail-grid">
        <div className="card">
          <h2>Current rental</h2>
          {currentRental ? (
            <dl className="kv-list">
              <div><dt>Customer</dt><dd>{currentRental.customerName}</dd></div>
              <div><dt>Site</dt><dd>{currentRental.siteName}</dd></div>
              <div><dt>Due on</dt><dd>{currentRental.dueOn}</dd></div>
              <div><dt>Status</dt><dd>{currentRental.rentStatus}</dd></div>
              <div><dt>Rental days</dt><dd>{currentRental.rentalDays}</dd></div>
            </dl>
          ) : (
            <p className="hint">Not currently checked out.</p>
          )}
        </div>

        <div className="card">
          <h2>Utilization (AI service)</h2>
          {utilization?.available && utilization.data ? (
            <dl className="kv-list">
              <div><dt>Window</dt><dd>{utilization.data.windowDays} days ({utilization.data.sampleCount} readings)</dd></div>
              <div><dt>Utilization</dt><dd>{utilization.data.utilizationPct != null ? `${utilization.data.utilizationPct}%` : 'Not enough data'}</dd></div>
              <div><dt>Active / Idle</dt><dd>{utilization.data.activeHours}h / {utilization.data.idleHours}h</dd></div>
              {utilization.data.underUsed && <div className="alert-severity-medium"><dt>Flag</dt><dd>Under-utilized — candidate for reassignment</dd></div>}
            </dl>
          ) : (
            <p className="hint">Forecast unavailable — AI service is unreachable.</p>
          )}
        </div>

        <div className="card">
          <h2>Last maintenance</h2>
          <dl className="kv-list">
            <div><dt>Date</dt><dd>{equipment.lastMaintenanceOn ?? 'Unknown'}</dd></div>
            <div><dt>Location</dt><dd>{equipment.latitude != null && equipment.longitude != null ? `${equipment.latitude.toFixed(4)}, ${equipment.longitude.toFixed(4)}` : 'Unknown'}</dd></div>
          </dl>
        </div>
      </section>

      <section className="detail-grid">
        <div className="card">
          <SparklineChart title="Health score over time" data={healthSeries} color={SEQUENTIAL_BLUE} unit="%" />
        </div>
        <div className="card">
          <SparklineChart title="Fuel gauge over time" data={fuelSeries} color={SEQUENTIAL_ORANGE} unit="%" />
        </div>
      </section>

      <section className="card">
        <h2>Anomaly detection (AI service)</h2>
        {anomalies?.available && anomalies.data ? (
          anomalies.data.anomalies.length > 0 ? (
            <ul className="anomaly-list">
              {anomalies.data.anomalies.map((a, i) => (
                <li key={i} className={SEVERITY_CLASS[a.severity] ?? ''}>
                  <strong>{a.anomalyType.replace(/_/g, ' ')}</strong> — {a.detail}
                  <span className="anomaly-time"> ({new Date(a.recordedAt).toLocaleString()})</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="hint">No anomalies detected in the last {anomalies.data.sampleCount} readings.</p>
          )
        ) : (
          <p className="hint">Anomaly detection unavailable — AI service is unreachable.</p>
        )}
      </section>

      <section className="card">
        <h2>Open alerts</h2>
        {openAlerts.length === 0 ? (
          <p className="hint">No open alerts for this equipment.</p>
        ) : (
          <ul className="alert-list">
            {openAlerts.map((a) => (
              <li key={a.alertId}>
                <strong>{a.alertType.replace(/_/g, ' ')}</strong> — {a.message}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
