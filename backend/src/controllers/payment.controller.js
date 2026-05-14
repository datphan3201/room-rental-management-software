import {
  confirmPayment,
  getPayments,
  getPaymentsForTenant,
} from '../services/payment.service.js';
import { writeAuditLog } from '../services/audit.service.js';

export async function listPayments(req, res) {
  const payments = await getPayments();
  return res.json({ data: payments });
}

export async function listMyPayments(req, res) {
  const payments = await getPaymentsForTenant(req.user.sub);
  return res.json({ data: payments });
}

export async function confirmPaymentHandler(req, res) {
  try {
    const payment = await confirmPayment({
      ...req.body,
      confirmedBy: req.user.sub,
    });
    await writeAuditLog({
      actorId: req.user.sub,
      action: 'CONFIRM',
      entityType: 'Payment',
      entityId: payment._id,
      summary: `Confirmed payment ${payment.amount}`,
      metadata: { invoiceId: payment.invoiceId, tenantId: payment.tenantId },
    });
    return res.status(201).json({ data: payment });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}
