import React from 'react';
import { api } from '../../api/client.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { formatCurrency, formatDate } from '../../utils/format.js';

export function TenantDashboardPage() {
  const { auth } = useAuth();
  const [stats, setStats] = React.useState(null);
  const [announcements, setAnnouncements] = React.useState([]);
  const [activeContract, setActiveContract] = React.useState(null);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    let mounted = true;
    Promise.all([
      api.get('/dashboard/tenant'),
      api.get('/announcements/pinned'),
      api.get('/contracts/me'),
    ])
      .then(([statsResponse, announcementsResponse, contractsResponse]) => {
        if (mounted) {
          setStats(statsResponse.data.data || null);
          setAnnouncements(announcementsResponse.data.data || []);
          setActiveContract((contractsResponse.data.data || []).find((contract) => contract.status === 'Active') || null);
        }
      })
      .catch((requestError) => {
        if (mounted) {
          setError(requestError?.response?.data?.message || 'Failed to load tenant dashboard');
        }
      });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section className="panel wide">
      <h2>Tenant Portal</h2>
      <p className="dashboard-greeting">Hello, {auth?.user?.tenant?.fullName || auth?.user?.phone || 'Tenant'}</p>
      {error ? <div className="error-box">{error}</div> : null}
      <div className="dashboard-stack">
        <div className="panel-subsection">
          <div className="panel-header compact">
            <div>
              <h3>Pinned announcements</h3>
            </div>
          </div>
          <div className="announcement-list">
            {announcements.length ? announcements.map((announcement) => (
              <article className="announcement-item tenant-announcement" key={announcement._id}>
                <div className="announcement-main">
                  <div className="record-primary">
                    <strong>{announcement.title}</strong>
                    <span className="pin-label">Pinned</span>
                  </div>
                  <p>{announcement.content}</p>
                  <div className="muted">Pinned {formatDate(announcement.pinnedAt)}</div>
                </div>
              </article>
            )) : <p className="muted">No pinned announcements.</p>}
          </div>
        </div>

        {activeContract ? (
          <div className="panel-subsection">
            <h3>My room</h3>
            <div className="room-summary-grid">
              <div><span>Room</span><strong>{activeContract.roomId?.roomNumber || '-'}</strong></div>
              <div><span>Type</span><strong>{activeContract.roomId?.roomType || '-'}</strong></div>
              <div><span>Rent</span><strong>{formatCurrency(activeContract.monthlyRent)}</strong></div>
              <div><span>Contract</span><strong>{formatDate(activeContract.startDate)} to {formatDate(activeContract.endDate)}</strong></div>
            </div>
          </div>
        ) : null}

        <div className="panel-subsection">
          <div className="stats-grid">
            <div className="stat-card"><div className="muted">Total invoices</div><div className="stat-value">{stats?.totalInvoices ?? '-'}</div></div>
            <div className="stat-card"><div className="muted">Unpaid invoices</div><div className="stat-value">{stats?.unpaidInvoices ?? '-'}</div></div>
            <div className="stat-card"><div className="muted">Paid invoices</div><div className="stat-value">{stats?.paidInvoices ?? '-'}</div></div>
            <div className="stat-card"><div className="muted">Total billed</div><div className="stat-value">{formatCurrency(stats?.totalAmount ?? 0)}</div></div>
          </div>
        </div>
      </div>
    </section>
  );
}
