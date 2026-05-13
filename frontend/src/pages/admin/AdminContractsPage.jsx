import React from 'react';
import { api } from '../../api/client.js';
import { formatDate, formatCurrency } from '../../utils/format.js';

const emptyContract = {
  tenantId: '',
  roomId: '',
  startDate: '',
  endDate: '',
  depositAmount: 0,
  monthlyRent: 0,
  status: 'Active',
  contractImageUrl: '',
  note: '',
};

export function AdminContractsPage() {
  const [contracts, setContracts] = React.useState([]);
  const [tenants, setTenants] = React.useState([]);
  const [rooms, setRooms] = React.useState([]);
  const [form, setForm] = React.useState(emptyContract);
  const [editingId, setEditingId] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState('');

  async function loadData() {
    setLoading(true);
    setError('');
    try {
      const [contractsRes, tenantsRes, roomsRes] = await Promise.all([
        api.get('/contracts'),
        api.get('/tenants'),
        api.get('/rooms'),
      ]);
      setContracts(contractsRes.data.data || []);
      setTenants(tenantsRes.data.data || []);
      setRooms(roomsRes.data.data || []);
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Failed to load contracts');
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    loadData();
  }, []);

  function resetForm() {
    setEditingId(null);
    setForm(emptyContract);
  }

  function startEdit(contract) {
    setEditingId(contract._id);
    setForm({
      tenantId: contract.tenantId?._id || contract.tenantId || '',
      roomId: contract.roomId?._id || contract.roomId || '',
      startDate: formatDate(contract.startDate),
      endDate: formatDate(contract.endDate),
      depositAmount: contract.depositAmount ?? 0,
      monthlyRent: contract.monthlyRent ?? 0,
      status: contract.status || 'Active',
      contractImageUrl: contract.contractImageUrl || '',
      note: contract.note || '',
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        depositAmount: Number(form.depositAmount),
        monthlyRent: Number(form.monthlyRent),
      };
      if (editingId) {
        await api.put(`/contracts/${editingId}`, payload);
      } else {
        await api.post('/contracts', payload);
      }
      await loadData();
      resetForm();
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Failed to save contract');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this contract?')) return;
    try {
      await api.delete(`/contracts/${id}`);
      await loadData();
      if (editingId === id) resetForm();
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Failed to delete contract');
    }
  }

  return (
    <section className="panel wide">
      <div className="panel-header">
        <div>
          <h2>Contracts</h2>
          <p className="muted">Manage contract metadata and room occupancy state.</p>
        </div>
        <button type="button" className="button secondary" onClick={resetForm}>New contract</button>
      </div>

      {error ? <div className="error-box">{error}</div> : null}

      <div className="grid-two">
        <div className="panel-subsection">
          <h3>Contract list</h3>
          {loading ? (
            <p className="muted">Loading...</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Tenant</th>
                    <th>Room</th>
                    <th>Period</th>
                    <th>Status</th>
                    <th>Rent</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {contracts.length ? contracts.map((contract) => (
                    <tr key={contract._id}>
                      <td>{contract.tenantId?.fullName || '-'}</td>
                      <td>{contract.roomId?.roomNumber || '-'}</td>
                      <td>{formatDate(contract.startDate)} to {formatDate(contract.endDate)}</td>
                      <td>{contract.status}</td>
                      <td>{formatCurrency(contract.monthlyRent)}</td>
                      <td className="row-actions">
                        <button type="button" className="text-button dark" onClick={() => startEdit(contract)}>Edit</button>
                        <button type="button" className="text-button danger" onClick={() => handleDelete(contract._id)}>Delete</button>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan="6" className="muted">No contracts yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <form className="panel-subsection form-grid" onSubmit={handleSubmit}>
          <h3>{editingId ? 'Edit contract' : 'Create contract'}</h3>
          <label>
            Tenant
            <select value={form.tenantId} onChange={(e) => setForm((prev) => ({ ...prev, tenantId: e.target.value }))} required>
              <option value="">Select tenant</option>
              {tenants.map((tenant) => <option key={tenant._id} value={tenant._id}>{tenant.fullName} ({tenant.phone})</option>)}
            </select>
          </label>
          <label>
            Room
            <select value={form.roomId} onChange={(e) => setForm((prev) => ({ ...prev, roomId: e.target.value }))} required>
              <option value="">Select room</option>
              {rooms.map((room) => <option key={room._id} value={room._id}>{room.roomNumber} - {room.status}</option>)}
            </select>
          </label>
          <label>
            Start Date
            <input type="date" value={form.startDate} onChange={(e) => setForm((prev) => ({ ...prev, startDate: e.target.value }))} required />
          </label>
          <label>
            End Date
            <input type="date" value={form.endDate} onChange={(e) => setForm((prev) => ({ ...prev, endDate: e.target.value }))} required />
          </label>
          <label>
            Deposit Amount
            <input type="number" min="0" value={form.depositAmount} onChange={(e) => setForm((prev) => ({ ...prev, depositAmount: e.target.value }))} required />
          </label>
          <label>
            Monthly Rent
            <input type="number" min="0" value={form.monthlyRent} onChange={(e) => setForm((prev) => ({ ...prev, monthlyRent: e.target.value }))} required />
          </label>
          <label>
            Status
            <select value={form.status} onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}>
              <option value="Active">Active</option>
              <option value="Expired">Expired</option>
              <option value="Terminated">Terminated</option>
            </select>
          </label>
          <label>
            Contract Image URL
            <input value={form.contractImageUrl} onChange={(e) => setForm((prev) => ({ ...prev, contractImageUrl: e.target.value }))} />
          </label>
          <label>
            Note
            <textarea rows="4" value={form.note} onChange={(e) => setForm((prev) => ({ ...prev, note: e.target.value }))} />
          </label>
          <div className="button-row">
            <button className="button" disabled={saving}>{saving ? 'Saving...' : editingId ? 'Update contract' : 'Create contract'}</button>
            {editingId ? <button type="button" className="button secondary" onClick={resetForm}>Cancel</button> : null}
          </div>
        </form>
      </div>
    </section>
  );
}
