import { getAuditLogs } from '../services/audit.service.js';

export async function listAuditLogs(req, res) {
  const logs = await getAuditLogs({
    entityType: req.query.entityType,
    action: req.query.action,
    limit: req.query.limit,
  });
  return res.json({ data: logs });
}
