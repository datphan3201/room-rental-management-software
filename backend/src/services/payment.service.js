import { Payment } from '../models/payment.model.js';
import { Invoice } from '../models/invoice.model.js';
import { Tenant } from '../models/tenant.model.js';

function paymentPayload(data) {
  return {
    invoiceId: data.invoiceId,
    tenantId: data.tenantId,
    amount: Number(data.amount || 0),
    paymentDate: data.paymentDate ? new Date(data.paymentDate) : new Date(),
    method: data.method || 'Cash',
    confirmedBy: data.confirmedBy || null,
    note: data.note || '',
  };
}

export async function getPayments() {
  return Payment.find()
    .populate('invoiceId', 'billingMonth status totalAmount')
    .populate('tenantId', 'fullName phone')
    .populate('confirmedBy', 'username phone')
    .sort({ paymentDate: -1 })
    .lean();
}

export async function getPaymentsForTenant(accountId) {
  const tenant = await Tenant.findOne({ accountId }).lean();
  if (!tenant) {
    return [];
  }
  return Payment.find({ tenantId: tenant._id })
    .populate('invoiceId', 'billingMonth status totalAmount')
    .populate('tenantId', 'fullName phone')
    .populate('confirmedBy', 'username phone')
    .sort({ paymentDate: -1 })
    .lean();
}

export async function confirmPayment(data) {
  const payload = paymentPayload(data);
  if (!payload.invoiceId || !payload.tenantId || !payload.amount || !payload.confirmedBy) {
    throw new Error('Missing required payment fields');
  }

  const invoice = await Invoice.findById(payload.invoiceId).lean();
  if (!invoice) {
    throw new Error('Invoice not found');
  }
  if (invoice.status === 'Paid') {
    throw new Error('Invoice is already paid');
  }

  const payment = await Payment.create(payload);
  await Invoice.findByIdAndUpdate(payload.invoiceId, { status: 'Paid' });
  return payment;
}
