import { useEffect, useState, type FormEvent } from 'react';
import { api, ApiError } from '../../api/client';
import type { Operator } from '../../api/types';

export function OperatorsPage() {
  const [operators, setOperators] = useState<Operator[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [operatorName, setOperatorName] = useState('');
  const [phone, setPhone] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [licenseValidity, setLicenseValidity] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const load = () => api.get<Operator[]>('/api/operators').then(setOperators).catch(() => {});

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      await api.post('/api/operators', {
        operatorName, phone, licenseNumber,
        licenseValidity: licenseValidity || null,
      });
      setSuccess(`Operator "${operatorName}" created.`);
      setOperatorName(''); setPhone(''); setLicenseNumber(''); setLicenseValidity('');
      setShowForm(false);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to create operator');
    }
  };

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Operators</h1>
          <p className="subtitle">{operators.length} operators</p>
        </div>
        <button onClick={() => setShowForm((s) => !s)}>{showForm ? 'Cancel' : 'Add operator'}</button>
      </header>

      {error && <div className="error-banner">{error}</div>}
      {success && <div className="success-banner">{success}</div>}

      {showForm && (
        <form className="form-card" onSubmit={handleSubmit}>
          <label>Name<input value={operatorName} onChange={(e) => setOperatorName(e.target.value)} required /></label>
          <label>Phone<input value={phone} onChange={(e) => setPhone(e.target.value)} /></label>
          <label>License number<input value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} /></label>
          <label>License validity<input type="date" value={licenseValidity} onChange={(e) => setLicenseValidity(e.target.value)} /></label>
          <button type="submit">Create operator</button>
        </form>
      )}

      <table className="data-table">
        <thead><tr><th>Name</th><th>Phone</th><th>License #</th><th>License valid until</th></tr></thead>
        <tbody>
          {operators.map((o) => (
            <tr key={o.operatorId}>
              <td>{o.operatorName}</td>
              <td>{o.phone ?? '—'}</td>
              <td>{o.licenseNumber ?? '—'}</td>
              <td>{o.licenseValidity ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
