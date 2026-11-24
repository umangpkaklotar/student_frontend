import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Award, ArrowRight, AlertTriangle, RefreshCw } from 'lucide-react';
import { attendanceService } from '../../services/attendanceService';
import { feeService } from '../../services/feeService';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatusBadge from '../../components/StatusBadge';
import AttendanceCard from '../../components/AttendanceCard';
import FeeCard from '../../components/FeeCard';
import ProfileCard from '../../components/ProfileCard';
import {
  formatClassLabel,
  formatCurrency,
  formatDate,
  formatMonthLabel,
  getErrorMessage,
} from '../../utils/helpers';

const StudentDashboard = () => {
  const [attData, setAttData] = useState(null);
  const [feeData, setFeeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [attRes, feeRes] = await Promise.all([
        attendanceService.getMyAttendanceSummary(),
        feeService.getMyFees(),
      ]);
      setAttData(attRes);
      setFeeData(feeRes);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load dashboard.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  if (loading) return <LoadingSpinner label="Loading your dashboard..." />;

  if (error) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-800 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 text-sm">
          <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
        <button type="button" onClick={loadDashboard} className="btn-secondary text-xs py-1.5">
          <RefreshCw className="h-3.5 w-3.5" />
          Retry
        </button>
      </div>
    );
  }

  const student = attData?.student || feeData?.student;
  const overallSummary = attData?.overall || {};
  const recentAttendance = attData?.recent_attendance || [];
  const currentFee = feeData?.current_month_fee || null;
  const recentFees = (feeData?.fees || []).slice(0, 5);

  if (!student) return null;

  return (
    <div className="space-y-6">
      {/* Header Welcome Card */}
      <div className="rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 p-5 sm:p-6 text-white shadow-md">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-100">
              Welcome,
            </p>
            <h2 className="mt-0.5 text-2xl font-bold">{student.name}</h2>
            <p className="mt-1 text-sm text-indigo-100">
              Student ID: <span className="font-semibold text-white">{student.student_id}</span>
              {' · '}
              Class: <span className="font-semibold text-white">{formatClassLabel(student.class_type)}</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3.5 py-1.5 text-xs font-semibold text-white">
              <Award className="h-4 w-4" />
              {formatClassLabel(student.class_type)}
            </span>
          </div>
        </div>
      </div>

      {/* Primary Cards: Attendance, Current Month Fee, Profile */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        <AttendanceCard summary={overallSummary} />
        <FeeCard fee={currentFee} title="Current Month Fee" />
        <ProfileCard student={student} />
      </div>

      {/* Recent Attendance & Recent Fee History */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card-surface overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <h3 className="text-base font-bold text-slate-900">Recent Attendance</h3>
            <Link
              to="/student/attendance"
              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-500"
            >
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {recentAttendance.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-slate-500">
              No attendance records marked yet.
            </p>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentAttendance.map((rec) => (
                <div
                  key={rec.id}
                  className="flex items-center justify-between px-5 py-3.5 text-sm"
                >
                  <div>
                    <p className="font-semibold text-slate-900">{formatDate(rec.date)}</p>
                    <p className="text-xs text-slate-500">
                      {formatClassLabel(rec.class_type)}
                    </p>
                  </div>
                  <StatusBadge value={rec.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card-surface overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <h3 className="text-base font-bold text-slate-900">Recent Fee History</h3>
            <Link
              to="/student/fees"
              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-500"
            >
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {recentFees.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-slate-500">
              No fee history available yet.
            </p>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentFees.map((fee) => (
                <div
                  key={fee.id || `${fee.student_id}-${fee.month}`}
                  className="flex items-center justify-between px-5 py-3.5 text-sm"
                >
                  <div>
                    <p className="font-semibold text-slate-900">
                      {formatMonthLabel(fee.month)}
                    </p>
                    <p className="text-xs text-slate-500">
                      {fee.payment_date ? `Paid on ${formatDate(fee.payment_date)}` : 'Payment pending'}
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="font-bold text-slate-900">{formatCurrency(fee.amount)}</p>
                    <StatusBadge value={fee.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
