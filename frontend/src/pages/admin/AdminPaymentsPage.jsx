import React from 'react';
import { api } from '../../api/client.js';
import { ListToolbar, useListView } from '../../components/ListTools.jsx';
import { Modal } from '../../components/Modal.jsx';
import { formatCurrency, formatDate } from '../../utils/format.js';

const emptyPayment = {
  invoiceId: '',
  tenantId: '',
  amount: 0,
  paymentDate: formatDate(new Date()),
  method: 'Cash',
  note: '',
};

const emptySettings = {
  bankName: '',
  accountName: '',
  accountNumber: '',
  qrImageUrl: '',
};

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
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

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function ImagePreviewModal({ preview, onClose, onExportPdf }) {
  const [loadError, setLoadError] = React.useState('');

  React.useEffect(() => {
    setLoadError('');
  }, [preview]);

  return (
    <Modal open={Boolean(preview)} title={preview?.title || 'Image'} onClose={onClose}>
      {preview?.displaySrc ? (
        <div className="image-preview-dialog">
          {loadError ? <div className="error-box">{loadError}</div> : null}
          <img
            className="receipt-preview large"
            src={preview.displaySrc}
            alt={preview.title || 'Preview'}
            onError={() => setLoadError('Cannot display this receipt image. Use Open image below.')}
          />
          <div className="button-row">
            <button type="button" className="button" onClick={() => onExportPdf(preview)}>
              Export PDF
            </button>
            <a className="button secondary image-open-button" href={preview.displaySrc} target="_blank" rel="noreferrer">
              Open image
            </a>
          </div>
          {preview.note ? <p className="muted">{preview.note}</p> : null}
        </div>
      ) : null}
    </Modal>
  );
}

