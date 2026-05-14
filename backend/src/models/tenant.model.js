import mongoose from 'mongoose';

const tenantSchema = new mongoose.Schema(
  {
    accountId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true, unique: true },
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true, default: null },
    identityNumber: { type: String, required: true, trim: true, unique: true },
    dateOfBirth: { type: Date, required: true },
    hometown: { type: String, required: true, trim: true },
  },
  { timestamps: true },
);

tenantSchema.index({ phone: 1 });

export const Tenant = mongoose.model('Tenant', tenantSchema);
