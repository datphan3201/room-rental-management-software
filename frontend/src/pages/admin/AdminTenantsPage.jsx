import React from 'react';
import { api } from '../../api/client.js';
import { ActionButton, ActionDialog } from '../../components/ActionDialog.jsx';
import { ListToolbar, useListView } from '../../components/ListTools.jsx';
import { Modal } from '../../components/Modal.jsx';

const emptyTenant = {
  fullName: '',
  phone: '',
  password: '',
  email: '',
  identityNumber: '',
  dateOfBirth: '',
  hometown: '',
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
  const [formOpen, setFormOpen] = React.useState(false);
  const [actionTenant, setActionTenant] = React.useState(null);
  const listView = useListView(tenants, {
    searchFields: ['fullName', 'phone', 'email', 'identityNumber', 'hometown'],
  });

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
    setFormOpen(true);
    setForm({
      fullName: tenant.fullName || '',
      phone: tenant.phone || '',
      password: '',
      email: tenant.email || '',
      identityNumber: tenant.identityNumber || '',
      dateOfBirth: formatDate(tenant.dateOfBirth),
      hometown: tenant.hometown || '',
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyTenant);
    setFormOpen(false);
  }

  function startCreate() {
    setEditingId(null);
    setForm(emptyTenant);
    setFormOpen(true);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = { ...form, password: form.password.trim() };
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
    if (!window.confirm('Delete?')) return;
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
        </div>
        <button type="button" className="button secondary" onClick={startCreate}>
          New
        </button>
      </div>

      {error ? <div className="error-box">{error}</div> : null}

      <div className="panel-subsection">
        <h3>Tenant list</h3>
        <ListToolbar view={listView} searchPlaceholder="Search name, phone, identity..." />
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
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {listView.items.length ? (
                  listView.items.map((tenant) => (
                    <tr key={tenant._id}>
                      <td>
                        <div className="record-primary">
                          <strong>{tenant.fullName}</strong>
                        </div>
                      </td>
                      <td>{tenant.phone}</td>
                      <td>{tenant.email || '-'}</td>
                      <td>{tenant.identityNumber}</td>
                      <td>{formatDate(tenant.dateOfBirth)}</td>
                      <td>{tenant.hometown}</td>
                      <td className="row-action-cell"><ActionButton onClick={() => setActionTenant(tenant)} /></td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="muted">
                      No matching tenants.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={formOpen} title={editingId ? 'Edit' : 'Create'} onClose={resetForm}>
        <form className="form-grid" onSubmit={handleSubmit}>
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
            {editingId ? 'New Password' : 'Password'}
            <input
              type="password"
              minLength="6"
              value={form.password}
              placeholder={editingId ? 'Leave blank to keep current password' : ''}
              onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
              required={!editingId}
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
          <div className="button-row">
            <button type="submit" className="button" disabled={saving}>
              {saving ? 'Saving...' : editingId ? 'Update' : 'Create'}
            </button>
            <button type="button" className="button secondary" onClick={resetForm}>
              Cancel
            </button>
          </div>
        </form>
      </Modal>
      <ActionDialog
        open={Boolean(actionTenant)}
        title={actionTenant ? actionTenant.fullName : 'Tenant actions'}
        onClose={() => setActionTenant(null)}
        actions={[
          {
            label: 'Edit',
            onClick: () => {
              startEdit(actionTenant);
              setActionTenant(null);
            },
          },
          {
            label: 'Delete',
            variant: 'danger',
            onClick: () => handleDelete(actionTenant._id),
          },
        ]}
      />
    </section>
  );
}
