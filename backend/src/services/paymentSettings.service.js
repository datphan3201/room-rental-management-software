import { PaymentSettings } from '../models/paymentSettings.model.js';

function normalizeSettings(data) {
  return {
    bankName: String(data.bankName || '').trim(),
    accountName: String(data.accountName || '').trim(),
    accountNumber: String(data.accountNumber || '').trim(),
    qrImageUrl: String(data.qrImageUrl || '').trim(),
  };
}

export async function getPaymentSettings() {
  const settings = await PaymentSettings.findOne().sort({ updatedAt: -1 }).lean();
  return settings || {
    bankName: '',
    accountName: '',
    accountNumber: '',
    qrImageUrl: '',
  };
}

export async function updatePaymentSettings(data, actorId) {
  const payload = normalizeSettings(data);
  if (payload.qrImageUrl && !payload.qrImageUrl.startsWith('data:image/') && !/^https?:\/\//.test(payload.qrImageUrl)) {
    throw new Error('QR image must be an image upload or URL');
  }

  const current = await PaymentSettings.findOne().sort({ updatedAt: -1 });
  if (current) {
    current.set({ ...payload, updatedBy: actorId || null });
    return current.save();
  }
  return PaymentSettings.create({ ...payload, updatedBy: actorId || null });
}
