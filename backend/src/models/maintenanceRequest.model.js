import mongoose from 'mongoose';

const maintenanceRequestSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['Pending Review', 'Accepted', 'Rejected', 'Resolved', 'Cancelled'],
      default: 'Pending Review',
    },
    responseNote: { type: String, default: '' },
    maintenanceCost: { type: Number, default: null, min: 0 },
    resolvedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

maintenanceRequestSchema.index({ tenantId: 1 });
maintenanceRequestSchema.index({ roomId: 1 });

export const MaintenanceRequest = mongoose.model('MaintenanceRequest', maintenanceRequestSchema);
