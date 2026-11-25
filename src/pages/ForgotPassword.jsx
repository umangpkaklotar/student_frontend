import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { KeyRound, Mail, Loader2, AlertCircle, Send, ShieldCheck, RefreshCw } from 'lucide-react';
import { authService } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../utils/helpers';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { showToast } = useAuth();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    setLoading(true);
    try {
      const res = await authService.forgotPasswordSendOtp(email.trim());
      showToast(res.message);
      setStep(2);
      setCooldown(30);
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to send OTP.'));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    if (!/^\d{6}$/.test(otp.trim())) {
      setError('Enter the 6-digit OTP sent to your email.');
      return;
    }
    setLoading(true);
    try {
      const res = await authService.forgotPasswordVerifyOtp(email.trim(), otp.trim());
      sessionStorage.setItem('password_reset_token', res.reset_token);
      showToast('OTP verified. Set your new password.');
      navigate('/reset-password', {
        state: { resetToken: res.reset_token, email: email.trim() },
      });
    } catch (err) {
      setError(getErrorMessage(err, 'Invalid or expired OTP.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 px-4 py-10 sm:px-6 safe-area-top safe-area-bottom">
      <div className="mx-auto w-full max-w-md rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xl sm:p-8">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
          <KeyRound className="h-6 w-6" />
        </div>

        <h1 className="mt-4 text-center text-xl font-bold text-slate-900">
          Forgot Password
        </h1>
        <p className="mt-1.5 text-center text-sm text-slate-500">
          {step === 1
            ? 'Enter your registered email to receive a password reset OTP.'
            : `Enter the 6-digit OTP sent to ${email}`}
        </p>

        {error && (
          <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm text-rose-700">
            <AlertCircle className="h-4.5 w-4.5 shrink-0 text-rose-600 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleSendOtp} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-3 h-4.5 w-4.5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="rahul@gmail.com"
                  className="input-field pl-10"
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
              {loading ? (
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
        ) : (
          <form onSubmit={handleVerifyOtp} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5 text-center">
                Enter 6-digit OTP
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                className="input-field text-center text-2xl font-extrabold tracking-[0.5em] py-3"
              />
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="btn-primary w-full py-2.5"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" />
                  Verify OTP
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleSendOtp}
              disabled={cooldown > 0 || loading}
              className="btn-secondary w-full py-2.5"
            >
              <RefreshCw className="h-4 w-4" />
              {cooldown > 0 ? `Resend OTP in ${cooldown}s` : 'Resend OTP'}
            </button>
          </form>
        )}

        <div className="mt-6 border-t border-slate-100 pt-4 text-center text-sm text-slate-600">
          Remember your password?{' '}
          <Link to="/login" className="font-semibold text-indigo-600 hover:underline">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
