import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { AppShell } from './components/AppShell.jsx';
import { LoginPage } from './pages/LoginPage.jsx';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage.jsx';
import { AdminRoomsPage } from './pages/admin/AdminRoomsPage.jsx';
import { AdminTenantsPage } from './pages/admin/AdminTenantsPage.jsx';
import { AdminContractsPage } from './pages/admin/AdminContractsPage.jsx';
import { AdminBillingPage } from './pages/admin/AdminBillingPage.jsx';
import { AdminMaintenancePage } from './pages/admin/AdminMaintenancePage.jsx';
import { AdminReportsPage } from './pages/admin/AdminReportsPage.jsx';
import { AdminAuditPage } from './pages/admin/AdminAuditPage.jsx';
import { TenantDashboardPage } from './pages/tenant/TenantDashboardPage.jsx';
import { TenantContractPage } from './pages/tenant/TenantContractPage.jsx';
import { TenantBillingPage } from './pages/tenant/TenantBillingPage.jsx';
import { TenantMaintenancePage } from './pages/tenant/TenantMaintenancePage.jsx';

function RequireAuth({ children, role }) {
  const { auth, ready } = useAuth();
  if (!ready) {
    return (
      <div className="login-page">
        <section className="login-card">
          <p className="eyebrow">Loading session</p>
          <h1>Rental Property Management</h1>
          <p className="muted">Restoring your authentication state...</p>
        </section>
      </div>
    );
  }
  if (!auth) return <Navigate to="/login" replace />;
  if (role && auth.user.role !== role) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/admin"
          element={
            <RequireAuth role="ADMIN">
              <AppShell />
            </RequireAuth>
          }
        >
          <Route index element={<AdminDashboardPage />} />
          <Route path="rooms" element={<AdminRoomsPage />} />
          <Route path="tenants" element={<AdminTenantsPage />} />
          <Route path="contracts" element={<AdminContractsPage />} />
          <Route path="billing" element={<AdminBillingPage />} />
          <Route path="invoices" element={<AdminBillingPage initialView="invoices" />} />
          <Route path="payments" element={<AdminBillingPage initialView="payments" />} />
          <Route path="maintenance" element={<AdminMaintenancePage />} />
          <Route path="reports" element={<AdminReportsPage />} />
          <Route path="audit" element={<AdminAuditPage />} />
        </Route>
        <Route
          path="/tenant"
          element={
            <RequireAuth role="TENANT">
              <AppShell />
            </RequireAuth>
          }
        >
          <Route index element={<TenantDashboardPage />} />
          <Route path="contract" element={<TenantContractPage />} />
          <Route path="billing" element={<TenantBillingPage />} />
          <Route path="invoices" element={<TenantBillingPage initialView="invoices" />} />
          <Route path="payments" element={<TenantBillingPage initialView="payments" />} />
          <Route path="maintenance" element={<TenantMaintenancePage />} />
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  );
}
