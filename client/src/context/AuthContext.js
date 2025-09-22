import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Try synchronous hydration first so first render already has data if available.
  const syncSessionUser = (() => {
    try { return sessionStorage.getItem('app_user'); } catch { return null; }
  })();
  const syncSessionToken = (() => {
    try { return sessionStorage.getItem('app_token'); } catch { return null; }
  })();
  const syncLocalUser = !syncSessionUser ? (() => { try { return localStorage.getItem('app_user'); } catch { return null; } })() : null;
  const syncLocalToken = !syncSessionToken ? (() => { try { return localStorage.getItem('app_token'); } catch { return null; } })() : null;

  const initialUser = syncSessionUser
    ? JSON.parse(syncSessionUser)
    : (syncLocalUser ? JSON.parse(syncLocalUser) : null);
  const initialToken = syncSessionToken || syncLocalToken || null;

  const [user, setUser] = useState(initialUser);
  const [token, setToken] = useState(initialToken);
  const [loading, setLoading] = useState(false); // we hydrate synchronously so no initial loading spinner needed

  // After first mount, if we only had local values (no session) copy them into session for current tab convenience
  useEffect(() => {
    if (user && token) {
      try {
        if (!sessionStorage.getItem('app_user')) {
          sessionStorage.setItem('app_user', JSON.stringify(user));
        }
        if (!sessionStorage.getItem('app_token')) {
          sessionStorage.setItem('app_token', token);
        }
      } catch { /* ignore */ }
    }
  }, []); // run once

  const login = async ({ email, password, role, hotelEmail }) => {
    setLoading(true);
    try {
      let data;
      if (role === 'admin') {
        data = await authApi.adminLogin(email, password);
      } else if (role === 'owner') {
        data = await authApi.ownerLogin(email, password, hotelEmail);
      } else {
        throw new Error('Unsupported role');
      }
      const payload = parseJwt(data.token);
      const u = { email, role: payload.role, hotelId: payload.hotel || null };
  // store in both (session for fast access, local for persistence after full browser restart)
  const userStr = JSON.stringify(u);
  sessionStorage.setItem('app_user', userStr);
  sessionStorage.setItem('app_token', data.token);
  localStorage.setItem('app_user', userStr);
  localStorage.setItem('app_token', data.token);
      setUser(u);
      setToken(data.token);
      setLoading(false);
      return { success: true };
    } catch (e) {
      setLoading(false);
      return { success: false, message: e.message };
    }
  };

  const logout = () => {
    sessionStorage.removeItem('app_user');
    sessionStorage.removeItem('app_token');
    localStorage.removeItem('app_user');
    localStorage.removeItem('app_token');
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

function parseJwt(t) {
  try { return JSON.parse(atob(t.split('.')[1])); } catch { return {}; }
}

export default AuthContext;
