import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../api/client.js';

const ADMIN_SUPPORT_PHONE = '0900000000';

export function LoginPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuth();
  const [error, setError] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);

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

  return (
    <div className="login-page">
      <section className="login-card">
        <p className="eyebrow">Property operations</p>
        <h1>Rental Property Management</h1>
        {error ? <div className="error-box">{error}</div> : null}
        <form onSubmit={handleSubmit} className="form">
          <label>
            Login ID
            <input name="loginId" required />
          </label>
          <label>
            Password
            <span className="password-field">
              <input name="password" type={showPassword ? 'text' : 'password'} required />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </span>
          </label>
          <button type="submit" className="button">
            Sign in
          </button>
        </form>
        <p className="login-help-text">
          Forgot your password? Contact admin: <strong>{ADMIN_SUPPORT_PHONE}</strong>
        </p>
      </section>
    </div>
  );
}
