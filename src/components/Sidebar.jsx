import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  CreditCard,
  BarChart3,
  UserCircle,
  LogOut,
  Award,
  X,
  ClipboardCheck,
  Home,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ADMIN_LINKS = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/students', label: 'Students', icon: Users },
  { to: '/admin/enrollments', label: 'Enrollments', icon: ClipboardCheck },
  { to: '/admin/attendance', label: 'Attendance', icon: CalendarCheck },
  { to: '/admin/fees', label: 'Fees', icon: CreditCard },
  { to: '/admin/reports', label: 'Reports', icon: BarChart3 },
  { to: '/admin/profile', label: 'Profile', icon: UserCircle },
];

const STUDENT_LINKS = [
  { to: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/student/enrollment', label: 'Class Enrollment', icon: ClipboardCheck },
  { to: '/student/attendance', label: 'Attendance', icon: CalendarCheck },
  { to: '/student/fees', label: 'Fees', icon: CreditCard },
  { to: '/student/profile', label: 'Profile', icon: UserCircle },
];

const Sidebar = ({ open, onClose }) => {
  const { role, logout, showToast } = useAuth();
  const navigate = useNavigate();
  const links = role === 'admin' ? ADMIN_LINKS : STUDENT_LINKS;

  const handleLogout = () => {
    logout();
    showToast('Logged out successfully.', 'info');
    navigate('/login', { replace: true });
  };

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-slate-900 text-slate-100 transition-transform duration-200 lg:static lg:translate-x-0 safe-area-top safe-area-bottom ${open ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-800 px-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500 text-white shadow-sm">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <span className="block text-sm font-bold tracking-tight text-white">
                AcademyFlow
              </span>
              <span className="block text-[11px] font-medium text-slate-400">
                {role === 'admin' ? 'Admin Portal' : 'Student Portal'}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            {role === 'admin' ? 'Administration' : 'Menu'}
          </p>
          {links.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${isActive
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="border-t border-slate-800 p-3 space-y-1">
          <NavLink
            to="/"
            onClick={onClose}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
          >
            <Home className="h-5 w-5 shrink-0" />
            <span>Public Home</span>
          </NavLink>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-rose-300 transition hover:bg-rose-950/60 hover:text-rose-200"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
