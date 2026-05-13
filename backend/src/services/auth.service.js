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
