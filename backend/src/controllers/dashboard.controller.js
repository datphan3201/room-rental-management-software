import {
  getAdminDashboardStats,
  getTenantDashboardStats,
} from '../services/dashboard.service.js';

export async function adminStats(req, res) {
  const stats = await getAdminDashboardStats();
  return res.json({ data: stats });
}

export async function tenantStats(req, res) {
  const stats = await getTenantDashboardStats(req.user.sub);
  if (!stats) {
    return res.status(404).json({ message: 'Tenant not found' });
  }
  return res.json({ data: stats });
}
