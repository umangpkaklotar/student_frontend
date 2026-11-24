import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { MailCheck, Loader2, AlertCircle, RefreshCw, ShieldCheck } from 'lucide-react';
import { authService } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../utils/helpers';

const VerifyOTP = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useAuth();

  const email =
    location.state?.email || sessionStorage.getItem('pending_verify_email') || '';

  const [otp, setOtp] = useState('');
  const [resendCooldown, setResendCooldown] = useState(30);
  const [expirySeconds, setExpirySeconds] = useState(300);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!email) {
      navigate('/register', { replace: true });
    }
  }, [email, navigate]);

  useEffect(() => {
    if (resendCooldown <= 0) return undefined;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  useEffect(() => {
    if (expirySeconds <= 0) return undefined;
    const timer = setInterval(() => {
      setExpirySeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [expirySeconds]);

  const formatTimer = (sec) => {
    const mins = Math.floor(sec / 60);
    const rem = sec % 60;
    return `${mins}:${String(rem).padStart(2, '0')}`;
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    if (!/^\d{6}$/.test(otp.trim())) {
      setError('Please enter a valid 6-digit numeric OTP.');
      return;
    }

    setSubmitting(true);
    try {
      await authService.registerVerifyOtp({
        email,
        otp: otp.trim(),
      });
      sessionStorage.removeItem('pending_verify_email');
      showToast('Email verified successfully.');
      showToast('Registration completed successfully.');
      navigate('/login', {
        replace: true,
        state: { notice: 'Registration successful. Please login.' },
      });
    } catch (err) {
      setError(getErrorMessage(err, 'OTP verification failed.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setResending(true);
    try {
      await authService.registerSendOtp({
        email,
        resend: true,
      });
      setResendCooldown(30);
      setExpirySeconds(300);
      setOtp('');
      showToast('A new OTP has been sent to your email.');
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to resend OTP.'));
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 px-4 py-10 sm:px-6">
      <div className="mx-auto w-full max-w-md rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xl sm:p-8">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
          <MailCheck className="h-6 w-6" />
        </div>

        <h1 className="mt-4 text-center text-xl font-bold text-slate-900">
          Verify your email
        </h1>
        <p className="mt-1.5 text-center text-sm text-slate-600">
          OTP has been sent to:
        </p>
        <p className="mt-0.5 text-center text-sm font-semibold text-indigo-600 break-all">
          {email}
        </p>

        {error && (
          <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm text-rose-700">
            <AlertCircle className="h-4.5 w-4.5 shrink-0 text-rose-600 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleVerify} className="mt-6 space-y-5">
          <div>
            <label
              htmlFor="otp-input"
              className="block text-sm font-medium text-slate-700 mb-2 text-center"
            >
              Enter 6-digit OTP
            </label>
            <input
              id="otp-input"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              className="input-field text-center text-2xl font-extrabold tracking-[0.5em] py-3"
            />
          </div>

          <div className="rounded-xl bg-slate-50 px-4 py-3 text-center text-xs text-slate-600 space-y-1">
            <p>
              {resendCooldown > 0
                ? `Resend available in ${resendCooldown} seconds`
                : 'You can now request a new OTP'}
            </p>
            <p className="font-medium text-slate-700">
              OTP expires in 5 minutes{' '}
              <span className="text-indigo-600">({formatTimer(expirySeconds)})</span>
            </p>
          </div>

          <button
            type="submit"
            disabled={submitting || otp.length !== 6}
            className="btn-primary w-full py-2.5"
          >
            {submitting ? (
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
            onClick={handleResend}
            disabled={resendCooldown > 0 || resending}
            className="btn-secondary w-full py-2.5"
          >
            {resending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Resending...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                Resend OTP
              </>
            )}
          </button>
        </form>

        <div className="mt-6 border-t border-slate-100 pt-4 text-center text-xs text-slate-500">
          Wrong email?{' '}
          <Link to="/register" className="font-semibold text-indigo-600 hover:underline">
            Back to Registration
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;
