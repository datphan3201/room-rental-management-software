import React from 'react';
import { api } from '../../api/client.js';
import { formatCurrency } from '../../utils/format.js';

export function AdminReportsPage() {
  const [from, setFrom] = React.useState('2026-01');
  const [to, setTo] = React.useState('2026-12');
  const [report, setReport] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  async function loadReport() {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/reports/revenue', { params: { from, to } });
      setReport(data.data || null);
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Failed to load report');
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    loadReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const summary = report?.summary || {};

  return (
    <section className="panel wide">
      <div className="panel-header">
        <div>
          <h2>Reports</h2>
          <p className="muted">Track billed amount, paid revenue, unpaid balance, and overdue exposure by billing month.</p>
        </div>
      </div>

      {error ? <div className="error-box">{error}</div> : null}

      <div className="panel-subsection report-filters">
        <label>
          From
          <input value={from} onChange={(event) => setFrom(event.target.value)} placeholder="2026-01" />
        </label>
        <label>
          To
          <input value={to} onChange={(event) => setTo(event.target.value)} placeholder="2026-12" />
        </label>
        <button type="button" className="button" onClick={loadReport}>Run report</button>
      </div>

      <div className="stats-grid">
        <div className="stat-card"><div className="muted">Billed</div><div className="stat-value">{formatCurrency(summary.billedAmount)}</div></div>
        <div className="stat-card"><div className="muted">Paid</div><div className="stat-value">{formatCurrency(summary.paidAmount)}</div></div>
        <div className="stat-card"><div className="muted">Unpaid</div><div className="stat-value">{formatCurrency(summary.unpaidAmount)}</div></div>
        <div className="stat-card"><div className="muted">Overdue</div><div className="stat-value">{formatCurrency(summary.overdueAmount)}</div></div>
      </div>

      <div className="panel-subsection section-spaced">
        <h3>Monthly revenue</h3>
        {loading ? <p className="muted">Loading...</p> : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Invoices</th>
                  <th>Payments</th>
                  <th>Billed</th>
                  <th>Paid</th>
                  <th>Unpaid</th>
                  <th>Overdue</th>
                </tr>
              </thead>
              <tbody>
                {report?.rows?.length ? report.rows.map((row) => (
                  <tr key={row.month}>
                    <td>{row.month}</td>
                    <td>{row.invoiceCount}</td>
                    <td>{row.paymentCount}</td>
                    <td>{formatCurrency(row.billedAmount)}</td>
                    <td>{formatCurrency(row.paidAmount)}</td>
                    <td>{formatCurrency(row.unpaidAmount)}</td>
                    <td>{formatCurrency(row.overdueAmount)}</td>
                  </tr>
                )) : <tr><td colSpan="7" className="muted">No report data for this period.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
