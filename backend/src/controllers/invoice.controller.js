import {
  createInvoice,
  getInvoices,
  getInvoicesForTenant,
  updateInvoiceById,
} from '../services/invoice.service.js';

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
    return res.status(201).json({ data: invoice });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}

export async function updateInvoice(req, res) {
  try {
    const invoice = await updateInvoiceById(req.params.id, req.body);
    return res.json({ data: invoice });
  } catch (error) {
    const status = error.message === 'Invoice not found' ? 404 : 400;
    return res.status(status).json({ message: error.message });
  }
}
