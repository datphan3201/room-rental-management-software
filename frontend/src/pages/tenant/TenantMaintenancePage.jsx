import React from 'react';
import { api } from '../../api/client.js';
import { formatDate } from '../../utils/format.js';

const emptyRequest = {
  roomId: '',
  title: '',
  description: '',
};

export function TenantMaintenancePage() {
  const [requests, setRequests] = React.useState([]);
  const [contracts, setContracts] = React.useState([]);
  const [form, setForm] = React.useState(emptyRequest);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState('');

  async function loadData() {
    setLoading(true);
    setError('');
    try {
      const [requestsRes, contractsRes] = await Promise.all([api.get('/maintenance/me'), api.get('/contracts/me')]);
      setRequests(requestsRes.data.data || []);
      setContracts(contractsRes.data.data || []);
      const activeContract = (contractsRes.data.data || []).find((contract) => contract.status === 'Active');
      if (activeContract) {
        setForm((prev) => ({ ...prev, roomId: activeContract.roomId?._id || activeContract.roomId || '' }));
      }
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Failed to load maintenance data');
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    loadData();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.post('/maintenance', form);
      await loadData();
      setForm((prev) => ({
        roomId: prev.roomId,
        title: '',
        description: '',
      }));
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Failed to submit maintenance request');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="panel wide">
      <div className="panel-header">
        <div>
          <h2>My Maintenance</h2>
          <p className="muted">Submit a request for your assigned room and track review status.</p>
        </div>
      </div>

      {error ? <div className="error-box">{error}</div> : null}

      <div className="grid-two">
        <form className="panel-subsection form-grid" onSubmit={handleSubmit}>
          <h3>New request</h3>
          <label>
            Room
            <select value={form.roomId} onChange={(e) => setForm((prev) => ({ ...prev, roomId: e.target.value }))} required>
              <option value="">Select room</option>
              {contracts.filter((contract) => contract.status === 'Active').map((contract) => (
                <option key={contract._id} value={contract.roomId?._id || contract.roomId}>
                  {contract.roomId?.roomNumber || 'Room'}
                </option>
              ))}
            </select>
          </label>
          <label>
            Title
            <input value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} required />
          </label>
          <label>
            Description
            <textarea rows="5" value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} required />
          </label>
          <div className="button-row">
            <button className="button" disabled={saving}>{saving ? 'Submitting...' : 'Submit request'}</button>
          </div>
          {loading ? <p className="muted">Loading...</p> : null}
        </form>

        <div className="panel-subsection">
          <h3>Request history</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Response</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {requests.length ? requests.map((request) => (
                  <tr key={request._id}>
                    <td>{request.title}</td>
                    <td>{request.status}</td>
                    <td>{request.responseNote || '-'}</td>
                    <td>{formatDate(request.createdAt)}</td>
                  </tr>
                )) : <tr><td colSpan="4" className="muted">No maintenance requests found.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
