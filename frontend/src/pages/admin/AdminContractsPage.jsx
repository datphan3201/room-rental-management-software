import React from 'react';
import { api } from '../../api/client.js';
import { ActionButton, ActionDialog } from '../../components/ActionDialog.jsx';
import { ListToolbar, useListView } from '../../components/ListTools.jsx';
import { Modal } from '../../components/Modal.jsx';
import { StatusBadge } from '../../components/StatusBadge.jsx';
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
  const [formOpen, setFormOpen] = React.useState(false);
  const [actionContract, setActionContract] = React.useState(null);
  const listView = useListView(contracts, {
    searchFields: ['tenantId.fullName', 'tenantId.phone', 'roomId.roomNumber', 'status', 'note'],
    statusField: 'status',
  });

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
    setFormOpen(false);
  }

  function startCreate() {
    setEditingId(null);
    setForm(emptyContract);
    setFormOpen(true);
  }

  function startEdit(contract) {
    setEditingId(contract._id);
    setFormOpen(true);
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

  function handleContractFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setForm((prev) => ({ ...prev, contractImageUrl: String(reader.result || '') }));
    };
    reader.readAsDataURL(file);
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete?')) return;
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
        </div>
        <button type="button" className="button secondary" onClick={startCreate}>New</button>
      </div>

      {error ? <div className="error-box">{error}</div> : null}

      <div className="panel-subsection">
        <h3>Contract list</h3>
        <ListToolbar view={listView} searchPlaceholder="Search tenant, room, note..." />
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
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {listView.items.length ? listView.items.map((contract) => (
                  <tr key={contract._id}>
                    <td>
                      <div className="record-primary">
                        <strong>{contract.tenantId?.fullName || '-'}</strong>
                      </div>
                    </td>
                    <td>{contract.roomId?.roomNumber || '-'}</td>
                    <td>{formatDate(contract.startDate)} to {formatDate(contract.endDate)}</td>
                    <td><StatusBadge value={contract.status} /></td>
                    <td>{formatCurrency(contract.monthlyRent)}</td>
                    <td className="row-action-cell"><ActionButton onClick={() => setActionContract(contract)} /></td>
                  </tr>
                )) : <tr><td colSpan="6" className="muted">No matching contracts.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={formOpen} title={editingId ? 'Edit' : 'Create'} onClose={resetForm}>
        <form className="form-grid" onSubmit={handleSubmit}>
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
            Upload Contract File
            <input type="file" accept="image/*,.pdf" onChange={handleContractFile} />
          </label>
          {form.contractImageUrl ? (
            <a className="inline-link" href={form.contractImageUrl} target="_blank" rel="noreferrer">
              Open contract attachment
            </a>
          ) : null}
          <label>
            Note
            <textarea rows="4" value={form.note} onChange={(e) => setForm((prev) => ({ ...prev, note: e.target.value }))} />
          </label>
          <div className="button-row">
            <button className="button" disabled={saving}>{saving ? 'Saving...' : editingId ? 'Update' : 'Create'}</button>
            <button type="button" className="button secondary" onClick={resetForm}>Cancel</button>
          </div>
        </form>
      </Modal>
      <ActionDialog
        open={Boolean(actionContract)}
        title={actionContract ? `${actionContract.tenantId?.fullName || 'Contract'} - ${actionContract.roomId?.roomNumber || 'Room'}` : 'Contract actions'}
        onClose={() => setActionContract(null)}
        actions={[
          {
            label: 'Edit',
            onClick: () => startEdit(actionContract),
          },
          {
            label: 'Delete',
            variant: 'danger',
            onClick: () => handleDelete(actionContract._id),
          },
        ]}
      />
    </section>
  );
}
