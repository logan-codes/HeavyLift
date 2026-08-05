import { useEffect, useState, type FormEvent } from 'react';
import { api, ApiError } from '../../api/client';
import type { Customer } from '../../api/types';

export function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const load = () => api.get<Customer[]>('/api/customers').then(setCustomers).catch(() => {});

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      await api.post('/api/customers', { name, contactPerson, phone, email, address });
      setSuccess(`Customer "${name}" created.`);
      setName(''); setContactPerson(''); setPhone(''); setEmail(''); setAddress('');
      setShowForm(false);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to create customer');
    }
  };

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Customers</h1>
          <p className="subtitle">{customers.length} customers</p>
        </div>
        <button onClick={() => setShowForm((s) => !s)}>{showForm ? 'Cancel' : 'Add customer'}</button>
      </header>

      {error && <div className="error-banner">{error}</div>}
      {success && <div className="success-banner">{success}</div>}

      {showForm && (
        <form className="form-card" onSubmit={handleSubmit}>
          <label>Company name<input value={name} onChange={(e) => setName(e.target.value)} required /></label>
          <label>Contact person<input value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} /></label>
          <div className="form-row">
            <label>Phone<input value={phone} onChange={(e) => setPhone(e.target.value)} /></label>
            <label>Email<input value={email} onChange={(e) => setEmail(e.target.value)} /></label>
          </div>
          <label>Address<input value={address} onChange={(e) => setAddress(e.target.value)} /></label>
          <button type="submit">Create customer</button>
        </form>
      )}

      <table className="data-table">
        <thead><tr><th>Name</th><th>Contact</th><th>Phone</th><th>Email</th></tr></thead>
        <tbody>
          {customers.map((c) => (
            <tr key={c.customerId}>
              <td>{c.name}</td>
              <td>{c.contactPerson ?? '—'}</td>
              <td>{c.phone ?? '—'}</td>
              <td>{c.email ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
