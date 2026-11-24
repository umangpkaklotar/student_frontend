import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { Award, Loader2, AlertCircle, Send, Eye, EyeOff } from 'lucide-react';
import { authService } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../utils/helpers';

const Register = () => {
  const navigate = useNavigate();
  const { showToast } = useAuth();
  const [serverError, setServerError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      confirm_password: '',
      gender: 'Male',
      date_of_birth: '',
      address: '',
      class_type: 'karate',
    },
  });

  const passwordValue = watch('password');
  const selectedClass = watch('class_type');

  const onSubmit = async (values) => {
    setServerError('');
    try {
      const res = await authService.registerSendOtp({
        ...values,
        resend: false,
      });
      const email = res.email || values.email.trim().toLowerCase();
      sessionStorage.setItem('pending_verify_email', email);
      showToast('OTP sent successfully to your email.');
      navigate('/verify-otp', { state: { email } });
    } catch (err) {
      setServerError(getErrorMessage(err, 'Unable to send OTP. Please check your details.'));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <div className="text-center mb-8">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500 text-white shadow-lg shadow-indigo-500/30">
            <Award className="h-7 w-7" />
          </div>
          <h1 className="mt-4 text-2xl font-extrabold text-white">
            Student Registration
          </h1>
          <p className="mt-1 text-sm text-slate-300">
            Complete your details to receive an email OTP verification code.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xl sm:p-8">
          {serverError && (
            <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              <AlertCircle className="h-4.5 w-4.5 shrink-0 text-rose-600 mt-0.5" />
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  placeholder="Rahul Patel"
                  className="input-field"
                  {...register('name', {
                    required: 'Full name is required',
                    minLength: { value: 2, message: 'Minimum 2 characters' },
                  })}
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-rose-600">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Email *
                </label>
                <input
                  type="email"
                  placeholder="rahul@gmail.com"
                  className="input-field"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Enter a valid email address',
                    },
                  })}
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-rose-600">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  placeholder="9876543210"
                  className="input-field"
                  {...register('phone', {
                    required: 'Mobile number is required',
                    pattern: {
                      value: /^(\+91[\s-]?)?[6-9]\d{9}$/,
                      message: 'Enter a valid 10-digit Indian mobile number',
                    },
                  })}
                />
                {errors.phone && (
                  <p className="mt-1 text-xs text-rose-600">{errors.phone.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Gender *
                </label>
                <select className="input-field" {...register('gender', { required: true })}>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Minimum 8 characters"
                    className="input-field pr-10"
                    {...register('password', {
                      required: 'Password is required',
                      minLength: {
                        value: 8,
                        message: 'Password must be at least 8 characters',
                      },
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4.5 w-4.5" />
                    ) : (
                      <Eye className="h-4.5 w-4.5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs text-rose-600">{errors.password.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  placeholder="Re-enter password"
                  className="input-field"
                  {...register('confirm_password', {
                    required: 'Please confirm your password',
                    validate: (val) =>
                      val === passwordValue || 'Passwords do not match',
                  })}
                />
                {errors.confirm_password && (
                  <p className="mt-1 text-xs text-rose-600">
                    {errors.confirm_password.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Date of Birth *
                </label>
                <input
                  type="date"
                  className="input-field"
                  {...register('date_of_birth', {
                    required: 'Date of birth is required',
                  })}
                />
                {errors.date_of_birth && (
                  <p className="mt-1 text-xs text-rose-600">
                    {errors.date_of_birth.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Class Type *
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {['karate', 'skating'].map((cls) => (
                    <button
                      key={cls}
                      type="button"
                      onClick={() => setValue('class_type', cls, { shouldValidate: true })}
                      className={`rounded-lg border px-4 py-2.5 text-sm font-semibold capitalize transition ${
                        selectedClass === cls
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-600'
                          : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {cls}
                    </button>
                  ))}
                </div>
                <input
                  type="hidden"
                  {...register('class_type', { required: 'Class type is required' })}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Address *
                </label>
                <textarea
                  rows={2}
                  placeholder="Enter your residential address"
                  className="input-field"
                  {...register('address', {
                    required: 'Address is required',
                    minLength: { value: 3, message: 'Minimum 3 characters' },
                  })}
                />
                {errors.address && (
                  <p className="mt-1 text-xs text-rose-600">{errors.address.message}</p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full py-2.5"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending OTP...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Send OTP
                </>
              )}
            </button>
          </form>

          <div className="mt-6 border-t border-slate-100 pt-5 text-center text-sm text-slate-600">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold text-indigo-600 hover:text-indigo-500"
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
