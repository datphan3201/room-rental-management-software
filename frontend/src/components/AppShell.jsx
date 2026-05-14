import React from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Modal } from './Modal.jsx';

export function AppShell() {
  const { auth, setAuth } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [passwordOpen, setPasswordOpen] = React.useState(false);
  const [passwordForm, setPasswordForm] = React.useState({ currentPassword: '', newPassword: '' });
  const [passwordMessage, setPasswordMessage] = React.useState('');
  const [passwordError, setPasswordError] = React.useState('');
  const [passwordSaving, setPasswordSaving] = React.useState(false);
  const user = auth?.user;
  const isAdmin = user?.role === 'ADMIN';
  const links = isAdmin
    ? [
        ['Dashboard', '/admin'],
        ['Rooms', '/admin/rooms'],
        ['Tenants', '/admin/tenants'],
        ['Contracts', '/admin/contracts'],
        ['Invoices', '/admin/invoices'],
        ['Payments', '/admin/payments'],
        ['Maintenance', '/admin/maintenance'],
        ['Reports', '/admin/reports'],
        ['Audit', '/admin/audit'],
      ]
    : [
        ['Dashboard', '/tenant'],
        ['Contract', '/tenant/contract'],
        ['Invoices', '/tenant/invoices'],
        ['Payments', '/tenant/payments'],
        ['Maintenance', '/tenant/maintenance'],
      ];
  const sectionTitle = isAdmin ? 'Admin Workspace' : 'Tenant Portal';
  const displayName = user?.username || user?.tenant?.fullName || user?.phone || 'User';

  async function handlePasswordSubmit(event) {
    event.preventDefault();
    setPasswordSaving(true);
    setPasswordError('');
    setPasswordMessage('');
    try {
      await api.post('/auth/change-password', passwordForm);
      setPasswordForm({ currentPassword: '', newPassword: '' });
      setPasswordMessage('Password changed');
    } catch (requestError) {
      setPasswordError(requestError?.response?.data?.message || 'Failed to change password');
    } finally {
      setPasswordSaving(false);
    }
  }

  return (
    <div className="app-frame">
      <aside className="sidebar">
        <div className="brand-block">
          <div className="brand-mark">RM</div>
          <div>
            <div className="brand">Room Manager</div>
            <div className="sidebar-subtitle">{sectionTitle}</div>
          </div>
        </div>

        <nav className="nav-links" aria-label="Primary navigation">
          {links.map(([label, to]) => (
            <NavLink key={to} to={to} end={to === '/admin' || to === '/tenant'}>
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="session-card">
          <div className="session-role">{user?.role}</div>
          <div className="session-name">{displayName}</div>
          <button
            type="button"
            className="text-button logout-button"
            onClick={() => setPasswordOpen(true)}
          >
            Change password
          </button>
          <button
            type="button"
            className="text-button logout-button"
            onClick={() => {
              setAuth(null);
              navigate('/login');
            }}
          >
            Logout
          </button>
        </div>
      </aside>

      <div className="workspace">
        <header className="workspace-header">
          <div>
            <div className="breadcrumb">{location.pathname}</div>
            <h1>{sectionTitle}</h1>
          </div>
          <div className="workspace-user">
            <span>{user?.role}</span>
            <strong>{displayName}</strong>
          </div>
        </header>

        <main className="content">
          <Outlet />
        </main>
      </div>

      <Modal open={passwordOpen} title="Change password" onClose={() => setPasswordOpen(false)}>
        <form className="form-grid" onSubmit={handlePasswordSubmit}>
          {passwordError ? <div className="error-box">{passwordError}</div> : null}
          {passwordMessage ? <div className="success-box">{passwordMessage}</div> : null}
          <label>
            Current password
            <input
              type="password"
              value={passwordForm.currentPassword}
              onChange={(event) => setPasswordForm((prev) => ({ ...prev, currentPassword: event.target.value }))}
              required
            />
          </label>
          <label>
            New password
            <input
              type="password"
              minLength="6"
              value={passwordForm.newPassword}
              onChange={(event) => setPasswordForm((prev) => ({ ...prev, newPassword: event.target.value }))}
              required
            />
          </label>
          <div className="button-row">
            <button className="button" disabled={passwordSaving}>{passwordSaving ? 'Saving...' : 'Save'}</button>
            <button type="button" className="button secondary" onClick={() => setPasswordOpen(false)}>Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
