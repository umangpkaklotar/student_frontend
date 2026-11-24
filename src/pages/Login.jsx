import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Award,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { getErrorMessage } from '../utils/helpers';

const Login = () => {
  const { login, logout, isAuthenticated, role, loading, showToast } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [serverError, setServerError] = useState('');
  const noticeMessage = location.state?.notice || '';
  const redirectParam = searchParams.get('redirect');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    if (loading) return;
    if (isAuthenticated) {
      if (role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else if (role === 'student') {
        navigate(redirectParam || '/student/dashboard', { replace: true });
      } else {
        logout();
      }
    }
  }, [loading, isAuthenticated, role, navigate, logout, redirectParam]);

  const onSubmit = async (values) => {
    setServerError('');
    try {
      const data = await login(values.email, values.password, rememberMe);
      showToast(`Welcome back, ${data.user.name}!`);
      if (data.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else if (data.role === 'student') {
        navigate(redirectParam || '/student/dashboard', { replace: true });
      } else {
        logout();
        setServerError('Unknown account role.');
      }
    } catch (err) {
      setServerError(getErrorMessage(err, 'Invalid email or password.'));
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen label="Checking session..." />;
  }

  return (
    <div className="flex min-h-screen flex-col justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 px-4 py-10 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="mb-4">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-200 hover:text-white transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Home
          </Link>
        </div>

        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500 text-white shadow-lg shadow-indigo-500/30">
          <Award className="h-8 w-8" />
        </div>
        <h1 className="mt-5 text-center text-2xl font-extrabold tracking-tight text-white">
          Student Attendance System
        </h1>
        <p className="mt-1.5 text-center text-sm text-slate-300">
          Karate &amp; Skating Academy · Admin &amp; Student Login
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="rounded-2xl border border-slate-200/80 bg-white px-6 py-8 shadow-2xl sm:px-9">
          <h2 className="text-lg font-bold text-slate-900 mb-1">Sign in to your account</h2>
          <p className="text-xs text-slate-500 mb-6">
            Enter your Admin or Student credentials to continue.
          </p>

          {noticeMessage && (
            <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-3 text-sm text-emerald-800">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 mt-0.5" />
              <span>{noticeMessage}</span>
            </div>
          )}

          {serverError && (
            <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm text-rose-700">
              <AlertCircle className="h-5 w-5 shrink-0 text-rose-600 mt-0.5" />
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                Email
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="name@example.com"
                  className="input-field pl-10"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Enter a valid email address',
                    },
                  })}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs font-medium text-rose-600">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-slate-700"
                >
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-500"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  className="input-field pl-10 pr-10"
                  {...register('password', {
                    required: 'Password is required',
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-2.5 rounded p-0.5 text-slate-400 hover:text-slate-600"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs font-medium text-rose-600">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <label className="inline-flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span>Remember me</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full py-2.5"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                'Login'
              )}
            </button>
          </form>

          <div className="mt-6 border-t border-slate-100 pt-5 text-center text-sm text-slate-600">
            Don&apos;t have an account?{' '}
            <Link
              to="/register"
              className="font-semibold text-indigo-600 hover:text-indigo-500"
            >
              Register
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
