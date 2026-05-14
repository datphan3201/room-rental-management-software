import React from 'react';
import { api } from '../../api/client.js';
import { ListToolbar, useListView } from '../../components/ListTools.jsx';
import { Modal } from '../../components/Modal.jsx';
import { StatusBadge } from '../../components/StatusBadge.jsx';
import { formatCurrency, formatDate } from '../../utils/format.js';

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export function TenantInvoicesPage() {
  const [invoices, setInvoices] = React.useState([]);
  const [paymentSettings, setPaymentSettings] = React.useState(null);
  const [selectedInvoice, setSelectedInvoice] = React.useState(null);
  const [proofForm, setProofForm] = React.useState({ paymentProofImageUrl: '', paymentProofNote: '' });
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState('');
  const listView = useListView(invoices, {
    searchFields: ['billingMonth', 'roomId.roomNumber', 'status'],
    statusField: 'status',
  });

  React.useEffect(() => {
    let mounted = true;
    Promise.all([
      api.get('/invoices/me'),
      api.get('/payment-settings'),
    ])
      .then(([invoicesRes, settingsRes]) => {
        if (mounted) {
          setInvoices(invoicesRes.data.data || []);
          setPaymentSettings(settingsRes.data.data || null);
        }
      })
      .catch((requestError) => {
        if (mounted) setError(requestError?.response?.data?.message || 'Failed to load invoices');
      });
    return () => {
      mounted = false;
    };
  }, []);

  async function reloadInvoices() {
    const { data } = await api.get('/invoices/me');
    setInvoices(data.data || []);
  }

  async function handleProofFile(event) {
    const [file] = event.target.files || [];
    if (!file) return;
    const dataUrl = await readFileAsDataUrl(file);
    setProofForm((prev) => ({ ...prev, paymentProofImageUrl: dataUrl }));
  }

  function openProofModal(invoice) {
    setSelectedInvoice(invoice);
    setProofForm({
      paymentProofImageUrl: invoice.paymentProofImageUrl || '',
      paymentProofNote: invoice.paymentProofNote || '',
    });
  }

  async function submitProof(event) {
    event.preventDefault();
    if (!selectedInvoice) return;
    setSaving(true);
    setError('');
    try {
      await api.post(`/invoices/${selectedInvoice._id}/payment-proof`, proofForm);
      await reloadInvoices();
      setSelectedInvoice(null);
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Failed to upload receipt');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="panel wide">
      <h2>My Invoices</h2>
      {error ? <div className="error-box">{error}</div> : null}
      <div className="panel-subsection payment-info">
        <div>
          <h3>Payment info</h3>
          {paymentSettings?.bankName || paymentSettings?.accountNumber || paymentSettings?.accountName ? (
            <div className="payment-info-lines">
              {paymentSettings?.bankName ? <span><b>Bank</b>{paymentSettings.bankName}</span> : null}
              {paymentSettings?.accountNumber ? <span><b>Account</b>{paymentSettings.accountNumber}</span> : null}
              {paymentSettings?.accountName ? <span><b>Name</b>{paymentSettings.accountName}</span> : null}
            </div>
          ) : <p className="muted">No payment account configured.</p>}
        </div>
        {paymentSettings?.qrImageUrl ? <img className="qr-preview" src={paymentSettings.qrImageUrl} alt="Payment QR" /> : null}
      </div>
      <ListToolbar view={listView} searchPlaceholder="Search month, room, status..." />
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Status</th>
              <th>Updated</th>
              <th>Month</th>
              <th>Room</th>
              <th>Due</th>
              <th>Total</th>
              <th>Receipt</th>
            </tr>
          </thead>
          <tbody>
            {listView.items.length ? listView.items.map((invoice) => (
              <tr key={invoice._id}>
                <td><StatusBadge value={invoice.status} /></td>
                <td>{formatDate(invoice.statusUpdatedAt || invoice.updatedAt)}</td>
                <td>{invoice.billingMonth}</td>
                <td>{invoice.roomId?.roomNumber || '-'}</td>
                <td>{formatDate(invoice.dueDate)}</td>
                <td>{formatCurrency(invoice.totalAmount)}</td>
                <td>
                  {invoice.paymentProofImageUrl ? (
                    <a className="inline-link" href={invoice.paymentProofImageUrl} target="_blank" rel="noreferrer">View</a>
                  ) : null}
                  {invoice.status !== 'Paid' && invoice.status !== 'Cancelled' ? (
                    <button type="button" className="text-button dark table-action-link" onClick={() => openProofModal(invoice)}>
                      Upload
                    </button>
                  ) : null}
                </td>
              </tr>
            )) : <tr><td colSpan="6" className="muted">No matching invoices.</td></tr>}
          </tbody>
        </table>
      </div>

      <Modal open={Boolean(selectedInvoice)} title="Upload receipt" onClose={() => setSelectedInvoice(null)}>
        <form className="form-grid" onSubmit={submitProof}>
          <label>
            Image
            <input type="file" accept="image/*" onChange={handleProofFile} required={!proofForm.paymentProofImageUrl} />
          </label>
          {proofForm.paymentProofImageUrl ? <img className="receipt-preview" src={proofForm.paymentProofImageUrl} alt="Payment receipt" /> : null}
          <label>
            Note
            <textarea rows="3" value={proofForm.paymentProofNote} onChange={(event) => setProofForm((prev) => ({ ...prev, paymentProofNote: event.target.value }))} />
          </label>
          <div className="button-row">
            <button className="button" disabled={saving}>{saving ? 'Saving...' : 'Upload'}</button>
            <button type="button" className="button secondary" onClick={() => setSelectedInvoice(null)}>Cancel</button>
          </div>
        </form>
      </Modal>
    </section>
  );
}
