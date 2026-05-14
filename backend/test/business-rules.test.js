import assert from 'node:assert/strict';
import { after, before, beforeEach, test } from 'node:test';

import { connectDB, disconnectDB } from '../src/config/db.js';
import { seedDemoData } from '../src/services/seed.service.js';
import { loginWithCredentials } from '../src/services/auth.service.js';
import { createRoom, getRooms } from '../src/services/room.service.js';
import { getTenants, createTenantWithAccount } from '../src/services/tenant.service.js';
import { createContract, getContracts, updateContractById } from '../src/services/contract.service.js';
import { getInvoices } from '../src/services/invoice.service.js';
import { confirmPayment } from '../src/services/payment.service.js';
import { createMaintenanceRequestForAccount } from '../src/services/maintenance.service.js';
import { getRevenueReport } from '../src/services/report.service.js';
import { getAuditLogs, writeAuditLog } from '../src/services/audit.service.js';
import {
  createAnnouncement,
  getPinnedAnnouncements,
  updateAnnouncementById,
} from '../src/services/announcement.service.js';

process.env.NODE_ENV = 'test';

before(async () => {
  await connectDB();
});

beforeEach(async () => {
  await seedDemoData({ reset: true });
});

after(async () => {
  await disconnectDB();
});

test('payment confirmation rejects tenant mismatch', async () => {
  const adminAuth = await loginWithCredentials({ loginId: 'admin', password: 'admin123' });
  const [invoice] = await getInvoices();
  const otherTenant = await createTenantWithAccount({
    fullName: 'Test Mismatch Tenant',
    phone: '0999999901',
    identityNumber: '222222222222',
    dateOfBirth: '2001-02-02',
    hometown: 'Da Nang',
    password: 'tenant123',
  });

  await assert.rejects(
    () => confirmPayment({
      invoiceId: invoice._id,
      tenantId: otherTenant._id,
      amount: invoice.totalAmount,
      paymentDate: '2026-05-20',
      method: 'Cash',
      confirmedBy: adminAuth.user.id,
    }),
    /Payment tenant does not match invoice tenant/,
  );
});

test('tenant maintenance request rejects rooms outside active contract', async () => {
  const tenantAuth = await loginWithCredentials({ loginId: '0900000001', password: 'tenant123' });
  const room = await createRoom({
    roomNumber: 'T999',
    floor: 3,
    roomType: 'Standard',
    monthlyRent: 3000000,
    maxOccupants: 2,
    status: 'Available',
    description: 'Test room',
  });

  await assert.rejects(
    () => createMaintenanceRequestForAccount(tenantAuth.user.id, {
      roomId: room._id,
      title: 'Broken light',
      description: 'The room light is broken.',
    }),
    /Maintenance request room must belong to an active tenant contract/,
  );
});

test('only one active contract is allowed per room', async () => {
  const [tenant] = await getTenants();
  const contracts = await getContracts();
  const contract = contracts.find((item) => item.status === 'Active');

  await assert.rejects(
    () => createContract({
      tenantId: tenant._id,
      roomId: contract.roomId._id,
      startDate: '2026-06-01',
      endDate: '2027-05-31',
      depositAmount: 3500000,
      monthlyRent: 3500000,
      status: 'Active',
    }),
    /Only one active contract is allowed|Room is not available/,
  );
});

test('terminating active contract releases occupied room', async () => {
  const contracts = await getContracts();
  const contract = contracts.find((item) => item.status === 'Active');

  await updateContractById(contract._id, {
    tenantId: contract.tenantId._id,
    roomId: contract.roomId._id,
    startDate: contract.startDate,
    endDate: contract.endDate,
    depositAmount: contract.depositAmount,
    monthlyRent: contract.monthlyRent,
    status: 'Terminated',
    note: contract.note,
  });

  const rooms = await getRooms();
  const releasedRoom = rooms.find((room) => String(room._id) === String(contract.roomId._id));
  assert.equal(releasedRoom.status, 'Available');
});

test('revenue report summarizes seeded invoice data', async () => {
  const report = await getRevenueReport({ from: '2026-05', to: '2026-05' });
  const [may] = report.rows;

  assert.equal(report.rows.length, 1);
  assert.equal(may.month, '2026-05');
  assert.ok(report.summary.invoiceCount >= 5);
  assert.ok(report.summary.billedAmount > 4150000);
  assert.ok(report.summary.unpaidAmount >= 4150000);
  assert.ok(report.summary.paidAmount > 0);
});

test('audit log stores and returns recent events', async () => {
  const adminAuth = await loginWithCredentials({ loginId: 'admin', password: 'admin123' });
  await writeAuditLog({
    actorId: adminAuth.user.id,
    action: 'TEST',
    entityType: 'System',
    entityId: 'business-rules-test',
    summary: 'Recorded test audit event',
  });

  const [log] = await getAuditLogs({ entityType: 'System' });
  assert.equal(log.action, 'TEST');
  assert.equal(log.summary, 'Recorded test audit event');
  assert.equal(log.actorId.username, 'admin');
});

test('pinned announcements are visible to dashboard readers', async () => {
  const adminAuth = await loginWithCredentials({ loginId: 'admin', password: 'admin123' });
  const announcement = await createAnnouncement({
    title: 'Parking area cleaning',
    content: 'Please move motorbikes out of the parking area before 07:00 tomorrow.',
    isPinned: true,
  }, adminAuth.user.id);

  const pinned = await getPinnedAnnouncements();
  assert.ok(pinned.some((item) => String(item._id) === String(announcement._id)));

  await updateAnnouncementById(announcement._id, { isPinned: false }, adminAuth.user.id);
  const afterUnpin = await getPinnedAnnouncements();
  assert.ok(!afterUnpin.some((item) => String(item._id) === String(announcement._id)));
});
