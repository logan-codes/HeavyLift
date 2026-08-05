import { useEffect, useState, type FormEvent } from 'react';
import { api, ApiError } from '../../api/client';
import type { AppUser } from '../../api/types';

interface Role {
  roleId: number;
  name: string;
}

export function UsersPage() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [roleId, setRoleId] = useState<number | ''>('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const load = () => api.get<AppUser[]>('/api/users').then(setUsers).catch(() => {});

  useEffect(() => {
    load();
    api.get<Role[]>('/api/roles').then((r) => { setRoles(r); if (r.length > 0) setRoleId(r[0].roleId); }).catch(() => {});
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!roleId) return;
    try {
      await api.post('/api/users', { username, password, firstName, lastName, email, phone, roleId });
      setSuccess(`User "${username}" created.`);
      setUsername(''); setPassword(''); setFirstName(''); setLastName(''); setEmail(''); setPhone('');
      setShowForm(false);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to create user');
    }
  };

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Users</h1>
          <p className="subtitle">{users.length} accounts</p>
        </div>
        <button onClick={() => setShowForm((s) => !s)}>{showForm ? 'Cancel' : 'Add user'}</button>
      </header>

      {error && <div className="error-banner">{error}</div>}
      {success && <div className="success-banner">{success}</div>}

      {showForm && (
        <form className="form-card" onSubmit={handleSubmit}>
          <div className="form-row">
            <label>Username<input value={username} onChange={(e) => setUsername(e.target.value)} required /></label>
            <label>Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></label>
          </div>
          <div className="form-row">
            <label>First name<input value={firstName} onChange={(e) => setFirstName(e.target.value)} /></label>
            <label>Last name<input value={lastName} onChange={(e) => setLastName(e.target.value)} /></label>
          </div>
          <div className="form-row">
            <label>Email<input value={email} onChange={(e) => setEmail(e.target.value)} /></label>
            <label>Phone<input value={phone} onChange={(e) => setPhone(e.target.value)} /></label>
          </div>
          <label>
            Role
            <select value={roleId} onChange={(e) => setRoleId(Number(e.target.value))}>
              {roles.map((r) => <option key={r.roleId} value={r.roleId}>{r.name}</option>)}
            </select>
          </label>
          <button type="submit">Create user</button>
        </form>
      )}

      <table className="data-table">
        <thead><tr><th>Username</th><th>Name</th><th>Role</th><th>Status</th><th>Email</th></tr></thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.userId}>
              <td>{u.username}</td>
              <td>{u.firstName} {u.lastName}</td>
              <td>{u.roleName ?? '—'}</td>
              <td>{u.statusName ?? '—'}</td>
              <td>{u.email ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
