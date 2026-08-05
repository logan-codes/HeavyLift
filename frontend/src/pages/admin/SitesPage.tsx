import { useEffect, useState, type FormEvent } from 'react';
import { api, ApiError } from '../../api/client';
import type { Site } from '../../api/types';

export function SitesPage() {
  const [sites, setSites] = useState<Site[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const load = () => api.get<Site[]>('/api/sites').then(setSites).catch(() => {});

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      await api.post('/api/sites', {
        name, address,
        latitude: latitude ? Number(latitude) : null,
        longitude: longitude ? Number(longitude) : null,
      });
      setSuccess(`Site "${name}" created.`);
      setName(''); setAddress(''); setLatitude(''); setLongitude('');
      setShowForm(false);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to create site');
    }
  };

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Sites</h1>
          <p className="subtitle">{sites.length} sites</p>
        </div>
        <button onClick={() => setShowForm((s) => !s)}>{showForm ? 'Cancel' : 'Add site'}</button>
      </header>

      {error && <div className="error-banner">{error}</div>}
      {success && <div className="success-banner">{success}</div>}

      {showForm && (
        <form className="form-card" onSubmit={handleSubmit}>
          <label>Name<input value={name} onChange={(e) => setName(e.target.value)} required /></label>
          <label>Address<input value={address} onChange={(e) => setAddress(e.target.value)} /></label>
          <div className="form-row">
            <label>Latitude<input value={latitude} onChange={(e) => setLatitude(e.target.value)} placeholder="39.7392" /></label>
            <label>Longitude<input value={longitude} onChange={(e) => setLongitude(e.target.value)} placeholder="-104.9903" /></label>
          </div>
          <button type="submit">Create site</button>
        </form>
      )}

      <table className="data-table">
        <thead><tr><th>Name</th><th>Address</th><th>Status</th><th>Location</th></tr></thead>
        <tbody>
          {sites.map((s) => (
            <tr key={s.siteId}>
              <td>{s.name}</td>
              <td>{s.address ?? '—'}</td>
              <td>{s.statusName ?? '—'}</td>
              <td>{s.latitude != null && s.longitude != null ? `${s.latitude.toFixed(4)}, ${s.longitude.toFixed(4)}` : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
