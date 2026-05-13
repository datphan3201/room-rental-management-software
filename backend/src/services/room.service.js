import { Room } from '../models/room.model.js';
import { Contract } from '../models/contract.model.js';
import { Invoice } from '../models/invoice.model.js';
import { MaintenanceRequest } from '../models/maintenanceRequest.model.js';

const ROOM_STATUSES = new Set(['Available', 'Occupied', 'Maintenance']);

function assertRoomPayload(data) {
  if (!String(data.roomNumber || '').trim() || !String(data.roomType || '').trim()) {
    throw new Error('Missing required room fields');
  }
  if (!Number.isFinite(Number(data.floor)) || Number(data.floor) < 1) {
    throw new Error('Room floor must be at least 1');
  }
  if (!Number.isFinite(Number(data.monthlyRent)) || Number(data.monthlyRent) < 0) {
    throw new Error('Room monthly rent must be a positive number');
  }
  if (!Number.isFinite(Number(data.maxOccupants)) || Number(data.maxOccupants) < 1) {
    throw new Error('Room max occupants must be at least 1');
  }
  if (!ROOM_STATUSES.has(data.status)) {
    throw new Error('Invalid room status');
  }
}

export async function getRooms() {
  return Room.find().sort({ createdAt: -1 }).lean();
}

export async function createRoom(data) {
  assertRoomPayload(data);
  const duplicate = await Room.findOne({ roomNumber: data.roomNumber }).lean();
  if (duplicate) {
    throw new Error('Room number already exists');
  }
  return Room.create(data);
}

export async function updateRoomById(id, data) {
  assertRoomPayload(data);
  const room = await Room.findById(id).lean();
  if (!room) {
    throw new Error('Room not found');
  }

  const duplicate = await Room.findOne({ roomNumber: data.roomNumber }).lean();
  if (duplicate && String(duplicate._id) !== String(id)) {
    throw new Error('Room number already exists');
  }

  if (data.status === 'Available' || data.status === 'Maintenance') {
    const activeContract = await Contract.exists({ roomId: id, status: 'Active' });
    if (activeContract) {
      throw new Error('Cannot change occupied room status while an active contract exists');
    }
  }

  return Room.findByIdAndUpdate(id, data);
}

export async function deleteRoomById(id) {
  const activeContract = await Contract.exists({ roomId: id, status: 'Active' });
  if (activeContract) {
    throw new Error('Cannot delete a room with an active contract');
  }
  const hasRelatedRecords = await Promise.all([
    Contract.exists({ roomId: id }),
    Invoice.exists({ roomId: id }),
    MaintenanceRequest.exists({ roomId: id }),
  ]);
  if (hasRelatedRecords.some(Boolean)) {
    throw new Error('Cannot delete room with related rental records');
  }

  const result = await Room.findByIdAndDelete(id);
  if (!result) {
    throw new Error('Room not found');
  }

  return { deleted: true };
}
