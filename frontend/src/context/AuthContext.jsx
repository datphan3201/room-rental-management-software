import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [auth, setAuthState] = useState(() => {
    try {
      const raw = window.localStorage.getItem('rrm_auth');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function hydrate() {
      try {
        if (!auth?.token) {
          setReady(true);
          return;
        }
        const { data } = await api.get('/auth/me');
        setAuthState((current) => (current ? { ...current, user: data.user } : current));
      } catch {
        window.localStorage.removeItem('rrm_auth');
        setAuthState(null);
      } finally {
        setReady(true);
      }
    }

    hydrate();
    // run only once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function setAuth(nextAuth) {
    if (!nextAuth) {
      window.localStorage.removeItem('rrm_auth');
      setAuthState(null);
      return;
    }
    window.localStorage.setItem('rrm_auth', JSON.stringify(nextAuth));
    setAuthState(nextAuth);
  }

  const value = useMemo(() => ({ auth, setAuth, ready }), [auth, ready]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return value;
}
