import React from 'react';
import { api } from '../../api/client.js';
import { formatCurrency, formatDate } from '../../utils/format.js';

const emptyPayment = {
  invoiceId: '',
  tenantId: '',
  amount: 0,
  paymentDate: formatDate(new Date()),
  method: 'Cash',
  note: '',
};

export function AdminPaymentsPage() {
  const [payments, setPayments] = React.useState([]);
  const [invoices, setInvoices] = React.useState([]);
  const [form, setForm] = React.useState(emptyPayment);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState('');

  async function loadData() {
    setLoading(true);
    setError('');
    try {
      const [paymentsRes, invoicesRes] = await Promise.all([api.get('/payments'), api.get('/invoices')]);
      setPayments(paymentsRes.data.data || []);
      setInvoices(invoicesRes.data.data || []);
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Failed to load payments');
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    loadData();
  }, []);

  function resetForm() {
    setForm(emptyPayment);
  }

  function applyInvoice(invoiceId) {
    const invoice = invoices.find((item) => item._id === invoiceId);
    if (!invoice) return;
    setForm((prev) => ({
      ...prev,
      invoiceId,
      tenantId: invoice.tenantId?._id || '',
      amount: invoice.totalAmount || 0,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.post('/payments/confirm', {
        ...form,
        amount: Number(form.amount),
      });
      await loadData();
      resetForm();
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Failed to confirm payment');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="panel wide">
      <div className="panel-header">
        <div>
          <h2>Payments</h2>
          <p className="muted">Manually confirm outside payments and mark invoices as paid.</p>
        </div>
      </div>

      {error ? <div className="error-box">{error}</div> : null}

      <div className="grid-two">
        <div className="panel-subsection">
          <h3>Payment history</h3>
          {loading ? <p className="muted">Loading...</p> : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Invoice</th>
                    <th>Tenant</th>
                    <th>Amount</th>
                    <th>Date</th>
                    <th>Method</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.length ? payments.map((payment) => (
                    <tr key={payment._id}>
                      <td>{payment.invoiceId?.billingMonth || '-'}</td>
                      <td>{payment.tenantId?.fullName || '-'}</td>
                      <td>{formatCurrency(payment.amount)}</td>
                      <td>{formatDate(payment.paymentDate)}</td>
                      <td>{payment.method}</td>
                    </tr>
                  )) : <tr><td colSpan="5" className="muted">No payments yet.</td></tr>}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <form className="panel-subsection form-grid" onSubmit={handleSubmit}>
          <h3>Confirm payment</h3>
          <label>
            Invoice
            <select value={form.invoiceId} onChange={(e) => applyInvoice(e.target.value)} required>
              <option value="">Select invoice</option>
              {invoices.map((invoice) => (
                <option key={invoice._id} value={invoice._id}>
                  {invoice.billingMonth} - {invoice.tenantId?.fullName || 'Tenant'} - {formatCurrency(invoice.totalAmount)}
                </option>
              ))}
            </select>
          </label>
          <label>
            Tenant ID
            <input value={form.tenantId} readOnly />
          </label>
          <label>
            Amount
            <input type="number" min="0" value={form.amount} onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))} required />
          </label>
          <label>
            Payment Date
            <input type="date" value={form.paymentDate} onChange={(e) => setForm((prev) => ({ ...prev, paymentDate: e.target.value }))} required />
          </label>
          <label>
            Method
            <select value={form.method} onChange={(e) => setForm((prev) => ({ ...prev, method: e.target.value }))}>
              <option value="Cash">Cash</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Other">Other</option>
            </select>
          </label>
          <label>
            Note
            <textarea rows="4" value={form.note} onChange={(e) => setForm((prev) => ({ ...prev, note: e.target.value }))} />
          </label>
          <div className="button-row">
            <button className="button" disabled={saving}>{saving ? 'Saving...' : 'Confirm payment'}</button>
            <button type="button" className="button secondary" onClick={resetForm}>Reset</button>
          </div>
        </form>
      </div>
    </section>
  );
}
