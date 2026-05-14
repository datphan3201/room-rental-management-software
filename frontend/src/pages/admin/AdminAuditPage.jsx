import React from 'react';
import { api } from '../../api/client.js';
import { ListToolbar, useListView } from '../../components/ListTools.jsx';
import { formatDate } from '../../utils/format.js';

export function AdminAuditPage() {
  const [logs, setLogs] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const listView = useListView(logs, {
    searchFields: ['action', 'entityType', 'summary', 'actorId.username', 'actorId.phone'],
    statusField: 'entityType',
  });

  async function loadLogs() {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/audit', { params: { limit: 200 } });
      setLogs(data.data || []);
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Failed to load audit log');
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    loadLogs();
  }, []);

  return (
    <section className="panel wide">
      <div className="panel-header">
        <div>
          <h2>Audit Log</h2>
          <p className="muted">Review recent administrative actions and tenant maintenance submissions.</p>
        </div>
        <button type="button" className="button secondary" onClick={loadLogs}>Refresh</button>
      </div>

      {error ? <div className="error-box">{error}</div> : null}

      <div className="panel-subsection">
        <h3>Activity</h3>
        <ListToolbar view={listView} searchPlaceholder="Search actor, action, entity..." />
        {loading ? <p className="muted">Loading...</p> : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Actor</th>
                  <th>Action</th>
                  <th>Entity</th>
                  <th>Summary</th>
                </tr>
              </thead>
              <tbody>
                {listView.items.length ? listView.items.map((log) => (
                  <tr key={log._id}>
                    <td>{formatDate(log.createdAt)}</td>
                    <td>{log.actorId?.username || log.actorId?.phone || '-'}</td>
                    <td>{log.action}</td>
                    <td>{log.entityType}</td>
                    <td>{log.summary}</td>
                  </tr>
                )) : <tr><td colSpan="5" className="muted">No matching audit events.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
