import assert from 'node:assert/strict';
import { beforeEach, test } from 'node:test';

import { initStore } from '../src/data/store.js';
import { seedDemoData } from '../src/services/seed.service.js';
import { loginWithCredentials } from '../src/services/auth.service.js';
import { createRoom, getRooms } from '../src/services/room.service.js';
import { getTenants, createTenantWithAccount } from '../src/services/tenant.service.js';
import { createContract, getContracts, updateContractById } from '../src/services/contract.service.js';
import { getInvoices } from '../src/services/invoice.service.js';
import { confirmPayment } from '../src/services/payment.service.js';
import { createMaintenanceRequestForAccount } from '../src/services/maintenance.service.js';

beforeEach(async () => {
  await initStore();
  await seedDemoData({ reset: true });
});

test('payment confirmation rejects tenant mismatch', async () => {
  const adminAuth = await loginWithCredentials({ loginId: 'admin', password: 'admin123' });
  const [invoice] = await getInvoices();
  const otherTenant = await createTenantWithAccount({
    fullName: 'Tran Thi B',
    phone: '0900000002',
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
    roomNumber: 'C301',
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
  const [contract] = await getContracts();

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
  const [contract] = await getContracts();

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
  const releasedRoom = rooms.find((room) => room._id === contract.roomId._id);
  assert.equal(releasedRoom.status, 'Available');
});
