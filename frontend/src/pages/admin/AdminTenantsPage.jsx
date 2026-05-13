import React from 'react';
import { api } from '../../api/client.js';

const emptyTenant = {
  fullName: '',
  phone: '',
  email: '',
  identityNumber: '',
  dateOfBirth: '',
  hometown: '',
  password: '',
};

function formatDate(value) {
  if (!value) return '';
  return new Date(value).toISOString().slice(0, 10);
}

export function AdminTenantsPage() {
  const [tenants, setTenants] = React.useState([]);
  const [form, setForm] = React.useState(emptyTenant);
  const [editingId, setEditingId] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState('');

  async function loadTenants() {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/tenants');
      setTenants(data.data || []);
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Failed to load tenants');
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    loadTenants();
  }, []);

  function startEdit(tenant) {
    setEditingId(tenant._id);
    setForm({
      fullName: tenant.fullName || '',
      phone: tenant.phone || '',
      email: tenant.email || '',
      identityNumber: tenant.identityNumber || '',
      dateOfBirth: formatDate(tenant.dateOfBirth),
      hometown: tenant.hometown || '',
      password: '',
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyTenant);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = { ...form };
      if (editingId && !payload.password) {
        delete payload.password;
      }
      if (editingId) {
        await api.put(`/tenants/${editingId}`, payload);
      } else {
        await api.post('/tenants', payload);
      }
      await loadTenants();
      resetForm();
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Failed to save tenant');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this tenant?')) return;
    setError('');
    try {
      await api.delete(`/tenants/${id}`);
      await loadTenants();
      if (editingId === id) resetForm();
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Failed to delete tenant');
    }
  }

  return (
    <section className="panel wide">
      <div className="panel-header">
        <div>
          <h2>Tenants</h2>
          <p className="muted">Admin CRUD for tenant accounts and profiles.</p>
        </div>
        <button type="button" className="button secondary" onClick={resetForm}>
          New tenant
        </button>
      </div>

      {error ? <div className="error-box">{error}</div> : null}

      <div className="grid-two">
        <div className="panel-subsection">
          <h3>Tenant list</h3>
          {loading ? (
            <p className="muted">Loading...</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Phone</th>
                    <th>Email</th>
                    <th>Identity</th>
                    <th>DOB</th>
                    <th>Hometown</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {tenants.length ? (
                    tenants.map((tenant) => (
                      <tr key={tenant._id}>
                        <td>{tenant.fullName}</td>
                        <td>{tenant.phone}</td>
                        <td>{tenant.email || '-'}</td>
                        <td>{tenant.identityNumber}</td>
                        <td>{formatDate(tenant.dateOfBirth)}</td>
                        <td>{tenant.hometown}</td>
                        <td className="row-actions">
                          <button type="button" className="text-button dark" onClick={() => startEdit(tenant)}>
                            Edit
                          </button>
                          <button type="button" className="text-button danger" onClick={() => handleDelete(tenant._id)}>
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="muted">
                        No tenants yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <form className="panel-subsection form-grid" onSubmit={handleSubmit}>
          <h3>{editingId ? 'Edit tenant' : 'Create tenant'}</h3>
          <label>
            Full Name
            <input
              value={form.fullName}
              onChange={(event) => setForm((prev) => ({ ...prev, fullName: event.target.value }))}
              required
            />
          </label>
          <label>
            Phone
            <input
              value={form.phone}
              onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
              required
            />
          </label>
          <label>
            Email
            <input
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
            />
          </label>
          <label>
            Identity Number
            <input
              value={form.identityNumber}
              onChange={(event) => setForm((prev) => ({ ...prev, identityNumber: event.target.value }))}
              required
            />
          </label>
          <label>
            Date of Birth
            <input
              type="date"
              value={form.dateOfBirth}
              onChange={(event) => setForm((prev) => ({ ...prev, dateOfBirth: event.target.value }))}
              required
            />
          </label>
          <label>
            Hometown
            <input
              value={form.hometown}
              onChange={(event) => setForm((prev) => ({ ...prev, hometown: event.target.value }))}
              required
            />
          </label>
          <label>
            Password {editingId ? '(leave blank to keep current)' : ''}
            <input
              type="password"
              value={form.password}
              onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
              required={!editingId}
            />
          </label>
          <div className="button-row">
            <button type="submit" className="button" disabled={saving}>
              {saving ? 'Saving...' : editingId ? 'Update tenant' : 'Create tenant'}
            </button>
            {editingId ? (
              <button type="button" className="button secondary" onClick={resetForm}>
                Cancel
              </button>
            ) : null}
          </div>
        </form>
      </div>
    </section>
  );
}
