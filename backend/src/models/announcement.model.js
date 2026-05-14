import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    content: { type: String, required: true, trim: true, maxlength: 2000 },
    isPinned: { type: Boolean, default: false },
    pinnedAt: { type: Date, default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', default: null },
  },
  { timestamps: true },
);

announcementSchema.index({ isPinned: 1, pinnedAt: -1, createdAt: -1 });
announcementSchema.index({ createdAt: -1 });

export const Announcement = mongoose.model('Announcement', announcementSchema);
