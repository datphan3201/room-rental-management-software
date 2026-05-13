import React from 'react';
import { api } from '../../api/client.js';
import { formatCurrency, formatDate } from '../../utils/format.js';

export function TenantInvoicesPage() {
  const [invoices, setInvoices] = React.useState([]);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    let mounted = true;
    api
      .get('/invoices/me')
      .then(({ data }) => {
        if (mounted) setInvoices(data.data || []);
      })
      .catch((requestError) => {
        if (mounted) setError(requestError?.response?.data?.message || 'Failed to load invoices');
      });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section className="panel wide">
      <h2>My Invoices</h2>
      <p className="muted">Invoice history and payment status for your account.</p>
      {error ? <div className="error-box">{error}</div> : null}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Month</th>
              <th>Room</th>
              <th>Due</th>
              <th>Status</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {invoices.length ? invoices.map((invoice) => (
              <tr key={invoice._id}>
                <td>{invoice.billingMonth}</td>
                <td>{invoice.roomId?.roomNumber || '-'}</td>
                <td>{formatDate(invoice.dueDate)}</td>
                <td>{invoice.status}</td>
                <td>{formatCurrency(invoice.totalAmount)}</td>
              </tr>
            )) : <tr><td colSpan="5" className="muted">No invoices found.</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  );
}
