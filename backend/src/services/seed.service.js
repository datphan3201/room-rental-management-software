import bcrypt from 'bcryptjs';
import { Account } from '../models/account.model.js';
import { Tenant } from '../models/tenant.model.js';
import { Room } from '../models/room.model.js';
import { Contract } from '../models/contract.model.js';
import { Invoice } from '../models/invoice.model.js';
import { Payment } from '../models/payment.model.js';
import { MaintenanceRequest } from '../models/maintenanceRequest.model.js';
import { AuditLog } from '../models/auditLog.model.js';
import { Announcement } from '../models/announcement.model.js';
import { PaymentSettings } from '../models/paymentSettings.model.js';

async function clearDemoData() {
  await Promise.all([
    Account.deleteMany({}),
    Tenant.deleteMany({}),
    Room.deleteMany({}),
    Contract.deleteMany({}),
    Invoice.deleteMany({}),
    Payment.deleteMany({}),
    MaintenanceRequest.deleteMany({}),
    AuditLog.deleteMany({}),
    Announcement.deleteMany({}),
    PaymentSettings.deleteMany({}),
  ]);
}

function calculateInvoice(input) {
  const electricityFee = input.electricityUsage * input.electricityUnitPrice;
  const waterFee = input.waterBillingMethod === 'BY_PERSON'
    ? input.numberOfTenants * input.waterPricePerPerson
    : input.waterUsage * input.waterUnitPrice;
  const totalAmount = input.roomRent + electricityFee + waterFee + input.serviceFee + input.parkingFee - input.discount;
  return {
    electricityFee,
    waterFee,
    totalAmount,
  };
}

async function createTenant({ fullName, phone, email, identityNumber, dateOfBirth, hometown }) {
  const account = await Account.create({
    phone,
    passwordHash: await bcrypt.hash('tenant123', 10),
    role: 'TENANT',
    status: 'ACTIVE',
  });

  const tenant = await Tenant.create({
    accountId: account._id,
    fullName,
    phone,
    email,
    identityNumber,
    dateOfBirth: new Date(dateOfBirth),
    hometown,
  });

  return { account, tenant };
}

