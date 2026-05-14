import React from 'react';
import { api } from '../../api/client.js';
import { Modal } from '../../components/Modal.jsx';
import { StatusBadge } from '../../components/StatusBadge.jsx';
import { downloadCsv, rowsToCsv } from '../../utils/csv.js';
import { formatCurrency } from '../../utils/format.js';

const MONTHS = [
  ['01', 'January'],
  ['02', 'February'],
  ['03', 'March'],
  ['04', 'April'],
  ['05', 'May'],
  ['06', 'June'],
  ['07', 'July'],
  ['08', 'August'],
  ['09', 'September'],
  ['10', 'October'],
  ['11', 'November'],
  ['12', 'December'],
];

const EXPORT_COLUMNS = [
  ['room', 'Room'],
  ['tenant', 'Tenant'],
  ['billingPeriod', 'Billing Period'],
  ['roomFee', 'Room Fee'],
  ['electricityFee', 'Electricity Fee'],
  ['waterFee', 'Water Fee'],
  ['serviceFee', 'Service Fee'],
  ['totalAmount', 'Total Amount'],
  ['paidAmount', 'Paid Amount'],
  ['outstandingAmount', 'Outstanding Amount'],
  ['paymentStatus', 'Payment Status'],
  ['paymentDate', 'Payment Date'],
  ['note', 'Note'],
];

function currentYear() {
  return String(new Date().getFullYear());
}

function defaultExportColumns() {
  return EXPORT_COLUMNS.reduce((result, [key]) => ({ ...result, [key]: true }), {});
}

function percent(value) {
  return `${Number(value || 0).toFixed(2)}%`;
}

function makeFilename(year, month) {
  return `revenue-report-${year}-${month}.csv`;
}

