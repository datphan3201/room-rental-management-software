import React from 'react';
import { api } from '../../api/client.js';
import { formatDate, formatCurrency } from '../../utils/format.js';

const emptyMaintenance = {
  status: 'Pending Review',
  responseNote: '',
  maintenanceCost: '',
  resolvedAt: '',
};

export function AdminMaintenancePage() {
  const [requests, setRequests] = React.useState([]);
  const [form, setForm] = React.useState(emptyMaintenance);
  const [selectedId, setSelectedId] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState('');

  async function loadData() {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/maintenance');
      setRequests(data.data || []);
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Failed to load maintenance requests');
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    loadData();
  }, []);

  function startEdit(request) {
    setSelectedId(request._id);
    setForm({
      status: request.status || 'Pending Review',
      responseNote: request.responseNote || '',
      maintenanceCost: request.maintenanceCost ?? '',
      resolvedAt: formatDate(request.resolvedAt),
    });
  }

  function resetForm() {
    setSelectedId('');
    setForm(emptyMaintenance);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!selectedId) return;
    setSaving(true);
    setError('');
    try {
      await api.put(`/maintenance/${selectedId}`, {
        ...form,
        maintenanceCost: form.maintenanceCost === '' ? null : Number(form.maintenanceCost),
      });
      await loadData();
      resetForm();
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Failed to update maintenance request');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="panel wide">
      <div className="panel-header">
        <div>
          <h2>Maintenance</h2>
          <p className="muted">Review tenant requests, accept or reject them, then resolve when done.</p>
        </div>
      </div>

      {error ? <div className="error-box">{error}</div> : null}

      <div className="grid-two">
        <div className="panel-subsection">
          <h3>Requests</h3>
          {loading ? <p className="muted">Loading...</p> : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Tenant</th>
                    <th>Room</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.length ? requests.map((request) => (
                    <tr key={request._id}>
                      <td>{request.title}</td>
                      <td>{request.tenantId?.fullName || '-'}</td>
                      <td>{request.roomId?.roomNumber || '-'}</td>
                      <td>{request.status}</td>
                      <td>{formatDate(request.createdAt)}</td>
                      <td className="row-actions">
                        <button type="button" className="text-button dark" onClick={() => startEdit(request)}>Review</button>
                      </td>
                    </tr>
                  )) : <tr><td colSpan="6" className="muted">No requests yet.</td></tr>}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <form className="panel-subsection form-grid" onSubmit={handleSubmit}>
          <h3>{selectedId ? 'Review request' : 'Select a request'}</h3>
          <label>
            Status
            <select value={form.status} onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}>
              <option value="Pending Review">Pending Review</option>
              <option value="Accepted">Accepted</option>
              <option value="Rejected">Rejected</option>
              <option value="Resolved">Resolved</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </label>
          <label>
            Response Note
            <textarea rows="4" value={form.responseNote} onChange={(e) => setForm((prev) => ({ ...prev, responseNote: e.target.value }))} />
          </label>
          <label>
            Maintenance Cost
            <input type="number" min="0" value={form.maintenanceCost} onChange={(e) => setForm((prev) => ({ ...prev, maintenanceCost: e.target.value }))} />
          </label>
          <label>
            Resolved At
            <input type="date" value={form.resolvedAt} onChange={(e) => setForm((prev) => ({ ...prev, resolvedAt: e.target.value }))} />
          </label>
          <div className="panel-subsection">
            <div className="muted">Selected request</div>
            <strong>{selectedId || 'None'}</strong>
          </div>
          <div className="button-row">
            <button className="button" disabled={saving || !selectedId}>{saving ? 'Saving...' : 'Update request'}</button>
            <button type="button" className="button secondary" onClick={resetForm}>Reset</button>
          </div>
          <div className="panel-subsection">
            <div className="muted">Resolved cost preview</div>
            <strong>{formatCurrency(form.maintenanceCost || 0)}</strong>
          </div>
        </form>
      </div>
    </section>
  );
}