export function AdminPaymentsPage() {
  const [payments, setPayments] = React.useState([]);
  const [invoices, setInvoices] = React.useState([]);
  const [settings, setSettings] = React.useState(emptySettings);
  const [form, setForm] = React.useState(emptyPayment);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState('');
  const [formOpen, setFormOpen] = React.useState(false);
  const [imagePreview, setImagePreview] = React.useState(null);
  const [paymentView, setPaymentView] = React.useState('history');
  const listView = useListView(payments, {
    searchFields: ['invoiceId.billingMonth', 'tenantId.fullName', 'method', 'note'],
  });
  const proofInvoices = invoices.filter((invoice) => invoice.paymentProofImageUrl);

  async function loadData() {
    setLoading(true);
    setError('');
    try {
      const [paymentsRes, invoicesRes, settingsRes] = await Promise.all([
        api.get('/payments'),
        api.get('/invoices'),
        api.get('/payment-settings'),
      ]);
      setPayments(paymentsRes.data.data || []);
      setInvoices(invoicesRes.data.data || []);
      setSettings(settingsRes.data.data || emptySettings);
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
    setFormOpen(false);
  }

  function startConfirmPayment() {
    setForm(emptyPayment);
    setFormOpen(true);
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

  async function handleSettingsSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const { data } = await api.put('/payment-settings', settings);
      setSettings(data.data || emptySettings);
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Failed to save payment settings');
    } finally {
      setSaving(false);
    }
  }

  async function handleQrUpload(event) {
    const [file] = event.target.files || [];
    if (!file) return;
    const dataUrl = await readFileAsDataUrl(file);
    setSettings((prev) => ({ ...prev, qrImageUrl: dataUrl }));
  }

  function startConfirmInvoice(invoice) {
    setForm({
      invoiceId: invoice._id,
      tenantId: invoice.tenantId?._id || '',
      amount: invoice.totalAmount || 0,
      paymentDate: formatDate(new Date()),
      method: 'Bank Transfer',
      note: invoice.paymentProofNote || '',
    });
    setFormOpen(true);
  }

  function closeImagePreview() {
    if (imagePreview?.objectUrl) {
      window.URL.revokeObjectURL(imagePreview.objectUrl);
    }
    setImagePreview(null);
  }

  function openImagePreview({ title, src, note, meta }) {
    if (!src) return;
    closeImagePreview();
    setImagePreview(createImagePreview({ title, src, note, meta }));
  }

  function createImagePreview({ title, src, note, meta }) {
    let displaySrc = src;
    let objectUrl = '';
    if (src.startsWith('data:image/')) {
      try {
        objectUrl = dataUrlToObjectUrl(src);
        displaySrc = objectUrl;
      } catch {
        displaySrc = src;
      }
    }
    return { title, src, displaySrc, objectUrl, note, meta };
  }

  function printReceiptPdf({ title, src, note, meta }) {
    if (!src) return;
    const preview = createImagePreview({ title, src, note, meta });
    exportReceiptPdf(preview);
    if (preview.objectUrl) {
      window.setTimeout(() => window.URL.revokeObjectURL(preview.objectUrl), 60000);
    }
  }

  function exportReceiptPdf(preview) {
    if (!preview?.displaySrc) return;
    const printable = window.open('', '_blank', 'noopener,noreferrer');
    if (!printable) {
      setError('Popup was blocked. Allow popups to export receipt PDF.');
      return;
    }
    const meta = preview.meta || {};
    printable.document.write(`
      <!doctype html>
      <html>
        <head>
          <title>${escapeHtml(preview.title || 'Receipt')}</title>
          <style>
            @page { size: A4; margin: 18mm; }
            * { box-sizing: border-box; }
            body {
              margin: 0;
              color: #17202d;
              font-family: Arial, sans-serif;
              font-size: 13px;
            }
            header {
              display: flex;
              justify-content: space-between;
              gap: 24px;
              padding-bottom: 16px;
              border-bottom: 1px solid #d6dee8;
            }
            h1 {
              margin: 0 0 6px;
              font-size: 22px;
            }
            .muted { color: #687382; }
            .meta {
              display: grid;
              grid-template-columns: repeat(2, minmax(0, 1fr));
              gap: 10px 18px;
              margin: 18px 0;
            }
            .meta div {
              padding: 10px 12px;
              border: 1px solid #d6dee8;
              border-radius: 8px;
            }
            .meta span {
              display: block;
              margin-bottom: 4px;
              color: #687382;
              font-size: 11px;
              font-weight: 700;
              text-transform: uppercase;
            }
            .receipt-image {
              width: 100%;
              max-height: 620px;
              object-fit: contain;
              border: 1px solid #d6dee8;
              border-radius: 8px;
            }
            .note {
              margin-top: 14px;
              padding: 12px;
              border: 1px solid #d6dee8;
              border-radius: 8px;
              white-space: pre-wrap;
            }
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
            <div><span>Invoice</span>${escapeHtml(meta.invoice || '-')}</div>
            <div><span>Tenant</span>${escapeHtml(meta.tenant || '-')}</div>
            <div><span>Status</span>${escapeHtml(meta.status || '-')}</div>
            <div><span>Amount</span>${escapeHtml(meta.amount || '-')}</div>
            <div><span>Uploaded</span>${escapeHtml(meta.uploaded || '-')}</div>
            <div><span>Source</span>${escapeHtml(preview.title || 'Receipt')}</div>
          </section>
          <img class="receipt-image" src="${preview.displaySrc}" alt="Payment receipt" />
          ${preview.note ? `<section class="note">${escapeHtml(preview.note)}</section>` : ''}
          <script>
            window.addEventListener('load', () => {
              window.focus();
              setTimeout(() => window.print(), 150);
            });
          </script>
        </body>
      </html>
    `);
    printable.document.close();
  }

  React.useEffect(() => () => {
    if (imagePreview?.objectUrl) {
      window.URL.revokeObjectURL(imagePreview.objectUrl);
    }
  }, [imagePreview]);

  return (
    <section className="panel wide">
      <div className="panel-header">
        <div>
          <h2>Payments</h2>
        </div>
        <button type="button" className="button secondary" onClick={startConfirmPayment}>Confirm</button>
      </div>

      {error ? <div className="error-box">{error}</div> : null}

      <div className="panel-subsection payment-admin-grid">
        <h3>Bank account</h3>
        <form className="form-grid payment-settings-form" onSubmit={handleSettingsSubmit}>
          <label>
            Bank
            <input value={settings.bankName} onChange={(event) => setSettings((prev) => ({ ...prev, bankName: event.target.value }))} />
          </label>
          <label>
            Account name
            <input value={settings.accountName} onChange={(event) => setSettings((prev) => ({ ...prev, accountName: event.target.value }))} />
          </label>
          <label>
            Account number
            <input value={settings.accountNumber} onChange={(event) => setSettings((prev) => ({ ...prev, accountNumber: event.target.value }))} />
          </label>
          <label>
            QR image
            <input type="file" accept="image/*" onChange={handleQrUpload} />
          </label>
          {settings.qrImageUrl ? (
            <button
              type="button"
              className="button secondary"
              onClick={() => openImagePreview({ title: 'Payment QR', src: settings.qrImageUrl })}
            >
              View QR
            </button>
          ) : null}
          <button className="button" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
        </form>
      </div>

      <div className="panel-subsection">
        <div className="panel-header compact">
          <h3>Payment history</h3>
          <div className="view-switch" aria-label="Payment view">
            <button type="button" className={paymentView === 'history' ? 'active' : ''} onClick={() => setPaymentView('history')}>
              History
            </button>
            <button type="button" className={paymentView === 'proofs' ? 'active' : ''} onClick={() => setPaymentView('proofs')}>
              Proofs
            </button>
          </div>
        </div>
        {paymentView === 'history' ? <ListToolbar view={listView} searchPlaceholder="Search invoice, tenant, method..." /> : null}
        {loading ? <p className="muted">Loading...</p> : (
          <div className="table-wrap">
            {paymentView === 'history' ? (
              <table>
                <thead>
                  <tr>
                    <th>Invoice</th>
                    <th>Tenant</th>
                    <th>Date</th>
                    <th>Method</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {listView.items.length ? listView.items.map((payment) => (
                    <tr key={payment._id}>
                      <td>{payment.invoiceId?.billingMonth || '-'}</td>
                      <td>{payment.tenantId?.fullName || '-'}</td>
                      <td>{formatDate(payment.paymentDate)}</td>
                      <td>{payment.method}</td>
                      <td>{formatCurrency(payment.amount)}</td>
                    </tr>
                  )) : <tr><td colSpan="5" className="muted">No matching payments.</td></tr>}
                </tbody>
              </table>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Invoice</th>
                    <th>Tenant</th>
                    <th>Status</th>
                    <th>Uploaded</th>
                    <th>Amount</th>
                    <th>Receipt</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {proofInvoices.length ? proofInvoices.map((invoice) => (
                    <tr key={invoice._id}>
                      <td>{invoice.billingMonth}</td>
                      <td>{invoice.tenantId?.fullName || '-'}</td>
                      <td>{invoice.status}</td>
                      <td>{formatDate(invoice.paymentProofUploadedAt)}</td>
                      <td>{formatCurrency(invoice.totalAmount)}</td>
                      <td>
                        <button
                          type="button"
                          className="text-button dark"
                          onClick={() => printReceiptPdf({
                            title: `Receipt ${invoice.billingMonth}`,
                            src: invoice.paymentProofImageUrl,
                            note: invoice.paymentProofNote,
                            meta: {
                              invoice: invoice.billingMonth,
                              tenant: invoice.tenantId?.fullName || '-',
                              status: invoice.status || '-',
                              amount: formatCurrency(invoice.totalAmount),
                              uploaded: formatDate(invoice.paymentProofUploadedAt),
                            },
                          })}
                        >
                          Export PDF Receipt
                        </button>
                      </td>
                      <td className="row-action-cell">
                        {invoice.status !== 'Paid' && invoice.status !== 'Cancelled' ? (
                          <button type="button" className="text-button dark" onClick={() => startConfirmInvoice(invoice)}>Confirm</button>
                        ) : '-'}
                      </td>
                    </tr>
                  )) : <tr><td colSpan="7" className="muted">No payment proofs.</td></tr>}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      <Modal open={formOpen} title="Confirm" onClose={resetForm}>
        <form className="form-grid" onSubmit={handleSubmit}>
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
            <button className="button" disabled={saving}>{saving ? 'Saving...' : 'Confirm'}</button>
            <button type="button" className="button secondary" onClick={resetForm}>Cancel</button>
          </div>
        </form>
      </Modal>
      <ImagePreviewModal preview={imagePreview} onClose={closeImagePreview} onExportPdf={exportReceiptPdf} />
    </section>
  );
}
