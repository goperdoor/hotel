import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('app_user');
    const storedToken = localStorage.getItem('app_token');
    if (stored && storedToken) {
      setUser(JSON.parse(stored));
      setToken(storedToken);
    }
  }, []);

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
      localStorage.setItem('app_user', JSON.stringify(u));
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
