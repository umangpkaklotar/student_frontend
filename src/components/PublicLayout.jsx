import React, { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Award, Menu, X, LogOut, LayoutDashboard, UserCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const PublicNavbar = () => {
  const { isAuthenticated, role, logout, showToast } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.body.dataset.drawerOpen = menuOpen ? 'true' : 'false';
    return () => {
      document.body.dataset.drawerOpen = 'false';
    };
  }, [menuOpen]);

  useEffect(() => {
    const closeDrawer = () => setMenuOpen(false);
    window.addEventListener('academyflow:close-drawer', closeDrawer);
    return () => window.removeEventListener('academyflow:close-drawer', closeDrawer);
  }, []);

  const handleFeaturesClick = (e) => {
    e.preventDefault();
    setMenuOpen(false);
    const scrollToFeatures = () => {
      const el = document.getElementById('features');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    };
    if (location.pathname !== '/') {
      navigate('/');
      window.setTimeout(scrollToFeatures, 120);
    } else {
      scrollToFeatures();
    }
  };

  const dashboardPath = role === 'admin' ? '/admin/dashboard' : '/student/dashboard';
  const profilePath = role === 'admin' ? '/admin/profile' : '/student/profile';

  const handleLogout = () => {
    logout();
    showToast('Logged out successfully.', 'info');
    setMenuOpen(false);
    navigate('/');
  };

  const navItems = [
    { to: '/', label: 'Home' },
    { to: '/about', label: 'About' },
    { to: '/karate', label: 'Karate' },
    { to: '/skating', label: 'Skating' },
    { to: '/#features', label: 'Features', isAnchor: true },
    { to: '/contact', label: 'Contact' },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-sm safe-area-top">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <span className="block text-base font-extrabold tracking-tight text-slate-900">
              AcademyFlow
            </span>
            <span className="block text-[10px] font-semibold uppercase tracking-wider text-indigo-600">
              Karate &amp; Skating
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) =>
            item.isAnchor ? (
              <a
                key={item.to}
                href={item.to}
                onClick={handleFeaturesClick}
                className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition"
              >
                {item.label}
              </a>
            ) : (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `text-sm font-medium transition ${
                    isActive ? 'text-indigo-600 font-semibold' : 'text-slate-600 hover:text-indigo-600'
                  }`
                }
              >
                {item.label}
              </NavLink>
            )
          )}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <Link to={dashboardPath} className="btn-secondary py-2 px-3.5 text-sm">
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
              <Link to={profilePath} className="btn-secondary py-2 px-3.5 text-sm">
                <UserCircle className="h-4 w-4" />
                Profile
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-100 transition"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-secondary py-2 px-4 text-sm">
                Login
              </Link>
              <Link to="/register" className="btn-primary py-2 px-4 text-sm">
                Register
              </Link>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 md:hidden"
          aria-label="Toggle menu"
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {menuOpen && (
        <div className="border-t border-slate-200 bg-white px-4 py-4 space-y-3 md:hidden">
          <div className="flex flex-col space-y-2">
            {navItems.map((item) =>
              item.isAnchor ? (
                <a
                  key={item.to}
                  href={item.to}
                  onClick={handleFeaturesClick}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  {item.label}
                </a>
              ) : (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `rounded-lg px-3 py-2 text-sm font-medium ${
                      isActive ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-700 hover:bg-slate-100'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              )
            )}
          </div>

          <div className="border-t border-slate-100 pt-3 flex flex-col gap-2">
            {isAuthenticated ? (
              <>
                <Link
                  to={dashboardPath}
                  onClick={() => setMenuOpen(false)}
                  className="btn-primary w-full"
                >
                  Dashboard
                </Link>
                <Link
                  to={profilePath}
                  onClick={() => setMenuOpen(false)}
                  className="btn-secondary w-full"
                >
                  Profile
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="btn-danger w-full"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="btn-secondary w-full"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMenuOpen(false)}
                  className="btn-primary w-full"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export const PublicFooter = () => (
  <footer className="border-t border-slate-200 bg-slate-900 text-slate-300">
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2.5 text-white">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600">
              <Award className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold">AcademyFlow</span>
          </div>
          <p className="mt-3 max-w-md text-sm text-slate-400 leading-relaxed">
            Student Attendance &amp; Fee Management System for Karate and Skating academies.
            Simple registration, transparent attendance, and organized monthly fees.
          </p>
        </div>

        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-white">
            Programs
          </h4>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link to="/karate" className="hover:text-white transition">
                Karate Classes
              </Link>
            </li>
            <li>
              <Link to="/skating" className="hover:text-white transition">
                Skating Classes
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-white transition">
                About Academy
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-white transition">
                Contact Us
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-white">
            Portal
          </h4>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link to="/login" className="hover:text-white transition">
                Student / Admin Login
              </Link>
            </li>
            <li>
              <Link to="/register" className="hover:text-white transition">
                Create Student Account
              </Link>
            </li>
            <li>
              <Link to="/forgot-password" className="hover:text-white transition">
                Forgot Password
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-10 border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <p>&copy; {new Date().getFullYear()} AcademyFlow. All rights reserved.</p>
        <p>Karate &amp; Skating Training Academy</p>
      </div>
    </div>
  </footer>
);
