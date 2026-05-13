import {
  createMaintenanceRequest,
  createMaintenanceRequestForAccount,
  getMaintenanceRequests,
  getMaintenanceRequestsForTenant,
  updateMaintenanceRequestById,
} from '../services/maintenance.service.js';

export async function listMaintenanceRequests(req, res) {
  const requests = await getMaintenanceRequests();
  return res.json({ data: requests });
}

export async function listMyMaintenanceRequests(req, res) {
  const requests = await getMaintenanceRequestsForTenant(req.user.sub);
  return res.json({ data: requests });
}

export async function createMaintenance(req, res) {
  try {
    const request = req.user.role === 'ADMIN'
      ? await createMaintenanceRequest({
          ...req.body,
        })
      : await createMaintenanceRequestForAccount(req.user.sub, req.body);
    return res.status(201).json({ data: request });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}

export async function updateMaintenance(req, res) {
  try {
    const request = await updateMaintenanceRequestById(req.params.id, req.body);
    return res.json({ data: request });
  } catch (error) {
    const status = error.message === 'Maintenance request not found' ? 404 : 400;
    return res.status(status).json({ message: error.message });
  }
}
