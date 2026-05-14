import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice', required: true },
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
    amount: { type: Number, required: true, min: 0 },
    paymentDate: { type: Date, default: Date.now },
    method: { type: String, enum: ['Cash', 'Bank Transfer', 'Other'], default: 'Cash' },
    confirmedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true },
    note: { type: String, default: '' },
  },
  { timestamps: true },
);

paymentSchema.index({ tenantId: 1 });
paymentSchema.index({ invoiceId: 1 });

export const Payment = mongoose.model('Payment', paymentSchema);
