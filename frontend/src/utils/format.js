export function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

export function formatDate(value) {
  if (!value) return '';
  return new Date(value).toISOString().slice(0, 10);
}

export function calculateInvoiceTotal(invoice) {
  const roomRent = Number(invoice.roomRent || 0);
  const electricityFee = Number(invoice.electricityUsage || 0) * Number(invoice.electricityUnitPrice || 0);
  const waterFee = invoice.waterBillingMethod === 'BY_PERSON'
    ? Number(invoice.numberOfTenants || 0) * Number(invoice.waterPricePerPerson || 0)
    : Number(invoice.waterUsage || 0) * Number(invoice.waterUnitPrice || 0);
  const serviceFee = Number(invoice.serviceFee || 0);
  const parkingFee = Number(invoice.parkingFee || 0);
  const discount = Number(invoice.discount || 0);
  return roomRent + electricityFee + waterFee + serviceFee + parkingFee - discount;
}
