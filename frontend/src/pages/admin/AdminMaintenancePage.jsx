import React from 'react';
import { api } from '../../api/client.js';
import { ActionButton, ActionDialog } from '../../components/ActionDialog.jsx';
import { ListToolbar, useListView } from '../../components/ListTools.jsx';
import { Modal } from '../../components/Modal.jsx';
import { StatusBadge } from '../../components/StatusBadge.jsx';
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
  const [reviewOpen, setReviewOpen] = React.useState(false);
  const [actionRequest, setActionRequest] = React.useState(null);
  const listView = useListView(requests, {
    searchFields: ['title', 'tenantId.fullName', 'roomId.roomNumber', 'status', 'responseNote'],
    statusField: 'status',
  });

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
    setReviewOpen(true);
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
    setReviewOpen(false);
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

      <div className="panel-subsection">
        <h3>Requests</h3>
        <ListToolbar view={listView} searchPlaceholder="Search request, tenant, room..." />
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
                </tr>
              </thead>
              <tbody>
                {listView.items.length ? listView.items.map((request) => (
                  <tr key={request._id}>
                    <td>
                      <div className="record-primary">
                        <strong>{request.title}</strong>
                        <ActionButton onClick={() => setActionRequest(request)} />
                      </div>
                    </td>
                    <td>{request.tenantId?.fullName || '-'}</td>
                    <td>{request.roomId?.roomNumber || '-'}</td>
                    <td><StatusBadge value={request.status} /></td>
                    <td>{formatDate(request.createdAt)}</td>
                  </tr>
                )) : <tr><td colSpan="5" className="muted">No matching requests.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={reviewOpen} title="Review request" onClose={resetForm}>
        <form className="form-grid" onSubmit={handleSubmit}>
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
            <button type="button" className="button secondary" onClick={resetForm}>Cancel</button>
          </div>
          <div className="panel-subsection">
            <div className="muted">Resolved cost preview</div>
            <strong>{formatCurrency(form.maintenanceCost || 0)}</strong>
          </div>
        </form>
      </Modal>
      <ActionDialog
        open={Boolean(actionRequest)}
        title={actionRequest ? actionRequest.title : 'Maintenance actions'}
        description="Choose a maintenance action."
        onClose={() => setActionRequest(null)}
        actions={[
          {
            label: 'Review request',
            hint: 'Update status and response',
            onClick: () => startEdit(actionRequest),
          },
        ]}
      />
    </section>
  );
}
