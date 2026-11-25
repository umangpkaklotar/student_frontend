import React from 'react';
import { Menu, Calendar, ShieldCheck, GraduationCap, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ title, onMenuClick }) => {
  const { user, role, logout, showToast } = useAuth();
  const navigate = useNavigate();
  const resolvedTitle = title || (role === 'admin' ? 'Admin Portal' : 'Student Portal');

  const todayLabel = new Date().toLocaleDateString('en-IN', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const handleLogout = () => {
    logout();
    showToast('Logged out successfully.', 'info');
    navigate('/login', { replace: true });
  };

  return (
    <header className="sticky top-0 z-30 flex min-h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 sm:px-6 backdrop-blur-sm safe-area-top">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
            {resolvedTitle}
          </h1>
          <p className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500">
            <Calendar className="h-3.5 w-3.5" />
            <span>{todayLabel}</span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 sm:gap-3">
        <span
          className={`hidden sm:inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
            role === 'admin'
              ? 'bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-600/20'
              : 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20'
          }`}
        >
          {role === 'admin' ? (
            <ShieldCheck className="h-3.5 w-3.5" />
          ) : (
            <GraduationCap className="h-3.5 w-3.5" />
          )}
          <span className="capitalize">{role}</span>
        </span>

        <div className="hidden sm:flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
            {(user?.name || 'U').charAt(0).toUpperCase()}
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-semibold text-slate-900 leading-none">
              {user?.name}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5 leading-none">
              {user?.email}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs sm:text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
          title="Logout"
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
