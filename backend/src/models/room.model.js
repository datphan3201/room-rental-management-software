import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema(
  {
    roomNumber: { type: String, required: true, trim: true, unique: true },
    floor: { type: Number, required: true, min: 1 },
    roomType: { type: String, required: true, trim: true },
    monthlyRent: { type: Number, required: true, min: 0 },
    maxOccupants: { type: Number, required: true, min: 1 },
    status: { type: String, enum: ['Available', 'Occupied', 'Maintenance'], default: 'Available' },
    description: { type: String, default: '' },
  },
  { timestamps: true },
);

export const Room = mongoose.model('Room', roomSchema);
