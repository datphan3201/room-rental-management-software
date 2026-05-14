import {
  createInvoice,
  getInvoices,
  getInvoicesForTenant,
  updateInvoiceById,
} from '../services/invoice.service.js';
import { writeAuditLog } from '../services/audit.service.js';

export async function listInvoices(req, res) {
  const invoices = await getInvoices();
  return res.json({ data: invoices });
}

export async function listMyInvoices(req, res) {
  const invoices = await getInvoicesForTenant(req.user.sub);
  return res.json({ data: invoices });
}

export async function createInvoiceHandler(req, res) {
  try {
    const invoice = await createInvoice(req.body);
    await writeAuditLog({
      actorId: req.user.sub,
      action: 'CREATE',
      entityType: 'Invoice',
      entityId: invoice._id,
      summary: `Created invoice ${invoice.billingMonth}`,
      metadata: { totalAmount: invoice.totalAmount },
    });
    return res.status(201).json({ data: invoice });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}

export async function updateInvoice(req, res) {
  try {
    const invoice = await updateInvoiceById(req.params.id, req.body);
    await writeAuditLog({
      actorId: req.user.sub,
      action: 'UPDATE',
      entityType: 'Invoice',
      entityId: invoice._id,
      summary: `Updated invoice ${invoice.billingMonth}`,
      metadata: { status: invoice.status, totalAmount: invoice.totalAmount },
    });
    return res.json({ data: invoice });
  } catch (error) {
    const status = error.message === 'Invoice not found' ? 404 : 400;
    return res.status(status).json({ message: error.message });
  }
}
