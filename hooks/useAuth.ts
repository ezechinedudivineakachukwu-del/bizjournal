'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api-client';
import type { User } from '@/types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    const token = localStorage.getItem('bj_token');
    if (!token) { setLoading(false); return; }
    try {
      const data: any = await api.get('/auth/me');
      setUser(data.user);
    } catch {
      localStorage.removeItem('bj_token');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUser(); }, [fetchUser]);

  const login = (token: string, userData: User) => {
    localStorage.setItem('bj_token', token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('bj_token');
    setUser(null);
    window.location.href = '/login';
  };

  const refreshUser = () => fetchUser();

  return { user, loading, login, logout, refreshUser };
}
