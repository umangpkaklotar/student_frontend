import React, { Component, useEffect, useState } from 'react';
import {
  BrowserRouter,
  Navigate,
  NavLink,
  Outlet,
  Route,
  Routes,
} from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  CreditCard,
  UserCircle,
} from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import MobileBridge from './components/MobileBridge';

import Home from './pages/Home';
import Karate from './pages/Karate';
import Skating from './pages/Skating';
import About from './pages/About';
import Contact from './pages/Contact';

import Login from './pages/Login';
import Register from './pages/Register';
import VerifyOTP from './pages/VerifyOTP';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

import AdminDashboard from './pages/admin/Dashboard';
import Students from './pages/admin/Students';
import AddStudent from './pages/admin/AddStudent';
import EditStudent from './pages/admin/EditStudent';
import AdminEnrollments from './pages/admin/Enrollments';
import AdminAttendance from './pages/admin/Attendance';
import AdminFees from './pages/admin/Fees';
import Reports from './pages/admin/Reports';
import AdminProfile from './pages/admin/Profile';

import StudentDashboard from './pages/student/Dashboard';
import StudentEnrollment from './pages/student/Enrollment';
import StudentAttendance from './pages/student/Attendance';
import StudentFees from './pages/student/Fees';
import StudentProfile from './pages/student/Profile';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error?.message || 'Unexpected error' };
  }

  handleReset = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('user');
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
          <div className="max-w-md w-full rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Something went wrong</h2>
            <p className="text-sm text-slate-600">{this.state.message}</p>
            <button type="button" onClick={this.handleReset} className="btn-primary w-full">
              Return to Home
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const STUDENT_MOBILE_NAV = [
  { to: '/student/dashboard', label: 'Home', icon: LayoutDashboard },
  { to: '/student/attendance', label: 'Attendance', icon: CalendarCheck },
  { to: '/student/fees', label: 'Fees', icon: CreditCard },
  { to: '/student/profile', label: 'Profile', icon: UserCircle },
];

const ADMIN_MOBILE_NAV = [
  { to: '/admin/dashboard', label: 'Home', icon: LayoutDashboard },
  { to: '/admin/students', label: 'Students', icon: Users },
  { to: '/admin/attendance', label: 'Attendance', icon: CalendarCheck },
  { to: '/admin/fees', label: 'Fees', icon: CreditCard },
];

const PortalLayout = ({ title }) => {
  const { role } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const mobileNav = role === 'admin' ? ADMIN_MOBILE_NAV : STUDENT_MOBILE_NAV;

  useEffect(() => {
    document.body.dataset.drawerOpen = sidebarOpen ? 'true' : 'false';
    return () => {
      document.body.dataset.drawerOpen = 'false';
    };
  }, [sidebarOpen]);

  useEffect(() => {
    const closeDrawer = () => setSidebarOpen(false);
    window.addEventListener('academyflow:close-drawer', closeDrawer);
    return () => window.removeEventListener('academyflow:close-drawer', closeDrawer);
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-1 flex-col min-w-0 pb-[calc(4rem+env(safe-area-inset-bottom,0px))] lg:pb-0">
        <Navbar title={title} onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-slate-200 bg-white lg:hidden safe-area-bottom">
        {mobileNav.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-2 text-[11px] font-medium transition ${
                  isActive ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800'
                }`
              }
            >
              <Icon className="h-5 w-5 mb-0.5" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};

const App = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <MobileBridge />
          <Routes>
            {/* Public Website Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/karate" element={<Karate />} />
            <Route path="/skating" element={<Skating />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />

            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-otp" element={<VerifyOTP />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Admin Portal Routes */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route element={<PortalLayout title="Admin Portal" />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/students" element={<Students />} />
                <Route path="/admin/students/add" element={<AddStudent />} />
                <Route path="/admin/students/edit/:id" element={<EditStudent />} />
                <Route path="/admin/enrollments" element={<AdminEnrollments />} />
                <Route path="/admin/attendance" element={<AdminAttendance />} />
                <Route path="/admin/fees" element={<AdminFees />} />
                <Route path="/admin/reports" element={<Reports />} />
                <Route path="/admin/profile" element={<AdminProfile />} />
              </Route>
            </Route>

            {/* Student Portal Routes */}
            <Route element={<ProtectedRoute allowedRoles={['student']} />}>
              <Route element={<PortalLayout title="Student Portal" />}>
                <Route path="/student/dashboard" element={<StudentDashboard />} />
                <Route path="/student/enrollment" element={<StudentEnrollment />} />
                <Route path="/student/attendance" element={<StudentAttendance />} />
                <Route path="/student/fees" element={<StudentFees />} />
                <Route path="/student/profile" element={<StudentProfile />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
