import React from 'react';
import { api } from '../../api/client.js';
import { formatCurrency } from '../../utils/format.js';

export function AdminDashboardPage() {
  const [stats, setStats] = React.useState(null);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    let mounted = true;
    api
      .get('/dashboard/admin')
      .then(({ data }) => {
        if (mounted) {
          setStats(data.data || null);
        }
      })
      .catch((requestError) => {
        if (mounted) {
          setError(requestError?.response?.data?.message || 'Failed to load dashboard stats');
        }
      });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section className="panel wide">
      <h2>Admin Dashboard</h2>
      <p className="muted">Overview of rooms, tenants, invoices, payments, and maintenance workflow.</p>
      {error ? <div className="error-box">{error}</div> : null}
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
    </section>
  );
}
