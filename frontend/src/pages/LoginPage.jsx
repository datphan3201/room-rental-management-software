import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../api/client.js';

export function LoginPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuth();
  const [error, setError] = React.useState('');

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
        <p className="eyebrow">Local web application</p>
        <h1>Room Rental Management Software</h1>
        <p className="muted">
          React + Vite frontend connected to a Node.js + Express backend.
        </p>
        {error ? <div className="error-box">{error}</div> : null}
        <form onSubmit={handleSubmit} className="form">
          <label>
            Login ID
            <input name="loginId" placeholder="admin or 0900000001" required />
          </label>
          <label>
            Password
            <input name="password" type="password" required />
          </label>
          <button type="submit" className="button">
            Sign in
          </button>
        </form>
        <p className="muted small">The backend uses JWT authentication and a local repository-backed data store in this build.</p>
      </section>
    </div>
  );
}
