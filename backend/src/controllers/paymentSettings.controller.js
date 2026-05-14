import {
  getPaymentSettings,
  updatePaymentSettings,
} from '../services/paymentSettings.service.js';
import { writeAuditLog } from '../services/audit.service.js';

export async function readPaymentSettings(req, res) {
  const settings = await getPaymentSettings();
  return res.json({ data: settings });
}

export async function updatePaymentSettingsHandler(req, res) {
  try {
    const settings = await updatePaymentSettings(req.body, req.user.sub);
    await writeAuditLog({
      actorId: req.user.sub,
      action: 'UPDATE',
      entityType: 'PaymentSettings',
      entityId: settings._id,
      summary: 'Updated payment settings',
    });
    return res.json({ data: settings });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}
