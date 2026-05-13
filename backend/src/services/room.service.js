import { Room } from '../models/room.model.js';
import { Contract } from '../models/contract.model.js';

export async function getRooms() {
  return Room.find().sort({ createdAt: -1 }).lean();
}

export async function createRoom(data) {
  const duplicate = await Room.findOne({ roomNumber: data.roomNumber }).lean();
  if (duplicate) {
    throw new Error('Room number already exists');
  }
  return Room.create(data);
}

export async function updateRoomById(id, data) {
  const room = await Room.findById(id).lean();
  if (!room) {
    throw new Error('Room not found');
  }

  const duplicate = await Room.findOne({ roomNumber: data.roomNumber }).lean();
  if (duplicate && duplicate._id !== id) {
    throw new Error('Room number already exists');
  }

  if (data.status === 'Available') {
    const activeContract = await Contract.exists({ roomId: id, status: 'Active' });
    if (activeContract) {
      throw new Error('Cannot mark occupied room as available while an active contract exists');
    }
  }

  return Room.findByIdAndUpdate(id, data);
}

export async function deleteRoomById(id) {
  const activeContract = await Contract.exists({ roomId: id, status: 'Active' });
  if (activeContract) {
    throw new Error('Cannot delete a room with an active contract');
  }

  const result = await Room.findByIdAndDelete(id);
  if (!result) {
    throw new Error('Room not found');
  }

  return { deleted: true };
}
