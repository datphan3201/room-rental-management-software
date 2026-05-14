import { MaintenanceRequest } from '../models/maintenanceRequest.model.js';
import { Tenant } from '../models/tenant.model.js';
import { Room } from '../models/room.model.js';
import { Contract } from '../models/contract.model.js';

const MAINTENANCE_STATUSES = new Set(['Pending Review', 'Accepted', 'Rejected', 'Resolved', 'Cancelled']);

function maintenancePayload(data) {
  return {
    tenantId: data.tenantId,
    roomId: data.roomId,
    title: String(data.title || '').trim(),
    description: String(data.description || '').trim(),
    status: data.status || 'Pending Review',
    responseNote: data.responseNote || '',
    maintenanceCost: data.maintenanceCost === '' || data.maintenanceCost === null || data.maintenanceCost === undefined
      ? null
      : Number(data.maintenanceCost),
    resolvedAt: data.resolvedAt ? new Date(data.resolvedAt) : null,
  };
}

async function assertTenantRoomAssignment(tenantId, roomId) {
  const tenant = await Tenant.findById(tenantId).lean();
  if (!tenant) {
    throw new Error('Tenant not found');
  }
  const room = await Room.findById(roomId).lean();
  if (!room) {
    throw new Error('Room not found');
  }
  const activeContract = await Contract.findOne({
    tenantId,
    roomId,
    status: 'Active',
  }).lean();
  if (!activeContract) {
    throw new Error('Maintenance request room must belong to an active tenant contract');
  }
}

export async function getMaintenanceRequests() {
  return MaintenanceRequest.find()
    .populate('tenantId', 'fullName phone')
    .populate('roomId', 'roomNumber roomType')
    .sort({ createdAt: -1 })
    .lean();
}

export async function getMaintenanceRequestsForTenant(accountId) {
  const tenant = await Tenant.findOne({ accountId }).lean();
  if (!tenant) {
    return [];
  }
  return MaintenanceRequest.find({ tenantId: tenant._id })
    .populate('tenantId', 'fullName phone')
    .populate('roomId', 'roomNumber roomType')
    .sort({ createdAt: -1 })
    .lean();
}

export async function createMaintenanceRequest(data) {
  const payload = maintenancePayload(data);
  if (!payload.tenantId || !payload.roomId || !payload.title || !payload.description) {
    throw new Error('Missing required maintenance fields');
  }
  await assertTenantRoomAssignment(payload.tenantId, payload.roomId);
  payload.status = 'Pending Review';
  return MaintenanceRequest.create(payload);
}

export async function createMaintenanceRequestForAccount(accountId, data) {
  const tenant = await Tenant.findOne({ accountId }).lean();
  if (!tenant) {
    throw new Error('Tenant not found');
  }
  return createMaintenanceRequest({
    ...data,
    tenantId: tenant._id,
  });
}

export async function updateMaintenanceRequestById(id, data) {
  const current = await MaintenanceRequest.findById(id).lean();
  if (!current) {
    throw new Error('Maintenance request not found');
  }

  const payload = maintenancePayload({
    ...current,
    ...data,
    status: data.status || current.status,
  });

  if (!MAINTENANCE_STATUSES.has(payload.status)) {
    throw new Error('Invalid maintenance status');
  }
  if (!Number.isFinite(Number(payload.maintenanceCost || 0)) || Number(payload.maintenanceCost || 0) < 0) {
    throw new Error('Maintenance cost must be a positive number');
  }
  if (payload.status === 'Rejected' && !String(payload.responseNote || '').trim()) {
    throw new Error('Rejected maintenance requests require a response note');
  }
  if (payload.status === 'Resolved' && !payload.resolvedAt) {
    payload.resolvedAt = new Date();
  }

  const updated = await MaintenanceRequest.findByIdAndUpdate(id, payload, { new: true });
  return updated;
}
