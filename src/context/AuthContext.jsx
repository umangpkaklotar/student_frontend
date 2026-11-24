import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

const readStoredAuth = () => {
  const token =
    localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
  const rawUser = localStorage.getItem('user') || sessionStorage.getItem('user');
  if (!token || !rawUser) return { token: null, user: null };
  try {
    return { token, user: JSON.parse(rawUser) };
  } catch {
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
    }, 3500);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const persistAuth = useCallback((newToken, newUser, rememberMe = true) => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('user');

    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem('access_token', newToken);
    storage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('user');
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
        if (active && res?.user) {
          setUser(res.user);
          const inLocal = Boolean(localStorage.getItem('access_token'));
          const storage = inLocal ? localStorage : sessionStorage;
          storage.setItem('user', JSON.stringify(res.user));
        }
      } catch {
        if (active) logout();
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
        isAuthenticated: Boolean(token && user),
        role: user?.role || null,
        login,
        logout,
        updateUser,
        showToast,
      }}
    >
      {children}

      {/* Global Toast Notifications */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg backdrop-blur-sm transition-all ${
              toast.type === 'error'
                ? 'border-rose-200 bg-rose-50 text-rose-900'
                : toast.type === 'info'
                ? 'border-sky-200 bg-sky-50 text-sky-900'
                : 'border-emerald-200 bg-emerald-50 text-emerald-900'
            }`}
          >
            {toast.type === 'error' ? (
              <AlertCircle className="h-5 w-5 shrink-0 text-rose-600 mt-0.5" />
            ) : toast.type === 'info' ? (
              <Info className="h-5 w-5 shrink-0 text-sky-600 mt-0.5" />
            ) : (
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 mt-0.5" />
            )}
            <p className="text-sm font-medium flex-1">{toast.message}</p>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
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
