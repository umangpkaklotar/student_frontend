import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Lock, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { authService } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../utils/helpers';

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useAuth();
  const [serverError, setServerError] = useState('');

  const resetToken =
    location.state?.resetToken || sessionStorage.getItem('password_reset_token') || '';

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      new_password: '',
      confirm_password: '',
    },
  });

  useEffect(() => {
    if (!resetToken) {
      navigate('/forgot-password', { replace: true });
    }
  }, [resetToken, navigate]);

  const newPasswordValue = watch('new_password');

  const onSubmit = async (values) => {
    setServerError('');
    try {
      await authService.resetPassword({
        reset_token: resetToken,
        new_password: values.new_password,
        confirm_password: values.confirm_password,
      });
      sessionStorage.removeItem('password_reset_token');
      showToast('Password reset successfully.');
      navigate('/login', {
        replace: true,
        state: { notice: 'Password reset successfully. Please login.' },
      });
    } catch (err) {
      setServerError(getErrorMessage(err, 'Unable to reset password.'));
    }
  };

  return (
    <div className="flex min-h-screen flex-col justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 px-4 py-10 sm:px-6 safe-area-top safe-area-bottom">
      <div className="mx-auto w-full max-w-md rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xl sm:p-8">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
          <Lock className="h-6 w-6" />
        </div>

        <h1 className="mt-4 text-center text-xl font-bold text-slate-900">
          Set New Password
        </h1>
        <p className="mt-1.5 text-center text-sm text-slate-500">
          Create a strong password (minimum 8 characters).
        </p>

        {serverError && (
          <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm text-rose-700">
            <AlertCircle className="h-4.5 w-4.5 shrink-0 text-rose-600 mt-0.5" />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              New Password
            </label>
            <input
              type="password"
              placeholder="Minimum 8 characters"
              className="input-field"
              {...register('new_password', {
                required: 'New password is required',
                minLength: {
                  value: 8,
                  message: 'Password must be at least 8 characters',
                },
              })}
            />
            {errors.new_password && (
              <p className="mt-1 text-xs text-rose-600">{errors.new_password.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Confirm Password
            </label>
            <input
              type="password"
              placeholder="Re-enter new password"
              className="input-field"
              {...register('confirm_password', {
                required: 'Please confirm your password',
                validate: (v) => v === newPasswordValue || 'Passwords do not match',
              })}
            />
            {errors.confirm_password && (
              <p className="mt-1 text-xs text-rose-600">
                {errors.confirm_password.message}
              </p>
            )}
          </div>

          <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-2.5">
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Reset Password
              </>
            )}
          </button>
        </form>

        <div className="mt-6 border-t border-slate-100 pt-4 text-center text-sm text-slate-600">
          <Link to="/login" className="font-semibold text-indigo-600 hover:underline">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