export function AdminReportsPage() {
  const [year, setYear] = React.useState(currentYear());
  const [month, setMonth] = React.useState('05');
  const [status, setStatus] = React.useState('All');
  const [report, setReport] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [message, setMessage] = React.useState('');
  const [exportOpen, setExportOpen] = React.useState(false);
  const [exportOptions, setExportOptions] = React.useState({
    filename: makeFilename(currentYear(), '05'),
    includeSummary: true,
    includeDetails: true,
    columns: defaultExportColumns(),
  });

  const period = `${year}-${month}`;
  const summary = report?.summary || {};
  const details = report?.details || [];

  async function loadReport() {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const { data } = await api.get('/reports/revenue', {
        params: { month: period, year, status },
      });
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

  React.useEffect(() => {
    setExportOptions((prev) => ({
      ...prev,
      filename: makeFilename(year, month),
    }));
  }, [year, month]);

  function setExportColumn(key, checked) {
    setExportOptions((prev) => ({
      ...prev,
      columns: {
        ...prev.columns,
        [key]: checked,
      },
    }));
  }

  function buildCsv() {
    const rows = [];
    if (exportOptions.includeSummary) {
      rows.push(['Report', 'Revenue Report']);
      rows.push(['Period', period]);
      rows.push(['Payment Status', status]);
      rows.push(['Expected Revenue', summary.expectedRevenue || 0]);
      rows.push(['Collected Revenue', summary.collectedRevenue || 0]);
      rows.push(['Outstanding Amount', summary.outstandingAmount || 0]);
      rows.push(['Collection Rate', percent(summary.collectionRate)]);
      rows.push(['Paid Rooms', summary.paidRooms || 0]);
      rows.push(['Unpaid/Partial Rooms', summary.unpaidOrPartialRooms || 0]);
      if (exportOptions.includeDetails) {
        rows.push([]);
      }
    }

    if (exportOptions.includeDetails) {
      const selectedColumns = EXPORT_COLUMNS.filter(([key]) => exportOptions.columns[key]);
      rows.push(selectedColumns.map(([, label]) => label));
      for (const detail of details) {
        rows.push(selectedColumns.map(([key]) => detail[key] ?? ''));
      }
    }
    return rowsToCsv(rows);
  }

  function handleExport() {
    setError('');
    setMessage('');
    if (!exportOptions.includeSummary && !exportOptions.includeDetails) {
      setError('Select summary or details before exporting');
      return;
    }
    if (exportOptions.includeDetails && !EXPORT_COLUMNS.some(([key]) => exportOptions.columns[key])) {
      setError('Select at least one detail column');
      return;
    }
    downloadCsv(exportOptions.filename || makeFilename(year, month), buildCsv());
    setMessage('CSV exported');
    setExportOpen(false);
  }

  return (
    <section className="panel wide">
      <div className="panel-header">
        <div>
          <h2>Reports</h2>
        </div>
        <button type="button" className="button secondary" onClick={() => setExportOpen(true)}>Export CSV</button>
      </div>

      {error ? <div className="error-box">{error}</div> : null}
      {message ? <div className="success-box">{message}</div> : null}

      <div className="panel-subsection report-filters revenue-filters">
        <label>
          Month
          <select value={month} onChange={(event) => setMonth(event.target.value)}>
            {MONTHS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
        <label>
          Year
          <input value={year} onChange={(event) => setYear(event.target.value)} />
        </label>
        <label>
          Status
          <select value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="All">All</option>
            <option value="Paid">Paid</option>
            <option value="Partial">Partial</option>
            <option value="Unpaid">Unpaid</option>
            <option value="Overdue">Overdue</option>
          </select>
        </label>
        <button type="button" className="button" onClick={loadReport}>Run</button>
      </div>

      <div className="stats-grid">
        <div className="stat-card"><div className="muted">Expected Revenue</div><div className="stat-value">{formatCurrency(summary.expectedRevenue)}</div></div>
        <div className="stat-card"><div className="muted">Collected Revenue</div><div className="stat-value">{formatCurrency(summary.collectedRevenue)}</div></div>
        <div className="stat-card"><div className="muted">Outstanding Amount</div><div className="stat-value">{formatCurrency(summary.outstandingAmount)}</div></div>
        <div className="stat-card"><div className="muted">Collection Rate</div><div className="stat-value">{percent(summary.collectionRate)}</div></div>
        <div className="stat-card"><div className="muted">Paid Rooms</div><div className="stat-value">{summary.paidRooms ?? 0}</div></div>
        <div className="stat-card"><div className="muted">Unpaid/Partial Rooms</div><div className="stat-value">{summary.unpaidOrPartialRooms ?? 0}</div></div>
      </div>

      <div className="panel-subsection section-spaced">
        <h3>Revenue details</h3>
        {loading ? <p className="muted">Loading...</p> : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Room</th>
                  <th>Tenant</th>
                  <th>Period</th>
                  <th>Room Fee</th>
                  <th>Electricity</th>
                  <th>Water</th>
                  <th>Service</th>
                  <th>Total</th>
                  <th>Paid</th>
                  <th>Outstanding</th>
                  <th>Status</th>
                  <th>Payment Date</th>
                  <th>Note</th>
                </tr>
              </thead>
              <tbody>
                {details.length ? details.map((row) => (
                  <tr key={row.invoiceId}>
                    <td>{row.room || '-'}</td>
                    <td>{row.tenant || '-'}</td>
                    <td>{row.billingPeriod}</td>
                    <td>{formatCurrency(row.roomFee)}</td>
                    <td>{formatCurrency(row.electricityFee)}</td>
                    <td>{formatCurrency(row.waterFee)}</td>
                    <td>{formatCurrency(row.serviceFee)}</td>
                    <td>{formatCurrency(row.totalAmount)}</td>
                    <td>{formatCurrency(row.paidAmount)}</td>
                    <td>{formatCurrency(row.outstandingAmount)}</td>
                    <td><StatusBadge value={row.paymentStatus} /></td>
                    <td>{row.paymentDate || '-'}</td>
                    <td>{row.note || '-'}</td>
                  </tr>
                )) : <tr><td colSpan="13" className="muted">No report data for this period.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={exportOpen} title="Export CSV" onClose={() => setExportOpen(false)}>
        <div className="form-grid">
          <label>
            File name
            <input
              value={exportOptions.filename}
              onChange={(event) => setExportOptions((prev) => ({ ...prev, filename: event.target.value }))}
            />
          </label>
          <label className="checkbox-line">
            <input
              type="checkbox"
              checked={exportOptions.includeSummary}
              onChange={(event) => setExportOptions((prev) => ({ ...prev, includeSummary: event.target.checked }))}
            />
            Include summary
          </label>
          <label className="checkbox-line">
            <input
              type="checkbox"
              checked={exportOptions.includeDetails}
              onChange={(event) => setExportOptions((prev) => ({ ...prev, includeDetails: event.target.checked }))}
            />
            Include details
          </label>
          <div className="panel-subsection csv-columns">
            <h3>Columns</h3>
            <div className="csv-column-grid">
              {EXPORT_COLUMNS.map(([key, label]) => (
                <label key={key} className="checkbox-line">
                  <input
                    type="checkbox"
                    checked={exportOptions.columns[key]}
                    onChange={(event) => setExportColumn(key, event.target.checked)}
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>
          <div className="button-row">
            <button type="button" className="button" onClick={handleExport}>Export</button>
            <button type="button" className="button secondary" onClick={() => setExportOpen(false)}>Cancel</button>
          </div>
        </div>
      </Modal>
    </section>
  );
}
