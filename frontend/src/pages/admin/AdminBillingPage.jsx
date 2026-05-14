import React from 'react';
import { AdminInvoicesPage } from './AdminInvoicesPage.jsx';
import { AdminPaymentsPage } from './AdminPaymentsPage.jsx';

export function AdminBillingPage({ initialView = 'invoices' }) {
  const [billingView, setBillingView] = React.useState(initialView);

  React.useEffect(() => {
    setBillingView(initialView);
  }, [initialView]);

  return (
    <section className="panel wide">
      <div className="panel-header">
        <div>
          <h2>Billing</h2>
        </div>
        <div className="view-switch" aria-label="Billing view">
          <button
            type="button"
            className={billingView === 'invoices' ? 'active' : ''}
            onClick={() => setBillingView('invoices')}
          >
            Invoices
          </button>
          <button
            type="button"
            className={billingView === 'payments' ? 'active' : ''}
            onClick={() => setBillingView('payments')}
          >
            Payments
          </button>
        </div>
      </div>
      {billingView === 'invoices' ? <AdminInvoicesPage /> : <AdminPaymentsPage />}
    </section>
  );
}
