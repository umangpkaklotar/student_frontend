import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { authService } from '../services/authService';
import Toast from '../components/Toast';

const AuthContext = createContext(null);

const clearAllStoredAuth = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('user');
  sessionStorage.removeItem('access_token');
  sessionStorage.removeItem('user');
};

const readStoredAuth = () => {
  const token =
    localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
  const rawUser = localStorage.getItem('user') || sessionStorage.getItem('user');
  if (!token || !rawUser) return { token: null, user: null };
  try {
    const parsed = JSON.parse(rawUser);
    if (!parsed || typeof parsed !== 'object' || !parsed.role) {
      clearAllStoredAuth();
      return { token: null, user: null };
    }
    return { token, user: parsed };
  } catch {
    clearAllStoredAuth();
    return { token: null, user: null };
  }
};

export const AuthProvider = ({ children }) => {
  const initial = readStoredAuth();
  const [user, setUser] = useState(initial.user);
  const [token, setToken] = useState(initial.token);
  const [loading, setLoading] = useState(Boolean(initial.token));
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id));
    }, 4000);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const persistAuth = useCallback((newToken, newUser, rememberMe = true) => {
    clearAllStoredAuth();
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem('access_token', newToken);
    storage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  }, []);

  const logout = useCallback(() => {
    clearAllStoredAuth();
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    let active = true;
    const verifySession = async () => {
      if (!token) {
        if (active) setLoading(false);
        return;
      }
      try {
        const res = await authService.getMe();
        if (active && res?.user && res.user.role) {
          setUser(res.user);
          const inLocal = Boolean(localStorage.getItem('access_token'));
          const storage = inLocal ? localStorage : sessionStorage;
          storage.setItem('user', JSON.stringify(res.user));
        } else if (active) {
          logout();
        }
      } catch (err) {
        const status = err?.response?.status;
        if (active && (status === 401 || status === 403)) {
          logout();
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    verifySession();
    return () => {
      active = false;
    };
  }, [token, logout]);

  const login = async (email, password, rememberMe = true) => {
    const data = await authService.login({ email, password });
    persistAuth(data.access_token, data.user, rememberMe);
    return data;
  };

  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser);
    const inLocal = Boolean(localStorage.getItem('access_token'));
    const storage = inLocal ? localStorage : sessionStorage;
    storage.setItem('user', JSON.stringify(updatedUser));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: Boolean(token && user && user.role),
        role: user?.role || null,
        login,
        logout,
        updateUser,
        showToast,
      }}
    >
      {children}
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return ctx;
};
