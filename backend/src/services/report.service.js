import { Invoice } from '../models/invoice.model.js';
import { Payment } from '../models/payment.model.js';

function normalizeMonth(value) {
  const month = String(value || '').trim();
  return /^\d{4}-\d{2}$/.test(month) ? month : null;
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

export async function getRevenueReport({ from, to } = {}) {
  const fromMonth = normalizeMonth(from);
  const toMonth = normalizeMonth(to);
  const invoices = await Invoice.find().lean();
  const payments = await Payment.find().populate('invoiceId', 'billingMonth').lean();
  const rowsByMonth = new Map();

  for (const invoice of invoices) {
    const month = normalizeMonth(invoice.billingMonth);
    if (!month || !isWithinRange(month, fromMonth, toMonth)) continue;
    const row = rowsByMonth.get(month) || makeMonthRow(month);
    const amount = Number(invoice.totalAmount || 0);
    row.invoiceCount += 1;
    row.billedAmount += amount;
    if (invoice.status === 'Paid') {
      row.paidAmount += amount;
    } else if (invoice.status === 'Overdue') {
      row.overdueAmount += amount;
    } else if (invoice.status === 'Unpaid') {
      row.unpaidAmount += amount;
    }
    rowsByMonth.set(month, row);
  }

  for (const payment of payments) {
    const month = normalizeMonth(payment.invoiceId?.billingMonth);
    if (!month || !isWithinRange(month, fromMonth, toMonth)) continue;
    const row = rowsByMonth.get(month) || makeMonthRow(month);
    row.paymentCount += 1;
    rowsByMonth.set(month, row);
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

  return {
    from: fromMonth,
    to: toMonth,
    summary,
    rows,
  };
}
