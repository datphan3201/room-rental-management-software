import { Invoice } from '../models/invoice.model.js';
import { Contract } from '../models/contract.model.js';
import { Tenant } from '../models/tenant.model.js';

const INVOICE_STATUSES = new Set(['Unpaid', 'Overdue', 'Cancelled', 'Paid']);
const WATER_BILLING_METHODS = new Set(['BY_USAGE', 'BY_PERSON']);

function invoicePayload(data) {
  const electricityUsage = Number(data.electricityUsage || 0);
  const electricityUnitPrice = Number(data.electricityUnitPrice || 0);
  const waterUsage = Number(data.waterUsage || 0);
  const waterUnitPrice = Number(data.waterUnitPrice || 0);
  const numberOfTenants = Number(data.numberOfTenants || 1);
  const waterPricePerPerson = Number(data.waterPricePerPerson || 0);
  const roomRent = Number(data.roomRent || 0);
  const serviceFee = Number(data.serviceFee || 0);
  const parkingFee = Number(data.parkingFee || 0);
  const discount = Number(data.discount || 0);
  const waterBillingMethod = data.waterBillingMethod || 'BY_USAGE';

  const electricityFee = electricityUsage * electricityUnitPrice;
  const waterFee = waterBillingMethod === 'BY_PERSON'
    ? numberOfTenants * waterPricePerPerson
    : waterUsage * waterUnitPrice;
  const totalAmount = roomRent + electricityFee + waterFee + serviceFee + parkingFee - discount;

  return {
    tenantId: data.tenantId,
    roomId: data.roomId,
    contractId: data.contractId,
    billingMonth: String(data.billingMonth || '').trim(),
    roomRent,
    electricityUsage,
    electricityUnitPrice,
    electricityFee,
    waterBillingMethod,
    waterUsage,
    waterUnitPrice,
    numberOfTenants,
    waterPricePerPerson,
    waterFee,
    serviceFee,
    parkingFee,
    discount,
    totalAmount,
    dueDate: data.dueDate ? new Date(data.dueDate) : null,
    status: data.status || 'Unpaid',
    statusUpdatedAt: data.statusUpdatedAt ? new Date(data.statusUpdatedAt) : null,
  };
}

function assertRequired(payload) {
  if (!payload.tenantId || !payload.roomId || !payload.contractId || !payload.billingMonth || !payload.dueDate) {
    throw new Error('Missing required invoice fields');
  }
  if (!/^\d{4}-\d{2}$/.test(payload.billingMonth)) {
    throw new Error('Billing month must use YYYY-MM format');
  }
  if (Number.isNaN(payload.dueDate.getTime())) {
    throw new Error('Invalid invoice due date');
  }
  if (!INVOICE_STATUSES.has(payload.status)) {
    throw new Error('Invalid invoice status');
  }
  if (!WATER_BILLING_METHODS.has(payload.waterBillingMethod)) {
    throw new Error('Invalid water billing method');
  }
  const numericFields = [
    'roomRent',
    'electricityUsage',
    'electricityUnitPrice',
    'waterUsage',
    'waterUnitPrice',
    'numberOfTenants',
    'waterPricePerPerson',
    'serviceFee',
    'parkingFee',
    'discount',
  ];
  for (const field of numericFields) {
    if (!Number.isFinite(payload[field]) || payload[field] < 0) {
      throw new Error('Invoice numeric fields must be non-negative numbers');
    }
  }
  if (payload.numberOfTenants < 1) {
    throw new Error('Invoice number of tenants must be at least 1');
  }
  if (payload.totalAmount < 0) {
    throw new Error('Invoice total amount cannot be negative');
  }
}

export async function getInvoices() {
  return Invoice.find()
    .populate('tenantId', 'fullName phone')
    .populate('roomId', 'roomNumber roomType')
    .populate('contractId', 'status startDate endDate')
    .sort({ statusUpdatedAt: -1, updatedAt: -1, createdAt: -1 })
    .lean();
}

export async function getInvoicesForTenant(accountId) {
  const tenant = await Tenant.findOne({ accountId }).lean();
  if (!tenant) {
    return [];
  }
  return Invoice.find({ tenantId: tenant._id })
    .populate('tenantId', 'fullName phone')
    .populate('roomId', 'roomNumber roomType')
    .populate('contractId', 'status startDate endDate')
    .sort({ statusUpdatedAt: -1, updatedAt: -1, createdAt: -1 })
    .lean();
}

export async function createInvoice(data) {
  const payload = invoicePayload(data);
  assertRequired(payload);
  if (payload.status === 'Paid') {
    throw new Error('Use payment confirmation to mark an invoice as Paid');
  }
  payload.statusUpdatedAt = new Date();
  const contract = await Contract.findById(payload.contractId).lean();
  if (!contract) {
    throw new Error('Contract not found');
  }
  if (contract.status !== 'Active') {
    throw new Error('Invoice can only be created for an active contract');
  }
  if (String(contract.tenantId) !== String(payload.tenantId) || String(contract.roomId) !== String(payload.roomId)) {
    throw new Error('Invoice tenant or room does not match the selected contract');
  }
  const duplicate = await Invoice.findOne({
    tenantId: payload.tenantId,
    billingMonth: payload.billingMonth,
  }).lean();
  if (duplicate) {
    throw new Error('Invoice for this tenant and billing month already exists');
  }
  return Invoice.create(payload);
}

export async function updateInvoiceById(id, data) {
  const current = await Invoice.findById(id).lean();
  if (!current) {
    throw new Error('Invoice not found');
  }
  const payload = invoicePayload({
    ...current,
    ...data,
    status: data.status || current.status,
  });
  assertRequired({ ...payload, dueDate: payload.dueDate || current.dueDate });
  if (payload.status === 'Paid' && current.status !== 'Paid') {
    throw new Error('Use payment confirmation to mark an invoice as Paid');
  }
  const statusChanged = payload.status !== current.status;
  return Invoice.findByIdAndUpdate(id, {
    ...payload,
    dueDate: payload.dueDate || current.dueDate,
    statusUpdatedAt: statusChanged ? new Date() : (current.statusUpdatedAt || current.updatedAt || current.createdAt),
  }, { new: true });
}

export async function updateInvoiceStatusById(id, status) {
  const current = await Invoice.findById(id).lean();
  if (!current) {
    throw new Error('Invoice not found');
  }
  return Invoice.findByIdAndUpdate(id, { status, statusUpdatedAt: new Date() }, { new: true });
}

export async function submitPaymentProofForTenant(accountId, invoiceId, data) {
  const tenant = await Tenant.findOne({ accountId }).lean();
  if (!tenant) {
    throw new Error('Tenant not found');
  }
  const invoice = await Invoice.findOne({ _id: invoiceId, tenantId: tenant._id }).lean();
  if (!invoice) {
    throw new Error('Invoice not found');
  }
  if (invoice.status === 'Paid' || invoice.status === 'Cancelled') {
    throw new Error('Payment proof can only be uploaded for unpaid invoices');
  }

  const paymentProofImageUrl = String(data.paymentProofImageUrl || '').trim();
  if (!paymentProofImageUrl) {
    throw new Error('Payment proof image is required');
  }
  if (!paymentProofImageUrl.startsWith('data:image/') && !/^https?:\/\//.test(paymentProofImageUrl)) {
    throw new Error('Payment proof must be an image upload or URL');
  }

  return Invoice.findByIdAndUpdate(invoiceId, {
    paymentProofImageUrl,
    paymentProofNote: String(data.paymentProofNote || '').trim(),
    paymentProofUploadedAt: new Date(),
  }, { new: true });
}
