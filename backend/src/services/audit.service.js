import { AuditLog } from '../models/auditLog.model.js';

export async function writeAuditLog(event) {
  try {
    return await AuditLog.create({
      actorId: event.actorId || null,
      action: event.action,
      entityType: event.entityType,
      entityId: String(event.entityId || ''),
      summary: event.summary,
      metadata: event.metadata || {},
    });
  } catch (error) {
    console.error('Failed to write audit log:', error.message);
    return null;
  }
}

export async function getAuditLogs({ entityType, action, limit = 100 } = {}) {
  const filter = {};
  if (entityType) {
    filter.entityType = entityType;
  }
  if (action) {
    filter.action = action;
  }

  return AuditLog.find(filter)
    .populate('actorId', 'username phone role')
    .sort({ createdAt: -1 })
    .limit(Math.min(Number(limit) || 100, 300))
    .lean();
}
