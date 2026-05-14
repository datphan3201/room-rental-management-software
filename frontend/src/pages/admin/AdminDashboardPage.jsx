import React from 'react';
import { api } from '../../api/client.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { formatCurrency, formatDate } from '../../utils/format.js';

const emptyAnnouncement = {
  title: '',
  content: '',
  isPinned: true,
};

export function AdminDashboardPage() {
  const { auth } = useAuth();
  const [stats, setStats] = React.useState(null);
  const [announcements, setAnnouncements] = React.useState([]);
  const [form, setForm] = React.useState(emptyAnnouncement);
  const [loadingAnnouncements, setLoadingAnnouncements] = React.useState(true);
  const [savingAnnouncement, setSavingAnnouncement] = React.useState(false);
  const [error, setError] = React.useState('');
  const [announcementError, setAnnouncementError] = React.useState('');

  async function loadStats() {
    try {
      const { data } = await api.get('/dashboard/admin');
      setStats(data.data || null);
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Failed to load dashboard stats');
    }
  }

  async function loadAnnouncements() {
    setLoadingAnnouncements(true);
    setAnnouncementError('');
    try {
      const { data } = await api.get('/announcements');
      setAnnouncements(data.data || []);
    } catch (requestError) {
      setAnnouncementError(requestError?.response?.data?.message || 'Failed to load announcements');
    } finally {
      setLoadingAnnouncements(false);
    }
  }

  React.useEffect(() => {
    loadStats();
    loadAnnouncements();
  }, []);

  async function handleAnnouncementSubmit(event) {
    event.preventDefault();
    setSavingAnnouncement(true);
    setAnnouncementError('');
    try {
      await api.post('/announcements', form);
      setForm(emptyAnnouncement);
      await loadAnnouncements();
    } catch (requestError) {
      setAnnouncementError(requestError?.response?.data?.message || 'Failed to save announcement');
    } finally {
      setSavingAnnouncement(false);
    }
  }

  async function setPinned(announcement, isPinned) {
    setAnnouncementError('');
    try {
      await api.put(`/announcements/${announcement._id}`, {
        title: announcement.title,
        content: announcement.content,
        isPinned,
      });
      await loadAnnouncements();
    } catch (requestError) {
      setAnnouncementError(requestError?.response?.data?.message || 'Failed to update announcement');
    }
  }

  async function deleteAnnouncement(announcement) {
    setAnnouncementError('');
    try {
      await api.delete(`/announcements/${announcement._id}`);
      await loadAnnouncements();
    } catch (requestError) {
      setAnnouncementError(requestError?.response?.data?.message || 'Failed to delete announcement');
    }
  }

  return (
    <section className="panel wide">
      <h2>Admin Dashboard</h2>
      <p className="dashboard-greeting">Hello, {auth?.user?.username || auth?.user?.phone || 'Admin'}</p>
      {error ? <div className="error-box">{error}</div> : null}
      <div className="dashboard-stack">
        <div className="panel-subsection">
          <div className="stats-grid">
            <div className="stat-card"><div className="muted">Total rooms</div><div className="stat-value">{stats?.totalRooms ?? '-'}</div></div>
            <div className="stat-card"><div className="muted">Available rooms</div><div className="stat-value">{stats?.availableRooms ?? '-'}</div></div>
            <div className="stat-card"><div className="muted">Occupied rooms</div><div className="stat-value">{stats?.occupiedRooms ?? '-'}</div></div>
            <div className="stat-card"><div className="muted">Maintenance rooms</div><div className="stat-value">{stats?.maintenanceRooms ?? '-'}</div></div>
            <div className="stat-card"><div className="muted">Total tenants</div><div className="stat-value">{stats?.totalTenants ?? '-'}</div></div>
            <div className="stat-card"><div className="muted">Unpaid invoices</div><div className="stat-value">{stats?.unpaidInvoices ?? '-'}</div></div>
            <div className="stat-card"><div className="muted">Paid invoices</div><div className="stat-value">{stats?.paidInvoices ?? '-'}</div></div>
            <div className="stat-card"><div className="muted">Monthly revenue</div><div className="stat-value">{formatCurrency(stats?.monthlyRevenue ?? 0)}</div></div>
          </div>
        </div>

        <div className="grid-two">
          <div className="panel-subsection">
            <div className="panel-header compact">
              <div>
                <h3>Announcements</h3>
              </div>
            </div>
            {announcementError ? <div className="error-box">{announcementError}</div> : null}
            {loadingAnnouncements ? <p className="muted">Loading announcements...</p> : (
              <div className="announcement-list">
                {announcements.length ? announcements.map((announcement) => (
                  <article className="announcement-item" key={announcement._id}>
                    <div className="announcement-main">
                      <div className="record-primary">
                        <strong>{announcement.title}</strong>
                        {announcement.isPinned ? <span className="pin-label">Pinned</span> : null}
                      </div>
                      <p>{announcement.content}</p>
                      <div className="muted">
                        {announcement.isPinned ? `Pinned ${formatDate(announcement.pinnedAt)}` : `Created ${formatDate(announcement.createdAt)}`}
                      </div>
                    </div>
                    <div className="announcement-actions">
                      <button type="button" className="text-button dark" onClick={() => setPinned(announcement, !announcement.isPinned)}>
                        {announcement.isPinned ? 'Unpin' : 'Pin'}
                      </button>
                      <button type="button" className="text-button danger" onClick={() => deleteAnnouncement(announcement)}>
                        Delete
                      </button>
                    </div>
                  </article>
                )) : <p className="muted">No announcements yet.</p>}
              </div>
            )}
          </div>

          <div className="panel-subsection">
            <h3>Announcement</h3>
            <form className="form-grid" onSubmit={handleAnnouncementSubmit}>
              <label>
                Title
                <input
                  value={form.title}
                  maxLength="120"
                  onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                />
              </label>
              <label>
                Content
                <textarea
                  rows="6"
                  value={form.content}
                  maxLength="2000"
                  onChange={(event) => setForm((prev) => ({ ...prev, content: event.target.value }))}
                />
              </label>
              <label className="checkbox-line">
                <input
                  type="checkbox"
                  checked={form.isPinned}
                  onChange={(event) => setForm((prev) => ({ ...prev, isPinned: event.target.checked }))}
                />
                Pin to tenant dashboard
              </label>
              <button className="button" disabled={savingAnnouncement}>
                {savingAnnouncement ? 'Saving...' : 'Publish'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
