import { Contract } from '../models/contract.model.js';
import { Room } from '../models/room.model.js';
import { Tenant } from '../models/tenant.model.js';

const CONTRACT_STATUSES = new Set(['Active', 'Expired', 'Terminated']);

function contractPayload(data) {
  return {
    tenantId: data.tenantId,
    roomId: data.roomId,
    startDate: data.startDate ? new Date(data.startDate) : null,
    endDate: data.endDate ? new Date(data.endDate) : null,
    depositAmount: Number(data.depositAmount || 0),
    monthlyRent: Number(data.monthlyRent || 0),
    status: data.status || 'Active',
    contractImageUrl: data.contractImageUrl || null,
    note: data.note || '',
  };
}

function assertValidContractPayload(payload) {
  if (!payload.tenantId || !payload.roomId || !payload.startDate || !payload.endDate) {
    throw new Error('Missing required contract fields');
  }
  if (Number.isNaN(payload.startDate.getTime()) || Number.isNaN(payload.endDate.getTime())) {
    throw new Error('Invalid contract date');
  }
  if (payload.startDate >= payload.endDate) {
    throw new Error('Contract start date must be before end date');
  }
  if (!Number.isFinite(payload.depositAmount) || payload.depositAmount < 0) {
    throw new Error('Contract deposit amount must be a positive number');
  }
  if (!Number.isFinite(payload.monthlyRent) || payload.monthlyRent < 0) {
    throw new Error('Contract monthly rent must be a positive number');
  }
  if (!CONTRACT_STATUSES.has(payload.status)) {
    throw new Error('Invalid contract status');
  }
}

async function syncRoomStatus(roomId) {
  const active = await Contract.findOne({ roomId, status: 'Active' }).lean();
  const room = await Room.findById(roomId).lean();
  if (!room) {
    return;
  }
  if (active) {
    await Room.findByIdAndUpdate(roomId, { status: 'Occupied' });
    return;
  }
  if (room.status === 'Occupied') {
    await Room.findByIdAndUpdate(roomId, { status: 'Available' });
  }
}

export async function getContracts() {
  return Contract.find()
    .populate('tenantId', 'fullName phone')
    .populate('roomId', 'roomNumber roomType monthlyRent status')
    .sort({ createdAt: -1 })
    .lean();
}

export async function getContractsForTenant(accountId) {
  const tenant = await Tenant.findOne({ accountId }).lean();
  if (!tenant) {
    return [];
  }
  return Contract.find({ tenantId: tenant._id })
    .populate('tenantId', 'fullName phone')
    .populate('roomId', 'roomNumber roomType monthlyRent status')
    .sort({ createdAt: -1 })
    .lean();
}

export async function createContract(data) {
  const payload = contractPayload(data);
  assertValidContractPayload(payload);

  const room = await Room.findById(payload.roomId).lean();
  if (!room) {
    throw new Error('Room not found');
  }
  const tenant = await Tenant.findById(payload.tenantId).lean();
  if (!tenant) {
    throw new Error('Tenant not found');
  }
  const activeContract = await Contract.findOne({ roomId: payload.roomId, status: 'Active' }).lean();
  if (activeContract && payload.status === 'Active') {
    throw new Error('Only one active contract is allowed for a room');
  }
  if (payload.status === 'Active' && room.status !== 'Available') {
    throw new Error('Room is not available');
  }
  if (room.status === 'Maintenance' && payload.status === 'Active') {
    throw new Error('Cannot activate contract while room is under maintenance');
  }

  const contract = await Contract.create(payload);
  if (payload.status === 'Active') {
    await Room.findByIdAndUpdate(payload.roomId, { status: 'Occupied' });
  }
  return contract;
}

export async function updateContractById(id, data) {
  const current = await Contract.findById(id).lean();
  if (!current) {
    throw new Error('Contract not found');
  }

  const payload = contractPayload(data);
  const nextStatus = payload.status || current.status;
  const roomId = payload.roomId || current.roomId;
  const tenantId = payload.tenantId || current.tenantId;
  const nextPayload = {
    ...payload,
    status: nextStatus,
    roomId,
    tenantId,
    startDate: payload.startDate || new Date(current.startDate),
    endDate: payload.endDate || new Date(current.endDate),
  };
  assertValidContractPayload(nextPayload);

  const room = await Room.findById(roomId).lean();
  if (!room) {
    throw new Error('Room not found');
  }
  const tenant = await Tenant.findById(tenantId).lean();
  if (!tenant) {
    throw new Error('Tenant not found');
  }

  const activeContract = await Contract.findOne({
    roomId,
    status: 'Active',
    _id: { $ne: id },
  }).lean();
  if (activeContract && nextStatus === 'Active') {
    throw new Error('Only one active contract is allowed for a room');
  }
  if (nextStatus === 'Active' && room.status !== 'Available' && String(roomId) !== String(current.roomId)) {
    throw new Error('Room is not available');
  }

  const updated = await Contract.findByIdAndUpdate(id, {
    tenantId,
    roomId,
    startDate: payload.startDate || current.startDate,
    endDate: payload.endDate || current.endDate,
    depositAmount: payload.depositAmount ?? current.depositAmount,
    monthlyRent: payload.monthlyRent ?? current.monthlyRent,
    status: nextStatus,
    contractImageUrl: payload.contractImageUrl ?? current.contractImageUrl,
    note: payload.note ?? current.note,
  });

  if (current.roomId && current.roomId !== roomId) {
    await syncRoomStatus(current.roomId);
  }
  if (nextStatus === 'Active') {
    await Room.findByIdAndUpdate(roomId, { status: 'Occupied' });
  } else if (current.status === 'Active' || nextStatus !== 'Active') {
    await syncRoomStatus(roomId);
  }

  return updated;
}

export async function deleteContractById(id) {
  const current = await Contract.findById(id).lean();
  if (!current) {
    throw new Error('Contract not found');
  }
  await Contract.findByIdAndDelete(id);
  await syncRoomStatus(current.roomId);
  return { deleted: true };
}
