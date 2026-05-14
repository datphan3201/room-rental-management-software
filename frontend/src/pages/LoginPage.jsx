import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../api/client.js';
import { Modal } from '../components/Modal.jsx';

export function LoginPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuth();
  const [error, setError] = React.useState('');
  const [resetOpen, setResetOpen] = React.useState(false);
  const [resetForm, setResetForm] = React.useState({ loginId: '', identityNumber: '', newPassword: '' });
  const [resetError, setResetError] = React.useState('');
  const [resetMessage, setResetMessage] = React.useState('');
  const [resetSaving, setResetSaving] = React.useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setError('');

    try {
      const payload = {
        loginId: String(formData.get('loginId') || '').trim(),
        password: String(formData.get('password') || '').trim(),
      };
      const { data } = await api.post('/auth/login', payload);
      setAuth(data);
      navigate(data.user.role === 'ADMIN' ? '/admin' : '/tenant');
    } catch (requestError) {
      setError(requestError?.response?.data?.message || requestError?.message || 'Login failed');
    }
  }

  async function handleReset(event) {
    event.preventDefault();
    setResetSaving(true);
    setResetError('');
    setResetMessage('');
    try {
      await api.post('/auth/forgot-password', resetForm);
      setResetForm({ loginId: '', identityNumber: '', newPassword: '' });
      setResetMessage('Password reset');
    } catch (requestError) {
      setResetError(requestError?.response?.data?.message || 'Failed to reset password');
    } finally {
      setResetSaving(false);
    }
  }

  return (
    <div className="login-page">
      <section className="login-card">
        <p className="eyebrow">Rental operations</p>
        <h1>Room Manager</h1>
        {error ? <div className="error-box">{error}</div> : null}
        <form onSubmit={handleSubmit} className="form">
          <label>
            Login ID
            <input name="loginId" required />
          </label>
          <label>
            Password
            <input name="password" type="password" required />
          </label>
          <button type="submit" className="button">
            Sign in
          </button>
        </form>
        <button type="button" className="text-button dark login-reset-link" onClick={() => setResetOpen(true)}>
          Forgot password?
        </button>
      </section>
      <Modal open={resetOpen} title="Reset password" onClose={() => setResetOpen(false)}>
        <form className="form-grid" onSubmit={handleReset}>
          {resetError ? <div className="error-box">{resetError}</div> : null}
          {resetMessage ? <div className="success-box">{resetMessage}</div> : null}
          <label>
            Login ID
            <input
              value={resetForm.loginId}
              onChange={(event) => setResetForm((prev) => ({ ...prev, loginId: event.target.value }))}
              required
            />
          </label>
          <label>
            Identity number
            <input
              value={resetForm.identityNumber}
              onChange={(event) => setResetForm((prev) => ({ ...prev, identityNumber: event.target.value }))}
              required
            />
          </label>
          <label>
            New password
            <input
              type="password"
              minLength="6"
              value={resetForm.newPassword}
              onChange={(event) => setResetForm((prev) => ({ ...prev, newPassword: event.target.value }))}
              required
            />
          </label>
          <div className="button-row">
            <button className="button" disabled={resetSaving}>{resetSaving ? 'Saving...' : 'Reset'}</button>
            <button type="button" className="button secondary" onClick={() => setResetOpen(false)}>Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
