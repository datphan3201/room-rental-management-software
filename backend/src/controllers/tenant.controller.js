import {
  createTenantWithAccount,
  deleteTenantById,
  getTenants,
  updateTenantById,
} from '../services/tenant.service.js';

export async function listTenants(req, res) {
  const tenants = await getTenants();
  return res.json({ data: tenants });
}

export async function createTenant(req, res) {
  try {
    const tenant = await createTenantWithAccount(req.body);
    return res.status(201).json({ data: tenant });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}

export async function updateTenant(req, res) {
  try {
    const tenant = await updateTenantById(req.params.id, req.body);
    return res.json({ data: tenant });
  } catch (error) {
    const status = error.message === 'Tenant not found' ? 404 : 400;
    return res.status(status).json({ message: error.message });
  }
}

export async function deleteTenant(req, res) {
  try {
    await deleteTenantById(req.params.id);
    return res.status(204).send();
  } catch (error) {
    const status = error.message === 'Tenant not found' ? 404 : 400;
    return res.status(status).json({ message: error.message });
  }
}

