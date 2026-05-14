import React from 'react';

export function StatusBadge({ value }) {
  const label = value || '-';
  const key = String(label).toLowerCase().replace(/\s+/g, '-');
  return <span className={`pill status-${key}`}>{label}</span>;
}
