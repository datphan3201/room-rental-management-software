import bcrypt from 'bcryptjs';
import { Account } from '../models/account.model.js';
import { Tenant } from '../models/tenant.model.js';
import { Room } from '../models/room.model.js';
import { Contract } from '../models/contract.model.js';
import { Invoice } from '../models/invoice.model.js';
import { MaintenanceRequest } from '../models/maintenanceRequest.model.js';

async function clearDemoData() {
  await Promise.all([
    Account.deleteMany({}),
    Tenant.deleteMany({}),
    Room.deleteMany({}),
    Contract.deleteMany({}),
    Invoice.deleteMany({}),
    MaintenanceRequest.deleteMany({}),
  ]);
}

export async function seedDemoData({ reset = false } = {}) {
  if (reset) {
    await clearDemoData();
  }

  const accountCount = await Account.countDocuments();
  if (accountCount > 0 && !reset) {
    return { seeded: false };
  }

  if (!reset) {
    await clearDemoData();
  }

  const now = new Date();

  const admin = await Account.create({
    username: 'admin',
    passwordHash: await bcrypt.hash('admin123', 10),
    role: 'ADMIN',
    status: 'ACTIVE',
  });

  const tenantAccount = await Account.create({
    phone: '0900000001',
    passwordHash: await bcrypt.hash('tenant123', 10),
    role: 'TENANT',
    status: 'ACTIVE',
  });

  const tenant = await Tenant.create({
    accountId: tenantAccount._id,
    fullName: 'Nguyen Van A',
    phone: '0900000001',
    email: 'tenant@example.com',
    identityNumber: '012345678901',
    dateOfBirth: new Date('2000-01-01'),
    hometown: 'Ho Chi Minh City',
  });

  const room = await Room.create({
    roomNumber: 'A101',
    floor: 1,
    roomType: 'Standard',
    monthlyRent: 3500000,
    maxOccupants: 2,
    status: 'Occupied',
    description: 'Sample room for demo',
  });

  const contract = await Contract.create({
    tenantId: tenant._id,
    roomId: room._id,
    startDate: new Date('2026-05-01'),
    endDate: new Date('2027-04-30'),
    depositAmount: 3500000,
    monthlyRent: 3500000,
    status: 'Active',
    note: 'Seeded active contract',
  });

  const invoice = await Invoice.create({
    tenantId: tenant._id,
    roomId: room._id,
    contractId: contract._id,
    billingMonth: '2026-05',
    roomRent: 3500000,
    electricityUsage: 120,
    electricityUnitPrice: 3500,
    electricityFee: 420000,
    waterBillingMethod: 'BY_USAGE',
    waterUsage: 12,
    waterUnitPrice: 2500,
    numberOfTenants: 2,
    waterPricePerPerson: 25000,
    waterFee: 30000,
    serviceFee: 100000,
    parkingFee: 100000,
    discount: 0,
    totalAmount: 4150000,
    dueDate: new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000),
    status: 'Unpaid',
  });

  await MaintenanceRequest.create({
    tenantId: tenant._id,
    roomId: room._id,
    title: 'Leaking faucet',
    description: 'The faucet in the bathroom is leaking.',
    status: 'Pending Review',
  });

  return {
    seeded: true,
    admin: admin.username,
    tenant: tenant.phone,
    invoice: invoice.billingMonth,
  };
}
