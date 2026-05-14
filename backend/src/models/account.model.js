import mongoose from 'mongoose';

const accountSchema = new mongoose.Schema(
  {
    username: { type: String, trim: true },
    phone: { type: String, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['ADMIN', 'TENANT'], required: true },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
  },
  { timestamps: true },
);

accountSchema.index({ username: 1 }, { unique: true, sparse: true });
accountSchema.index({ phone: 1 }, { unique: true, sparse: true });

export const Account = mongoose.model('Account', accountSchema);
