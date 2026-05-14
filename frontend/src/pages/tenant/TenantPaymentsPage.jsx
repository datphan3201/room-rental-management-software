import React from 'react';
import { api } from '../../api/client.js';
import { ListToolbar, useListView } from '../../components/ListTools.jsx';
import { formatCurrency, formatDate } from '../../utils/format.js';

export function TenantPaymentsPage() {
  const [payments, setPayments] = React.useState([]);
  const [error, setError] = React.useState('');
  const listView = useListView(payments, {
    searchFields: ['invoiceId.billingMonth', 'method', 'note'],
  });

  React.useEffect(() => {
    let mounted = true;
    api
      .get('/payments/me')
      .then(({ data }) => {
        if (mounted) setPayments(data.data || []);
      })
      .catch((requestError) => {
        if (mounted) setError(requestError?.response?.data?.message || 'Failed to load payment history');
      });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section className="panel wide">
      <h2>My Payments</h2>
      <p className="muted">Confirmed payment history entered by the admin.</p>
      {error ? <div className="error-box">{error}</div> : null}
      <ListToolbar view={listView} searchPlaceholder="Search invoice, method, note..." />
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Invoice</th>
              <th>Date</th>
              <th>Method</th>
              <th>Amount</th>
              <th>Note</th>
            </tr>
          </thead>
          <tbody>
            {listView.items.length ? listView.items.map((payment) => (
              <tr key={payment._id}>
                <td>{payment.invoiceId?.billingMonth || '-'}</td>
                <td>{formatDate(payment.paymentDate)}</td>
                <td>{payment.method}</td>
                <td>{formatCurrency(payment.amount)}</td>
                <td>{payment.note || '-'}</td>
              </tr>
            )) : <tr><td colSpan="5" className="muted">No matching payments.</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  );
}
