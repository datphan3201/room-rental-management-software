import mongoose from 'mongoose';

const contractSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    depositAmount: { type: Number, required: true, min: 0 },
    monthlyRent: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ['Active', 'Expired', 'Terminated'], default: 'Active' },
    contractImageUrl: { type: String, default: null },
    note: { type: String, default: '' },
  },
  { timestamps: true },
);

contractSchema.index(
  { roomId: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: 'Active' } },
);
contractSchema.index({ tenantId: 1 });

export const Contract = mongoose.model('Contract', contractSchema);
