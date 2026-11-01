import { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!localStorage.getItem('campus_token')) { setIsLoading(false); return; }
    api.get('/auth/me').then(({ data }) => setUser(data.user)).catch(() => localStorage.removeItem('campus_token')).finally(() => setIsLoading(false));
  }, []);

  async function authenticate(path, details) {
    const { data } = await api.post(path, details);
    localStorage.setItem('campus_token', data.token);
    setUser(data.user);
  }

  async function logout() {
    try { await api.post('/auth/logout'); } finally { localStorage.removeItem('campus_token'); setUser(null); }
  }

  async function updateProfile(details) {
    const { data } = await api.patch('/auth/me', details);
    setUser(data.user);
  }

  return <AuthContext.Provider value={{ user, isLoading, authenticate, logout, updateProfile }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
