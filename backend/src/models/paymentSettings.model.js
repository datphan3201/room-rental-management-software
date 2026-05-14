import mongoose from 'mongoose';

const paymentSettingsSchema = new mongoose.Schema(
  {
    bankName: { type: String, default: '', trim: true },
    accountName: { type: String, default: '', trim: true },
    accountNumber: { type: String, default: '', trim: true },
    qrImageUrl: { type: String, default: '', trim: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', default: null },
  },
  { timestamps: true },
);

export const PaymentSettings = mongoose.model('PaymentSettings', paymentSettingsSchema);
