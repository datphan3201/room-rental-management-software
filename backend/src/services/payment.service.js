import { Payment } from '../models/payment.model.js';
import { Invoice } from '../models/invoice.model.js';
import { Tenant } from '../models/tenant.model.js';

const PAYMENT_METHODS = new Set(['Cash', 'Bank Transfer', 'Other']);

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
  if (!Number.isFinite(payload.amount) || payload.amount <= 0) {
    throw new Error('Payment amount must be greater than zero');
  }
  if (payload.paymentDate && Number.isNaN(payload.paymentDate.getTime())) {
    throw new Error('Invalid payment date');
  }
  if (!PAYMENT_METHODS.has(payload.method)) {
    throw new Error('Invalid payment method');
  }

  const invoice = await Invoice.findById(payload.invoiceId).lean();
  if (!invoice) {
    throw new Error('Invoice not found');
  }
  if (String(invoice.tenantId) !== String(payload.tenantId)) {
    throw new Error('Payment tenant does not match invoice tenant');
  }
  if (invoice.status === 'Paid') {
    throw new Error('Invoice is already paid');
  }
  if (invoice.status === 'Cancelled') {
    throw new Error('Cancelled invoice cannot be paid');
  }
  if (Math.abs(Number(invoice.totalAmount || 0) - payload.amount) > 0.01) {
    throw new Error('Payment amount must match invoice total');
  }

  const payment = await Payment.create(payload);
  await Invoice.findByIdAndUpdate(payload.invoiceId, { status: 'Paid' });
  return payment;
}
