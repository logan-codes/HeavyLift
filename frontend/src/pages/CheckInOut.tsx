import { useEffect, useState, type FormEvent } from 'react';
import { api, ApiError } from '../api/client';
import type { Customer, RentalDto, Site } from '../api/types';

export function CheckInOut() {
  const [activeRentals, setActiveRentals] = useState<RentalDto[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [sites, setSites] = useState<Site[]>([]);

  const [equipmentCode, setEquipmentCode] = useState('');
  const [customerId, setCustomerId] = useState<number | ''>('');
  const [siteId, setSiteId] = useState<number | ''>('');
  const [dueOn, setDueOn] = useState('');
  const [rentalDays, setRentalDays] = useState('30');

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const load = () => api.get<RentalDto[]>('/api/rentals?active=true').then(setActiveRentals).catch(() => {});

  useEffect(() => {
    load();
    api.get<Customer[]>('/api/customers').then((c) => { setCustomers(c); if (c.length > 0) setCustomerId(c[0].customerId); }).catch(() => {});
    api.get<Site[]>('/api/sites').then((s) => { setSites(s); if (s.length > 0) setSiteId(s[0].siteId); }).catch(() => {});
  }, []);

  const handleCheckOut = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!customerId || !siteId || !equipmentCode || !dueOn) return;
    try {
      const rental = await api.post<RentalDto>('/api/rentals/check-out', {
        equipmentId: Number(equipmentCode),
        customerId,
        siteId,
        dueOn,
        rentalDays: Number(rentalDays),
      });
      setSuccess(`Checked out ${rental.equipmentName} to ${rental.customerName} (rental #${rental.rentalId}).`);
      setEquipmentCode('');
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Check-out failed');
    }
  };

  const handleCheckIn = async (rentalId: number) => {
    setError(null);
    setSuccess(null);
    try {
      const rental = await api.post<RentalDto>(`/api/rentals/${rentalId}/check-in`);
      setSuccess(`Checked in ${rental.equipmentName}.`);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Check-in failed');
    }
  };

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Check In / Check Out</h1>
          <p className="subtitle">Simulated QR/RFID scan — enter the equipment's numeric code</p>
        </div>
      </header>

      {error && <div className="error-banner">{error}</div>}
      {success && <div className="success-banner">{success}</div>}

      <div className="detail-grid">
        <form className="form-card" onSubmit={handleCheckOut}>
          <h2 style={{ margin: 0 }}>Check out equipment</h2>
          <label>Equipment code (ID)<input value={equipmentCode} onChange={(e) => setEquipmentCode(e.target.value)} placeholder="e.g. 14" required /></label>
          <label>
            Customer
            <select value={customerId} onChange={(e) => setCustomerId(Number(e.target.value))}>
              {customers.map((c) => <option key={c.customerId} value={c.customerId}>{c.name}</option>)}
            </select>
          </label>
          <label>
            Site
            <select value={siteId} onChange={(e) => setSiteId(Number(e.target.value))}>
              {sites.map((s) => <option key={s.siteId} value={s.siteId}>{s.name}</option>)}
            </select>
          </label>
          <div className="form-row">
            <label>Due on<input type="date" value={dueOn} onChange={(e) => setDueOn(e.target.value)} required /></label>
            <label>Rental days<input type="number" min={1} value={rentalDays} onChange={(e) => setRentalDays(e.target.value)} /></label>
          </div>
          <button type="submit">Check out</button>
        </form>

        <div className="card">
          <h2>Currently checked out ({activeRentals.length})</h2>
          {activeRentals.length === 0 ? (
            <p className="hint">Nothing checked out right now.</p>
          ) : (
            <table className="data-table">
              <thead><tr><th>Equipment</th><th>Customer</th><th>Site</th><th>Due</th><th></th></tr></thead>
              <tbody>
                {activeRentals.map((r) => (
                  <tr key={r.rentalId}>
                    <td>{r.equipmentName}</td>
                    <td>{r.customerName}</td>
                    <td>{r.siteName}</td>
                    <td>{r.dueOn}</td>
                    <td><button className="secondary" onClick={() => handleCheckIn(r.rentalId)}>Check in</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
