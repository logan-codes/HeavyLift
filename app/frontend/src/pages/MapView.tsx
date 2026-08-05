import { useEffect, useState } from 'react';
import { CircleMarker, MapContainer, Popup, TileLayer } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import { api, ApiError } from '../api/client';
import type { EquipmentSummary } from '../api/types';

const STATUS_COLORS: Record<string, string> = {
  Active: '#0ca30c',
  Idle: '#fab219',
  'In Maintenance': '#ec835a',
  Overdue: '#e66767',
};

const DEFAULT_CENTER: [number, number] = [39.7392, -104.9903];

export function MapView() {
  const [equipment, setEquipment] = useState<EquipmentSummary[]>([]);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get<EquipmentSummary[]>('/api/equipment')
      .then(setEquipment)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Failed to load equipment'));
  }, []);

  const withLocation = equipment.filter((e) => e.latitude != null && e.longitude != null);
  const center: [number, number] = withLocation.length > 0
    ? [withLocation[0].latitude as number, withLocation[0].longitude as number]
    : DEFAULT_CENTER;

  return (
    <div className="page map-page">
      <header className="page-header">
        <div>
          <h1>Fleet Map</h1>
          <p className="subtitle">Pins colored by equipment status — click a pin for details</p>
        </div>
      </header>

      {error && <div className="error-banner">{error}</div>}

      <div className="map-container">
        <MapContainer center={center} zoom={11} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {withLocation.map((e) => (
            <CircleMarker
              key={e.equipmentId}
              center={[e.latitude as number, e.longitude as number]}
              radius={9}
              pathOptions={{
                color: STATUS_COLORS[e.statusName ?? ''] ?? '#94a3b8',
                fillColor: STATUS_COLORS[e.statusName ?? ''] ?? '#94a3b8',
                fillOpacity: 0.85,
                weight: 2,
              }}
            >
              <Popup>
                <strong>{e.name}</strong>
                <br />
                Status: {e.statusName ?? 'Unknown'}
                <br />
                Health: {e.health != null ? `${e.health}%` : '—'}
                <br />
                <button onClick={() => navigate(`/equipment/${e.equipmentId}`)}>View details</button>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>

      {withLocation.length === 0 && !error && (
        <p className="hint">No equipment with a known location yet.</p>
      )}
    </div>
  );
}
