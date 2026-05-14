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

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[char]));
}

function dataUrlToObjectUrl(dataUrl) {
  const [header, payload] = String(dataUrl || '').split(',');
  const mime = header.match(/^data:([^;]+);base64$/)?.[1];
  if (!mime || !payload) {
    throw new Error('Invalid image data');
  }
  const binary = window.atob(payload);
  const chunks = [];
  for (let index = 0; index < binary.length; index += 8192) {
    const slice = binary.slice(index, index + 8192);
    const bytes = new Uint8Array(slice.length);
    for (let offset = 0; offset < slice.length; offset += 1) {
      bytes[offset] = slice.charCodeAt(offset);
    }
    chunks.push(bytes);
  }
  return window.URL.createObjectURL(new Blob(chunks, { type: mime }));
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

  function printReceiptPdf(invoice) {
    if (!invoice?.paymentProofImageUrl) return;
    let receiptSrc = invoice.paymentProofImageUrl;
    let objectUrl = '';
    if (receiptSrc.startsWith('data:image/')) {
      try {
        objectUrl = dataUrlToObjectUrl(receiptSrc);
        receiptSrc = objectUrl;
      } catch {
        receiptSrc = invoice.paymentProofImageUrl;
      }
    }

    const printWindow = window.open('', '_blank', 'width=900,height=700');
    if (!printWindow) {
      setError('Popup was blocked. Allow popups to export receipt PDF.');
      if (objectUrl) window.URL.revokeObjectURL(objectUrl);
      return;
    }

    printWindow.document.write(`
      <!doctype html>
      <html>
        <head>
          <title>Receipt ${escapeHtml(invoice.billingMonth || '')}</title>
          <style>
            @page { size: A4; margin: 18mm; }
            * { box-sizing: border-box; }
            body { margin: 0; color: #17202d; font-family: Arial, sans-serif; font-size: 13px; }
            header { display: flex; justify-content: space-between; gap: 24px; padding-bottom: 16px; border-bottom: 1px solid #d6dee8; }
            h1 { margin: 0 0 6px; font-size: 22px; }
            .muted { color: #687382; }
            .meta { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px 18px; margin: 18px 0; }
            .meta div { padding: 10px 12px; border: 1px solid #d6dee8; border-radius: 8px; }
            .meta span { display: block; margin-bottom: 4px; color: #687382; font-size: 11px; font-weight: 700; text-transform: uppercase; }
            .receipt-image { width: 100%; max-height: 620px; object-fit: contain; border: 1px solid #d6dee8; border-radius: 8px; }
            .note { margin-top: 14px; padding: 12px; border: 1px solid #d6dee8; border-radius: 8px; white-space: pre-wrap; }
          </style>
        </head>
        <body>
          <header>
            <div>
              <h1>Payment Receipt</h1>
              <div class="muted">Rental Property Management</div>
            </div>
            <div class="muted">${escapeHtml(new Date().toLocaleString())}</div>
          </header>
          <section class="meta">
            <div><span>Invoice</span>${escapeHtml(invoice.billingMonth || '-')}</div>
            <div><span>Room</span>${escapeHtml(invoice.roomId?.roomNumber || '-')}</div>
            <div><span>Status</span>${escapeHtml(invoice.status || '-')}</div>
            <div><span>Amount</span>${escapeHtml(formatCurrency(invoice.totalAmount))}</div>
            <div><span>Uploaded</span>${escapeHtml(formatDate(invoice.paymentProofUploadedAt))}</div>
            <div><span>Due</span>${escapeHtml(formatDate(invoice.dueDate))}</div>
          </section>
          <img class="receipt-image" src="${receiptSrc}" alt="Payment receipt" />
          ${invoice.paymentProofNote ? `<section class="note">${escapeHtml(invoice.paymentProofNote)}</section>` : ''}
          <script>
            window.addEventListener('load', () => {
              window.focus();
              setTimeout(() => window.print(), 150);
            });
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
    if (objectUrl) {
      window.setTimeout(() => window.URL.revokeObjectURL(objectUrl), 60000);
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
                    <button type="button" className="text-button dark" onClick={() => printReceiptPdf(invoice)}>
                      Export PDF Receipt
                    </button>
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
