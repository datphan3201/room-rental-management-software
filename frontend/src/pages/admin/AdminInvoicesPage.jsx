import React from 'react';
import { api } from '../../api/client.js';
import { ActionButton, ActionDialog } from '../../components/ActionDialog.jsx';
import { ListToolbar, useListView } from '../../components/ListTools.jsx';
import { Modal } from '../../components/Modal.jsx';
import { StatusBadge } from '../../components/StatusBadge.jsx';
import { calculateInvoiceTotal, formatCurrency, formatDate } from '../../utils/format.js';

const emptyInvoice = {
  tenantId: '',
  roomId: '',
  contractId: '',
  billingMonth: '',
  roomRent: 0,
  electricityUsage: 0,
  electricityUnitPrice: 0,
  waterBillingMethod: 'BY_USAGE',
  waterUsage: 0,
  waterUnitPrice: 0,
  numberOfTenants: 1,
  waterPricePerPerson: 0,
  serviceFee: 0,
  parkingFee: 0,
  discount: 0,
  dueDate: '',
  status: 'Unpaid',
};

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[char]));
}

export function AdminInvoicesPage() {
  const [invoices, setInvoices] = React.useState([]);
  const [contracts, setContracts] = React.useState([]);
  const [form, setForm] = React.useState(emptyInvoice);
  const [editingId, setEditingId] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState('');
  const [formOpen, setFormOpen] = React.useState(false);
  const [actionInvoice, setActionInvoice] = React.useState(null);
  const listView = useListView(invoices, {
    searchFields: ['billingMonth', 'tenantId.fullName', 'roomId.roomNumber', 'status'],
    statusField: 'status',
  });

  async function loadData() {
    setLoading(true);
    setError('');
    try {
      const [invoicesRes, contractsRes] = await Promise.all([api.get('/invoices'), api.get('/contracts')]);
      setInvoices(invoicesRes.data.data || []);
      setContracts(contractsRes.data.data || []);
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Failed to load invoices');
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    loadData();
  }, []);

  function resetForm() {
    setEditingId(null);
    setForm(emptyInvoice);
    setFormOpen(false);
  }

  function startCreate() {
    setEditingId(null);
    setForm(emptyInvoice);
    setFormOpen(true);
  }

  function applyContract(contractId) {
    const contract = contracts.find((item) => item._id === contractId);
    if (!contract) return;
    setForm((prev) => ({
      ...prev,
      contractId,
      tenantId: contract.tenantId?._id || '',
      roomId: contract.roomId?._id || '',
      roomRent: contract.monthlyRent || 0,
    }));
  }

  function startEdit(invoice) {
    setEditingId(invoice._id);
    setFormOpen(true);
    setForm({
      tenantId: invoice.tenantId?._id || invoice.tenantId || '',
      roomId: invoice.roomId?._id || invoice.roomId || '',
      contractId: invoice.contractId?._id || invoice.contractId || '',
      billingMonth: invoice.billingMonth || '',
      roomRent: invoice.roomRent ?? 0,
      electricityUsage: invoice.electricityUsage ?? 0,
      electricityUnitPrice: invoice.electricityUnitPrice ?? 0,
      waterBillingMethod: invoice.waterBillingMethod || 'BY_USAGE',
      waterUsage: invoice.waterUsage ?? 0,
      waterUnitPrice: invoice.waterUnitPrice ?? 0,
      numberOfTenants: invoice.numberOfTenants ?? 1,
      waterPricePerPerson: invoice.waterPricePerPerson ?? 0,
      serviceFee: invoice.serviceFee ?? 0,
      parkingFee: invoice.parkingFee ?? 0,
      discount: invoice.discount ?? 0,
      dueDate: formatDate(invoice.dueDate),
      status: invoice.status || 'Unpaid',
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        roomRent: Number(form.roomRent),
        electricityUsage: Number(form.electricityUsage),
        electricityUnitPrice: Number(form.electricityUnitPrice),
        waterUsage: Number(form.waterUsage),
        waterUnitPrice: Number(form.waterUnitPrice),
        numberOfTenants: Number(form.numberOfTenants),
        waterPricePerPerson: Number(form.waterPricePerPerson),
        serviceFee: Number(form.serviceFee),
        parkingFee: Number(form.parkingFee),
        discount: Number(form.discount),
      };
      if (editingId) {
        await api.put(`/invoices/${editingId}`, payload);
      } else {
        await api.post('/invoices', payload);
      }
      await loadData();
      resetForm();
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Failed to save invoice');
    } finally {
      setSaving(false);
    }
  }

  const totalPreview = calculateInvoiceTotal(form);

  function printInvoice(invoice) {
    const printWindow = window.open('', '_blank', 'width=900,height=700');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice ${invoice.billingMonth}</title>
          <style>
            body { font-family: Arial, sans-serif; color: #17202a; margin: 32px; }
            h1 { margin: 0 0 8px; }
            .muted { color: #687382; }
            table { width: 100%; border-collapse: collapse; margin-top: 24px; }
            th, td { padding: 10px; border-bottom: 1px solid #d8dee6; text-align: left; }
            .total { font-size: 22px; font-weight: 700; text-align: right; margin-top: 24px; }
          </style>
        </head>
        <body>
          <h1>Room Rental Invoice</h1>
          <div class="muted">Billing month: ${escapeHtml(invoice.billingMonth)}</div>
          <p><strong>Tenant:</strong> ${escapeHtml(invoice.tenantId?.fullName || '-')}</p>
          <p><strong>Room:</strong> ${escapeHtml(invoice.roomId?.roomNumber || '-')}</p>
          <p><strong>Due date:</strong> ${formatDate(invoice.dueDate)}</p>
          <table>
            <tbody>
              <tr><th>Room rent</th><td>${formatCurrency(invoice.roomRent)}</td></tr>
              <tr><th>Electricity fee</th><td>${formatCurrency(invoice.electricityFee)}</td></tr>
              <tr><th>Water fee</th><td>${formatCurrency(invoice.waterFee)}</td></tr>
              <tr><th>Service fee</th><td>${formatCurrency(invoice.serviceFee)}</td></tr>
              <tr><th>Parking fee</th><td>${formatCurrency(invoice.parkingFee)}</td></tr>
              <tr><th>Discount</th><td>${formatCurrency(invoice.discount)}</td></tr>
            </tbody>
          </table>
          <div class="total">Total: ${formatCurrency(invoice.totalAmount)}</div>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }

  return (
    <section className="panel wide">
      <div className="panel-header">
        <div>
          <h2>Invoices</h2>
        </div>
        <button type="button" className="button secondary" onClick={startCreate}>New</button>
      </div>

      {error ? <div className="error-box">{error}</div> : null}

      <div className="panel-subsection">
        <h3>Invoice list</h3>
        <ListToolbar view={listView} searchPlaceholder="Search month, tenant, room..." />
        {loading ? <p className="muted">Loading...</p> : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Updated</th>
                  <th>Month</th>
                  <th>Tenant</th>
                  <th>Room</th>
                  <th>Total</th>
                  <th>Due</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {listView.items.length ? listView.items.map((invoice) => (
                  <tr key={invoice._id}>
                    <td><StatusBadge value={invoice.status} /></td>
                    <td>{formatDate(invoice.statusUpdatedAt || invoice.updatedAt)}</td>
                    <td>
                      <div className="record-primary">
                        <strong>{invoice.billingMonth}</strong>
                      </div>
                    </td>
                    <td>{invoice.tenantId?.fullName || '-'}</td>
                    <td>{invoice.roomId?.roomNumber || '-'}</td>
                    <td>{formatCurrency(invoice.totalAmount)}</td>
                    <td>{formatDate(invoice.dueDate)}</td>
                    <td className="row-action-cell"><ActionButton onClick={() => setActionInvoice(invoice)} /></td>
                  </tr>
                )) : <tr><td colSpan="8" className="muted">No matching invoices.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={formOpen} title={editingId ? 'Edit' : 'Create'} onClose={resetForm}>
        <form className="form-grid" onSubmit={handleSubmit}>
          <label>
            Contract
            <select value={form.contractId} onChange={(e) => applyContract(e.target.value)} required>
              <option value="">Select contract</option>
              {contracts.map((contract) => (
                <option key={contract._id} value={contract._id}>
                  {contract.roomId?.roomNumber || 'Room'} - {contract.tenantId?.fullName || 'Tenant'}
                </option>
              ))}
            </select>
          </label>
          <label>
            Billing Month
            <input value={form.billingMonth} onChange={(e) => setForm((prev) => ({ ...prev, billingMonth: e.target.value }))} placeholder="2026-05" required />
          </label>
          <label>
            Room Rent
            <input type="number" min="0" value={form.roomRent} onChange={(e) => setForm((prev) => ({ ...prev, roomRent: e.target.value }))} required />
          </label>
          <label>
            Electricity Usage
            <input type="number" min="0" value={form.electricityUsage} onChange={(e) => setForm((prev) => ({ ...prev, electricityUsage: e.target.value }))} />
          </label>
          <label>
            Electricity Unit Price
            <input type="number" min="0" value={form.electricityUnitPrice} onChange={(e) => setForm((prev) => ({ ...prev, electricityUnitPrice: e.target.value }))} />
          </label>
          <label>
            Water Billing Method
            <select value={form.waterBillingMethod} onChange={(e) => setForm((prev) => ({ ...prev, waterBillingMethod: e.target.value }))}>
              <option value="BY_USAGE">BY_USAGE</option>
              <option value="BY_PERSON">BY_PERSON</option>
            </select>
          </label>
          <label>
            Water Usage
            <input type="number" min="0" value={form.waterUsage} onChange={(e) => setForm((prev) => ({ ...prev, waterUsage: e.target.value }))} />
          </label>
          <label>
            Water Unit Price
            <input type="number" min="0" value={form.waterUnitPrice} onChange={(e) => setForm((prev) => ({ ...prev, waterUnitPrice: e.target.value }))} />
          </label>
          <label>
            Number of Tenants
            <input type="number" min="1" value={form.numberOfTenants} onChange={(e) => setForm((prev) => ({ ...prev, numberOfTenants: e.target.value }))} />
          </label>
          <label>
            Water Price Per Person
            <input type="number" min="0" value={form.waterPricePerPerson} onChange={(e) => setForm((prev) => ({ ...prev, waterPricePerPerson: e.target.value }))} />
          </label>
          <label>
            Service Fee
            <input type="number" min="0" value={form.serviceFee} onChange={(e) => setForm((prev) => ({ ...prev, serviceFee: e.target.value }))} />
          </label>
          <label>
            Parking Fee
            <input type="number" min="0" value={form.parkingFee} onChange={(e) => setForm((prev) => ({ ...prev, parkingFee: e.target.value }))} />
          </label>
          <label>
            Discount
            <input type="number" min="0" value={form.discount} onChange={(e) => setForm((prev) => ({ ...prev, discount: e.target.value }))} />
          </label>
          <label>
            Due Date
            <input type="date" value={form.dueDate} onChange={(e) => setForm((prev) => ({ ...prev, dueDate: e.target.value }))} required />
          </label>
          <label>
            Status
            <select value={form.status} onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}>
              <option value="Unpaid">Unpaid</option>
              <option value="Overdue">Overdue</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </label>
          <div className="panel-subsection">
            <div className="muted">Preview total</div>
            <strong>{formatCurrency(totalPreview)}</strong>
          </div>
          <div className="button-row">
            <button className="button" disabled={saving}>{saving ? 'Saving...' : editingId ? 'Update' : 'Create'}</button>
            <button type="button" className="button secondary" onClick={resetForm}>Cancel</button>
          </div>
        </form>
      </Modal>
      <ActionDialog
        open={Boolean(actionInvoice)}
        title={actionInvoice ? `Invoice ${actionInvoice.billingMonth}` : 'Invoice actions'}
        onClose={() => setActionInvoice(null)}
        actions={[
          {
            label: 'Edit',
            onClick: () => startEdit(actionInvoice),
          },
          {
            label: 'Print/PDF',
            onClick: () => printInvoice(actionInvoice),
          },
        ]}
      />
    </section>
  );
}
