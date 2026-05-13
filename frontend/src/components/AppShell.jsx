import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export function AppShell() {
  const { auth, setAuth } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
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
      ]
    : [
        ['Dashboard', '/tenant'],
        ['Contract', '/tenant/contract'],
        ['Invoices', '/tenant/invoices'],
        ['Payments', '/tenant/payments'],
        ['Maintenance', '/tenant/maintenance'],
      ];

  return (
    <div className="app-frame">
      <header className="topbar">
        <div>
          <div className="brand">Room Rental Management</div>
          <div className="muted small">{location.pathname}</div>
        </div>
        <nav className="nav-links">
          {links.map(([label, to]) => (
            <Link key={to} to={to}>
              {label}
            </Link>
          ))}
        </nav>
        <div className="session-chip">
          {user?.role} {user?.username || user?.tenant?.fullName || user?.phone || ''}
          <button
            type="button"
            className="text-button"
            onClick={() => {
              setAuth(null);
              navigate('/login');
            }}
          >
            Logout
          </button>
        </div>
      </header>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
