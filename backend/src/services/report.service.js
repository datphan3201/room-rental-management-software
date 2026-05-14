import { Invoice } from '../models/invoice.model.js';
import { Payment } from '../models/payment.model.js';

function normalizeMonth(value) {
  const month = String(value || '').trim();
  return /^\d{4}-\d{2}$/.test(month) ? month : null;
}

function normalizeYear(value) {
  const year = String(value || '').trim();
  return /^\d{4}$/.test(year) ? year : null;
}

function normalizePaymentStatus(value) {
  const status = String(value || 'All').trim();
  return ['All', 'Paid', 'Partial', 'Unpaid', 'Overdue'].includes(status) ? status : 'All';
}

function isWithinRange(month, from, to) {
  if (from && month < from) return false;
  if (to && month > to) return false;
  return true;
}

function makeMonthRow(month) {
  return {
    month,
    billedAmount: 0,
    paidAmount: 0,
    unpaidAmount: 0,
    overdueAmount: 0,
    invoiceCount: 0,
    paymentCount: 0,
  };
}

function makePaymentStatus(invoice, paidAmount, today = new Date()) {
  const totalAmount = Number(invoice.totalAmount || 0);
  if (paidAmount >= totalAmount && totalAmount > 0) return 'Paid';
  if (paidAmount > 0 && paidAmount < totalAmount) return 'Partial';
  if (invoice.status === 'Overdue') return 'Overdue';
  if (invoice.dueDate && new Date(invoice.dueDate) < today) return 'Overdue';
  return 'Unpaid';
}

function toDateString(value) {
  if (!value) return '';
  return new Date(value).toISOString().slice(0, 10);
}

export async function getRevenueReport({ from, to, month, year, status } = {}) {
  const selectedMonth = normalizeMonth(month);
  const selectedYear = normalizeYear(year);
  const fromMonth = selectedMonth || (selectedYear ? `${selectedYear}-01` : normalizeMonth(from));
  const toMonth = selectedMonth || (selectedYear ? `${selectedYear}-12` : normalizeMonth(to));
  const selectedStatus = normalizePaymentStatus(status);

  const invoices = await Invoice.find()
    .populate('tenantId', 'fullName phone')
    .populate('roomId', 'roomNumber roomType')
    .sort({ billingMonth: -1, createdAt: -1 })
    .lean();
  const payments = await Payment.find()
    .populate('invoiceId', 'billingMonth')
    .sort({ paymentDate: -1 })
    .lean();
  const rowsByMonth = new Map();
  const paymentsByInvoice = new Map();

  for (const payment of payments) {
    const invoiceId = String(payment.invoiceId?._id || payment.invoiceId || '');
    if (!invoiceId) continue;
    const current = paymentsByInvoice.get(invoiceId) || {
      paidAmount: 0,
      paymentCount: 0,
      paymentDate: null,
      note: '',
    };
    current.paidAmount += Number(payment.amount || 0);
    current.paymentCount += 1;
    if (!current.paymentDate || new Date(payment.paymentDate) > new Date(current.paymentDate)) {
      current.paymentDate = payment.paymentDate;
      current.note = payment.note || '';
    }
    paymentsByInvoice.set(invoiceId, current);
  }

  const detailRows = [];
  const paidRoomIds = new Set();
  const unpaidOrPartialRoomIds = new Set();

  for (const invoice of invoices) {
    const month = normalizeMonth(invoice.billingMonth);
    if (!month || !isWithinRange(month, fromMonth, toMonth)) continue;
    const paymentInfo = paymentsByInvoice.get(String(invoice._id)) || {};
    const totalAmount = Number(invoice.totalAmount || 0);
    const paidAmount = Number(paymentInfo.paidAmount || 0);
    const outstandingAmount = Math.max(totalAmount - paidAmount, 0);
    const paymentStatus = makePaymentStatus(invoice, paidAmount);
    if (selectedStatus !== 'All' && paymentStatus !== selectedStatus) continue;

    const row = rowsByMonth.get(month) || makeMonthRow(month);
    row.invoiceCount += 1;
    row.paymentCount += Number(paymentInfo.paymentCount || 0);
    row.billedAmount += totalAmount;
    row.paidAmount += paidAmount;
    if (paymentStatus === 'Overdue') {
      row.overdueAmount += outstandingAmount;
    }
    if (paymentStatus === 'Unpaid' || paymentStatus === 'Partial') {
      row.unpaidAmount += outstandingAmount;
    }
    rowsByMonth.set(month, row);

    const roomId = String(invoice.roomId?._id || invoice.roomId || '');
    if (paymentStatus === 'Paid') {
      paidRoomIds.add(roomId);
    } else if (roomId) {
      unpaidOrPartialRoomIds.add(roomId);
    }

    detailRows.push({
      invoiceId: String(invoice._id),
      room: invoice.roomId?.roomNumber || '',
      tenant: invoice.tenantId?.fullName || '',
      billingPeriod: invoice.billingMonth,
      roomFee: Number(invoice.roomRent || 0),
      electricityFee: Number(invoice.electricityFee || 0),
      waterFee: Number(invoice.waterFee || 0),
      serviceFee: Number(invoice.serviceFee || 0) + Number(invoice.parkingFee || 0),
      discount: Number(invoice.discount || 0),
      totalAmount,
      paidAmount,
      outstandingAmount,
      paymentStatus,
      paymentDate: toDateString(paymentInfo.paymentDate),
      note: paymentInfo.note || invoice.paymentProofNote || '',
    });
  }

  const rows = [...rowsByMonth.values()].sort((left, right) => left.month.localeCompare(right.month));
  const summary = rows.reduce((total, row) => ({
    billedAmount: total.billedAmount + row.billedAmount,
    paidAmount: total.paidAmount + row.paidAmount,
    unpaidAmount: total.unpaidAmount + row.unpaidAmount,
    overdueAmount: total.overdueAmount + row.overdueAmount,
    invoiceCount: total.invoiceCount + row.invoiceCount,
    paymentCount: total.paymentCount + row.paymentCount,
  }), {
    billedAmount: 0,
    paidAmount: 0,
    unpaidAmount: 0,
    overdueAmount: 0,
    invoiceCount: 0,
    paymentCount: 0,
  });
  summary.expectedRevenue = summary.billedAmount;
  summary.collectedRevenue = summary.paidAmount;
  summary.outstandingAmount = Math.max(summary.expectedRevenue - summary.collectedRevenue, 0);
  summary.collectionRate = summary.expectedRevenue > 0
    ? (summary.collectedRevenue / summary.expectedRevenue) * 100
    : 0;
  summary.paidRooms = paidRoomIds.size;
  summary.unpaidOrPartialRooms = unpaidOrPartialRoomIds.size;

  return {
    from: fromMonth,
    to: toMonth,
    month: selectedMonth,
    year: selectedYear,
    status: selectedStatus,
    summary,
    rows,
    details: detailRows.sort((left, right) => (
      right.billingPeriod.localeCompare(left.billingPeriod)
        || left.room.localeCompare(right.room)
    )),
  };
}
