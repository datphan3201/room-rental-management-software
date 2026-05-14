import bcrypt from 'bcryptjs';
import { Account } from '../models/account.model.js';
import { Tenant } from '../models/tenant.model.js';
import { signToken } from '../utils/token.js';

export async function loginWithCredentials({ loginId, password }) {
  const normalizedLoginId = String(loginId || '').trim();
  const normalizedPassword = String(password || '').trim();
  const account = await Account.findOne({
    $or: [{ username: normalizedLoginId }, { phone: normalizedLoginId }],
  });

  if (!account || (account.status && account.status !== 'ACTIVE')) {
    throw new Error('Invalid credentials');
  }

  const valid = await bcrypt.compare(normalizedPassword, account.passwordHash);
  if (!valid) {
    throw new Error('Invalid credentials');
  }

  const tenant = account.role === 'TENANT'
    ? await Tenant.findOne({ accountId: account._id }).lean()
    : null;

  const token = signToken({
    sub: String(account._id),
    role: account.role,
  });

  return {
    token,
    user: {
      id: String(account._id),
      role: account.role,
      username: account.username || null,
      phone: account.phone || null,
      tenant: tenant
        ? {
            id: String(tenant._id),
            fullName: tenant.fullName,
            phone: tenant.phone,
          }
        : null,
    },
  };
}

export async function getAuthProfile(accountId) {
  const account = await Account.findById(accountId).lean();
  if (!account || (account.status && account.status !== 'ACTIVE')) {
    throw new Error('Account not found');
  }

  const tenant = account.role === 'TENANT'
    ? await Tenant.findOne({ accountId }).lean()
    : null;

  return {
    id: String(account._id),
    role: account.role,
    username: account.username || null,
    phone: account.phone || null,
    tenant: tenant
      ? {
          id: String(tenant._id),
          fullName: tenant.fullName,
          phone: tenant.phone,
        }
      : null,
  };
}

export async function changePassword(accountId, { currentPassword, newPassword }) {
  const account = await Account.findById(accountId);
  if (!account || (account.status && account.status !== 'ACTIVE')) {
    throw new Error('Account not found');
  }
  const valid = await bcrypt.compare(String(currentPassword || ''), account.passwordHash);
  if (!valid) {
    throw new Error('Current password is incorrect');
  }
  const normalizedNewPassword = String(newPassword || '').trim();
  if (normalizedNewPassword.length < 6) {
    throw new Error('New password must be at least 6 characters');
  }
  account.passwordHash = await bcrypt.hash(normalizedNewPassword, 10);
  await account.save();
  return { changed: true };
}

export async function resetPasswordWithTenantIdentity({ loginId, identityNumber, newPassword }) {
  const normalizedLoginId = String(loginId || '').trim();
  const normalizedIdentity = String(identityNumber || '').trim();
  const normalizedNewPassword = String(newPassword || '').trim();
  if (!normalizedLoginId || !normalizedIdentity || normalizedNewPassword.length < 6) {
    throw new Error('Login ID, identity number, and a 6-character password are required');
  }

  const account = await Account.findOne({ phone: normalizedLoginId, role: 'TENANT', status: 'ACTIVE' });
  if (!account) {
    throw new Error('Tenant account not found');
  }
  const tenant = await Tenant.findOne({ accountId: account._id, identityNumber: normalizedIdentity }).lean();
  if (!tenant) {
    throw new Error('Tenant identity does not match');
  }

  account.passwordHash = await bcrypt.hash(normalizedNewPassword, 10);
  await account.save();
  return { reset: true };
}
