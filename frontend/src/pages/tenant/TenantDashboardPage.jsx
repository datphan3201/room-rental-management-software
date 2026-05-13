import React from 'react';
import { api } from '../../api/client.js';
import { formatCurrency } from '../../utils/format.js';

export function TenantDashboardPage() {
  const [stats, setStats] = React.useState(null);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    let mounted = true;
    api
      .get('/dashboard/tenant')
      .then(({ data }) => {
        if (mounted) {
          setStats(data.data || null);
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
      <p className="muted">Summary of your contract, invoices, payments, and maintenance workflow.</p>
      {error ? <div className="error-box">{error}</div> : null}
      <div className="stats-grid">
        <div className="stat-card"><div className="muted">Total invoices</div><div className="stat-value">{stats?.totalInvoices ?? '-'}</div></div>
        <div className="stat-card"><div className="muted">Unpaid invoices</div><div className="stat-value">{stats?.unpaidInvoices ?? '-'}</div></div>
        <div className="stat-card"><div className="muted">Paid invoices</div><div className="stat-value">{stats?.paidInvoices ?? '-'}</div></div>
        <div className="stat-card"><div className="muted">Total billed</div><div className="stat-value">{formatCurrency(stats?.totalAmount ?? 0)}</div></div>
      </div>
    </section>
  );
}
