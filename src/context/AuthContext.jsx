import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getProfile } from '../api/endpoints';
import api from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    const token = localStorage.getItem('access_token');
    if (!token) { setLoading(false); return; }
    try {
      const res = await getProfile();
      setUser(res.data);
    } catch {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUser(); }, [fetchUser]);

  const login = async (credentials) => {
    const res = await api.post('/auth/login/', credentials);
    localStorage.setItem('access_token', res.data.access);
    localStorage.setItem('refresh_token', res.data.refresh);
    const profile = await getProfile();
    setUser(profile.data);
    return profile.data;
  };

  const handleGoogleLogin = async (token) => {
    const res = await api.post('/auth/google/', { token });
    localStorage.setItem('access_token', res.data.access);
    localStorage.setItem('refresh_token', res.data.refresh);
    const profile = await getProfile();
    setUser(profile.data);
    return profile.data;
  };

  const logout = () => {
    const refresh = localStorage.getItem('refresh_token');
    if (refresh) api.post('/auth/logout/', { refresh }).catch(() => {});
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
  };

  const isStaff = user?.role === 'staff' || user?.role === 'admin';
  const isDriver = user?.role === 'driver';

  return (
    <AuthContext.Provider value={{ user, loading, login, handleGoogleLogin, logout, isStaff, isDriver, fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
