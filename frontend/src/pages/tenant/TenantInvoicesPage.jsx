import React from 'react';
import { api } from '../../api/client.js';
import { ListToolbar, useListView } from '../../components/ListTools.jsx';
import { StatusBadge } from '../../components/StatusBadge.jsx';
import { formatCurrency, formatDate } from '../../utils/format.js';

export function TenantInvoicesPage() {
  const [invoices, setInvoices] = React.useState([]);
  const [error, setError] = React.useState('');
  const listView = useListView(invoices, {
    searchFields: ['billingMonth', 'roomId.roomNumber', 'status'],
    statusField: 'status',
  });

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
      <ListToolbar view={listView} searchPlaceholder="Search month, room, status..." />
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
            {listView.items.length ? listView.items.map((invoice) => (
              <tr key={invoice._id}>
                <td>{invoice.billingMonth}</td>
                <td>{invoice.roomId?.roomNumber || '-'}</td>
                <td>{formatDate(invoice.dueDate)}</td>
                <td><StatusBadge value={invoice.status} /></td>
                <td>{formatCurrency(invoice.totalAmount)}</td>
              </tr>
            )) : <tr><td colSpan="5" className="muted">No matching invoices.</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  );
}