async function createInvoice({ contract, tenant, room, billingMonth, status, usage, dueDate }) {
  const base = {
    tenantId: tenant._id,
    roomId: room._id,
    contractId: contract._id,
    billingMonth,
    roomRent: room.monthlyRent,
    electricityUsage: usage.electricityUsage,
    electricityUnitPrice: usage.electricityUnitPrice,
    waterBillingMethod: usage.waterBillingMethod,
    waterUsage: usage.waterUsage,
    waterUnitPrice: usage.waterUnitPrice,
    numberOfTenants: usage.numberOfTenants,
    waterPricePerPerson: usage.waterPricePerPerson,
    serviceFee: usage.serviceFee,
    parkingFee: usage.parkingFee,
    discount: usage.discount,
    dueDate: new Date(dueDate),
    status,
  };
  const totals = calculateInvoice(base);
  return Invoice.create({ ...base, ...totals });
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

  const admin = await Account.create({
    username: 'admin',
    passwordHash: await bcrypt.hash('admin123', 10),
    role: 'ADMIN',
    status: 'ACTIVE',
  });

  const owner = await Account.create({
    username: 'owner',
    passwordHash: await bcrypt.hash('owner123', 10),
    role: 'ADMIN',
    status: 'ACTIVE',
  });

  const tenantSeeds = [
    ['Nguyen Van A', '0900000001', 'tenant.a@example.com', '012345678901', '2000-01-01', 'Ho Chi Minh City'],
    ['Tran Thi B', '0900000002', 'tenant.b@example.com', '012345678902', '1999-04-12', 'Da Nang'],
    ['Le Minh C', '0900000003', 'tenant.c@example.com', '012345678903', '1998-09-20', 'Can Tho'],
    ['Pham Thu D', '0900000004', 'tenant.d@example.com', '012345678904', '2001-07-08', 'Hue'],
    ['Hoang Quoc E', '0900000005', 'tenant.e@example.com', '012345678905', '1997-02-15', 'Dong Nai'],
    ['Vo Ngoc F', '0900000006', 'tenant.f@example.com', '012345678906', '2002-11-30', 'Binh Duong'],
    ['Dang Hai G', '0900000007', 'tenant.g@example.com', '012345678907', '1996-06-22', 'Nha Trang'],
  ];

  const tenantRecords = await Promise.all(tenantSeeds.map(([fullName, phone, email, identityNumber, dateOfBirth, hometown]) => createTenant({
    fullName,
    phone,
    email,
    identityNumber,
    dateOfBirth,
    hometown,
  })));
  const tenants = tenantRecords.map((record) => record.tenant);

  const roomSeeds = [
    ['A101', 1, 'Standard', 3500000, 2, 'Occupied', 'Near the main entrance, good for long-term single tenant.'],
    ['A102', 1, 'Standard', 3300000, 2, 'Available', 'Quiet room with morning light.'],
    ['A103', 1, 'Deluxe', 4500000, 3, 'Occupied', 'Larger room with balcony and private bathroom.'],
    ['A104', 1, 'Studio', 5200000, 2, 'Maintenance', 'Under repainting and electrical inspection.'],
    ['B201', 2, 'Standard', 3600000, 2, 'Occupied', 'Stable tenant, low maintenance history.'],
    ['B202', 2, 'Deluxe', 4700000, 3, 'Available', 'Corner room, suitable for couple.'],
    ['B203', 2, 'Studio', 5500000, 2, 'Occupied', 'Studio with pantry area.'],
    ['B204', 2, 'Standard', 3400000, 2, 'Maintenance', 'Bathroom pipe repair scheduled.'],
    ['C301', 3, 'Deluxe', 4800000, 3, 'Occupied', 'High floor, city view.'],
    ['C302', 3, 'Studio', 5600000, 2, 'Available', 'Fully furnished studio.'],
    ['C303', 3, 'Family', 6800000, 4, 'Occupied', 'Family room with two beds.'],
    ['C304', 3, 'Standard', 3700000, 2, 'Available', 'Compact room near laundry area.'],
  ];

  const rooms = await Room.create(roomSeeds.map(([roomNumber, floor, roomType, monthlyRent, maxOccupants, status, description]) => ({
    roomNumber,
    floor,
    roomType,
    monthlyRent,
    maxOccupants,
    status,
    description,
  })));

  const activeAssignments = [
    { tenant: tenants[0], room: rooms[0], startDate: '2026-05-01', endDate: '2027-04-30', note: 'Seeded active contract for demo tenant.' },
    { tenant: tenants[1], room: rooms[2], startDate: '2026-03-15', endDate: '2027-03-14', note: 'Deluxe room contract.' },
    { tenant: tenants[2], room: rooms[4], startDate: '2026-02-01', endDate: '2027-01-31', note: 'Standard room contract.' },
    { tenant: tenants[3], room: rooms[6], startDate: '2026-04-01', endDate: '2027-03-31', note: 'Studio contract with pantry.' },
    { tenant: tenants[4], room: rooms[8], startDate: '2026-01-10', endDate: '2027-01-09', note: 'Deluxe high-floor contract.' },
    { tenant: tenants[5], room: rooms[10], startDate: '2026-05-10', endDate: '2027-05-09', note: 'Family room contract.' },
  ];

  const activeContracts = [];
  for (const assignment of activeAssignments) {
    activeContracts.push(await Contract.create({
      tenantId: assignment.tenant._id,
      roomId: assignment.room._id,
      startDate: new Date(assignment.startDate),
      endDate: new Date(assignment.endDate),
      depositAmount: assignment.room.monthlyRent,
      monthlyRent: assignment.room.monthlyRent,
      status: 'Active',
      note: assignment.note,
    }));
  }

  await Contract.create({
    tenantId: tenants[6]._id,
    roomId: rooms[1]._id,
    startDate: new Date('2025-05-01'),
    endDate: new Date('2026-04-30'),
    depositAmount: rooms[1].monthlyRent,
    monthlyRent: rooms[1].monthlyRent,
    status: 'Terminated',
    note: 'Historical contract ended before current demo month.',
  });

  const usageProfiles = [
    { electricityUsage: 120, electricityUnitPrice: 3500, waterBillingMethod: 'BY_USAGE', waterUsage: 12, waterUnitPrice: 2500, numberOfTenants: 2, waterPricePerPerson: 25000, serviceFee: 100000, parkingFee: 100000, discount: 0 },
    { electricityUsage: 156, electricityUnitPrice: 3500, waterBillingMethod: 'BY_PERSON', waterUsage: 0, waterUnitPrice: 2500, numberOfTenants: 2, waterPricePerPerson: 30000, serviceFee: 120000, parkingFee: 0, discount: 50000 },
    { electricityUsage: 88, electricityUnitPrice: 3500, waterBillingMethod: 'BY_USAGE', waterUsage: 9, waterUnitPrice: 2500, numberOfTenants: 1, waterPricePerPerson: 25000, serviceFee: 90000, parkingFee: 100000, discount: 0 },
    { electricityUsage: 210, electricityUnitPrice: 3500, waterBillingMethod: 'BY_PERSON', waterUsage: 0, waterUnitPrice: 2500, numberOfTenants: 2, waterPricePerPerson: 30000, serviceFee: 150000, parkingFee: 120000, discount: 0 },
    { electricityUsage: 135, electricityUnitPrice: 3500, waterBillingMethod: 'BY_USAGE', waterUsage: 14, waterUnitPrice: 2500, numberOfTenants: 2, waterPricePerPerson: 25000, serviceFee: 120000, parkingFee: 100000, discount: 0 },
    { electricityUsage: 245, electricityUnitPrice: 3500, waterBillingMethod: 'BY_PERSON', waterUsage: 0, waterUnitPrice: 2500, numberOfTenants: 4, waterPricePerPerson: 30000, serviceFee: 180000, parkingFee: 150000, discount: 100000 },
  ];
  const months = ['2026-03', '2026-04', '2026-05'];
  const statusesByContract = [
    ['Paid', 'Paid', 'Unpaid'],
    ['Paid', 'Overdue', 'Unpaid'],
    ['Paid', 'Paid', 'Paid'],
    ['Paid', 'Unpaid', 'Unpaid'],
    ['Overdue', 'Paid', 'Paid'],
    ['Paid', 'Paid', 'No invoice'],
  ];

  const invoices = [];
  for (let contractIndex = 0; contractIndex < activeContracts.length; contractIndex += 1) {
    const contract = activeContracts[contractIndex];
    const room = activeAssignments[contractIndex].room;
    const tenant = activeAssignments[contractIndex].tenant;
    for (let monthIndex = 0; monthIndex < months.length; monthIndex += 1) {
      const status = statusesByContract[contractIndex][monthIndex];
      if (status === 'No invoice') continue;
      invoices.push(await createInvoice({
        contract,
        tenant,
        room,
        billingMonth: months[monthIndex],
        status,
        usage: usageProfiles[contractIndex],
        dueDate: `${months[monthIndex]}-20`,
      }));
    }
  }

  const paidInvoices = invoices.filter((invoice) => invoice.status === 'Paid');
  await Payment.create(paidInvoices.map((invoice) => ({
    invoiceId: invoice._id,
    tenantId: invoice.tenantId,
    amount: invoice.totalAmount,
    paymentDate: new Date(`${invoice.billingMonth}-18`),
    method: invoice.billingMonth === '2026-05' ? 'Bank Transfer' : 'Cash',
    confirmedBy: admin._id,
    note: `Demo payment for ${invoice.billingMonth}`,
  })));

  await MaintenanceRequest.create([
    {
      tenantId: tenants[0]._id,
      roomId: rooms[0]._id,
      title: 'Leaking faucet',
      description: 'The faucet in the bathroom is leaking.',
      status: 'Pending Review',
    },
    {
      tenantId: tenants[1]._id,
      roomId: rooms[2]._id,
      title: 'Air conditioner noise',
      description: 'AC makes noise after midnight.',
      status: 'Accepted',
      responseNote: 'Technician scheduled for Saturday morning.',
      maintenanceCost: 0,
    },
    {
      tenantId: tenants[3]._id,
      roomId: rooms[6]._id,
      title: 'Kitchen light replacement',
      description: 'Pantry light is flickering.',
      status: 'Resolved',
      responseNote: 'LED light replaced.',
      maintenanceCost: 180000,
      resolvedAt: new Date('2026-05-08'),
    },
    {
      tenantId: tenants[4]._id,
      roomId: rooms[8]._id,
      title: 'Wall repaint request',
      description: 'Tenant requested decorative repainting.',
      status: 'Rejected',
      responseNote: 'Decorative repainting is outside maintenance scope.',
      maintenanceCost: 0,
    },
  ]);

  await Announcement.create({
    title: 'Water system maintenance this Sunday',
    content: 'The landlord will inspect the water pump and rooftop tank from 08:00 to 10:00. Please store enough water before the maintenance window.',
    isPinned: true,
    pinnedAt: new Date(),
    createdBy: admin._id,
    updatedBy: admin._id,
  });

  await PaymentSettings.create({
    bankName: 'Demo Bank',
    accountName: 'Room Manager',
    accountNumber: '0123456789',
    qrImageUrl: '',
    updatedBy: admin._id,
  });

  await AuditLog.create([
    {
      actorId: admin._id,
      action: 'SEED',
      entityType: 'System',
      entityId: 'demo-data',
      summary: 'Seeded realistic demo data set',
      metadata: { rooms: rooms.length, tenants: tenants.length, invoices: invoices.length },
    },
    {
      actorId: owner._id,
      action: 'REVIEW',
      entityType: 'Report',
      entityId: 'revenue-demo',
      summary: 'Reviewed monthly revenue demo report',
    },
  ]);

  return {
    seeded: true,
    admins: [admin.username, owner.username],
    tenants: tenants.length,
    rooms: rooms.length,
    contracts: activeContracts.length + 1,
    invoices: invoices.length,
    payments: paidInvoices.length,
  };
}
