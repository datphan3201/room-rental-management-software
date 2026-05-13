import { Room } from '../models/room.model.js';
import { Tenant } from '../models/tenant.model.js';
import { Invoice } from '../models/invoice.model.js';

function currentBillingMonth() {
  return new Date().toISOString().slice(0, 7);
}

export async function getAdminDashboardStats() {
  const [totalRooms, availableRooms, occupiedRooms, maintenanceRooms, totalTenants, unpaidInvoices, paidInvoices] = await Promise.all([
    Room.countDocuments(),
    Room.countDocuments({ status: 'Available' }),
    Room.countDocuments({ status: 'Occupied' }),
    Room.countDocuments({ status: 'Maintenance' }),
    Tenant.countDocuments(),
    Invoice.countDocuments({ status: 'Unpaid' }),
    Invoice.countDocuments({ status: 'Paid' }),
  ]);

  const paidThisMonth = await Invoice.find({
    status: 'Paid',
    billingMonth: currentBillingMonth(),
  }).lean();
  const monthlyRevenue = paidThisMonth.reduce((sum, invoice) => sum + Number(invoice.totalAmount || 0), 0);

  return {
    totalRooms,
    availableRooms,
    occupiedRooms,
    maintenanceRooms,
    totalTenants,
    unpaidInvoices,
    paidInvoices,
    monthlyRevenue,
  };
}

export async function getTenantDashboardStats(accountId) {
  const tenant = await Tenant.findOne({ accountId }).lean();
  if (!tenant) {
    return null;
  }

  const invoices = await Invoice.find({ tenantId: tenant._id }).lean();
  const unpaidInvoices = invoices.filter((invoice) => invoice.status === 'Unpaid').length;
  const paidInvoices = invoices.filter((invoice) => invoice.status === 'Paid').length;
  const totalAmount = invoices.reduce((sum, invoice) => sum + Number(invoice.totalAmount || 0), 0);

  return {
    tenant,
    totalInvoices: invoices.length,
    unpaidInvoices,
    paidInvoices,
    totalAmount,
  };
}
