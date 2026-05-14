import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
    contractId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contract', required: true },
    billingMonth: { type: String, required: true, trim: true },
    roomRent: { type: Number, default: 0, min: 0 },
    electricityUsage: { type: Number, default: 0, min: 0 },
    electricityUnitPrice: { type: Number, default: 0, min: 0 },
    electricityFee: { type: Number, default: 0, min: 0 },
    waterBillingMethod: { type: String, enum: ['BY_USAGE', 'BY_PERSON'], default: 'BY_USAGE' },
    waterUsage: { type: Number, default: 0, min: 0 },
    waterUnitPrice: { type: Number, default: 0, min: 0 },
    numberOfTenants: { type: Number, default: 1, min: 1 },
    waterPricePerPerson: { type: Number, default: 0, min: 0 },
    waterFee: { type: Number, default: 0, min: 0 },
    serviceFee: { type: Number, default: 0, min: 0 },
    parkingFee: { type: Number, default: 0, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    dueDate: { type: Date, required: true },
    status: { type: String, enum: ['Unpaid', 'Overdue', 'Cancelled', 'Paid'], default: 'Unpaid' },
    statusUpdatedAt: { type: Date, default: Date.now },
    paymentProofImageUrl: { type: String, default: '' },
    paymentProofNote: { type: String, default: '' },
    paymentProofUploadedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

invoiceSchema.index({ tenantId: 1, billingMonth: 1 }, { unique: true });
invoiceSchema.index({ contractId: 1 });

export const Invoice = mongoose.model('Invoice', invoiceSchema);
