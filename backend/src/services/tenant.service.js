import bcrypt from 'bcryptjs';
import { Account } from '../models/account.model.js';
import { Tenant } from '../models/tenant.model.js';
import { Contract } from '../models/contract.model.js';
import { Invoice } from '../models/invoice.model.js';
import { Payment } from '../models/payment.model.js';
import { MaintenanceRequest } from '../models/maintenanceRequest.model.js';

function normalizeTenantPayload(data) {
  return {
    fullName: String(data.fullName || '').trim(),
    phone: String(data.phone || '').trim(),
    email: data.email ? String(data.email).trim() : null,
    identityNumber: String(data.identityNumber || '').trim(),
    dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
    hometown: String(data.hometown || '').trim(),
  };
}

function normalizePassword(value, { required = false } = {}) {
  const password = String(value || '').trim();
  if (!password) {
    if (required) {
      throw new Error('Tenant password is required');
    }
    return null;
  }
  if (password.length < 6) {
    throw new Error('Tenant password must be at least 6 characters');
  }
  return password;
}

export async function getTenants() {
  return Tenant.find()
    .populate('accountId', 'username phone role status')
    .sort({ createdAt: -1 })
    .lean();
}

export async function findTenantByAccountId(accountId) {
  return Tenant.findOne({ accountId }).lean();
}

export async function createTenantWithAccount(data) {
  const payload = normalizeTenantPayload(data);
  const password = normalizePassword(data.password, { required: true });

  if (!payload.fullName || !payload.phone || !payload.identityNumber || !payload.dateOfBirth || !payload.hometown) {
    throw new Error('Missing required tenant fields');
  }

  const duplicatePhone = await Account.findOne({ phone: payload.phone }).lean();
  if (duplicatePhone) {
    throw new Error('Tenant phone already exists');
  }
  const duplicateIdentity = await Tenant.findOne({ identityNumber: payload.identityNumber }).lean();
  if (duplicateIdentity) {
    throw new Error('Tenant identity number already exists');
  }

  const account = await Account.create({
    phone: payload.phone,
    passwordHash: await bcrypt.hash(password, 10),
    role: 'TENANT',
    status: 'ACTIVE',
  });

  try {
    const tenant = await Tenant.create({
      accountId: account._id,
      fullName: payload.fullName,
      phone: payload.phone,
      email: payload.email,
      identityNumber: payload.identityNumber,
      dateOfBirth: payload.dateOfBirth,
      hometown: payload.hometown,
    });

    return Tenant.findById(tenant._id).populate('accountId', 'username phone role status').lean();
  } catch (error) {
    await Account.findByIdAndDelete(account._id);
    throw error;
  }
}

export async function updateTenantById(id, data) {
  const payload = normalizeTenantPayload(data);
  const password = normalizePassword(data.password);
  const tenant = await Tenant.findById(id).lean();
  if (!tenant) {
    throw new Error('Tenant not found');
  }

  const duplicatePhone = await Account.findOne({ phone: payload.phone }).lean();
  if (duplicatePhone && String(duplicatePhone._id) !== String(tenant.accountId)) {
    throw new Error('Tenant phone already exists');
  }
  const duplicateIdentity = await Tenant.findOne({ identityNumber: payload.identityNumber }).lean();
  if (duplicateIdentity && String(duplicateIdentity._id) !== String(id)) {
    throw new Error('Tenant identity number already exists');
  }

  const account = await Account.findById(tenant.accountId).lean();
  if (!account) {
    throw new Error('Linked account not found');
  }

  await Tenant.findByIdAndUpdate(id, {
    fullName: payload.fullName,
    phone: payload.phone,
    email: payload.email,
    identityNumber: payload.identityNumber,
    dateOfBirth: payload.dateOfBirth,
    hometown: payload.hometown,
  }, { new: true });

  const accountUpdates = {
    phone: payload.phone,
  };
  if (password) {
    accountUpdates.passwordHash = await bcrypt.hash(password, 10);
  }

  await Account.findByIdAndUpdate(tenant.accountId, accountUpdates, { new: true });

  return Tenant.findById(id).populate('accountId', 'username phone role status').lean();
}

export async function deleteTenantById(id) {
  const tenant = await Tenant.findById(id).lean();
  if (!tenant) {
    throw new Error('Tenant not found');
  }
  const hasRelatedRecords = await Promise.all([
    Contract.exists({ tenantId: id }),
    Invoice.exists({ tenantId: id }),
    Payment.exists({ tenantId: id }),
    MaintenanceRequest.exists({ tenantId: id }),
  ]);
  if (hasRelatedRecords.some(Boolean)) {
    throw new Error('Cannot delete tenant with related rental records');
  }

  await Account.findByIdAndDelete(tenant.accountId);
  await Tenant.findByIdAndDelete(id);
  return { deleted: true };
}
