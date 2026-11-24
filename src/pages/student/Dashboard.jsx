import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Award,
  ArrowRight,
  AlertTriangle,
  RefreshCw,
  Clock,
  XCircle,
  Sparkles,
} from 'lucide-react';
import { attendanceService } from '../../services/attendanceService';
import { feeService } from '../../services/feeService';
import { enrollmentService } from '../../services/enrollmentService';
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
  const [enrollmentInfo, setEnrollmentInfo] = useState(null);
  const [attData, setAttData] = useState(null);
  const [feeData, setFeeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const enrRes = await enrollmentService.getMyEnrollment();
      setEnrollmentInfo(enrRes);

      const isActive =
        enrRes.has_active_class || Boolean(enrRes.student?.class_type);

      if (isActive) {
        const [attRes, feeRes] = await Promise.all([
          attendanceService.getMyAttendanceSummary(),
          feeService.getMyFees(),
        ]);
        setAttData(attRes);
        setFeeData(feeRes);
      } else {
        setAttData(null);
        setFeeData(null);
      }
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

  const student = enrollmentInfo?.student;
  const enrollment = enrollmentInfo?.enrollment;
  const isActive =
    enrollmentInfo?.has_active_class || Boolean(student?.class_type);

  if (!student) return null;

  const overallSummary = attData?.overall || {};
  const recentAttendance = attData?.recent_attendance || [];
  const currentFee = feeData?.current_month_fee || null;
  const recentFees = (feeData?.fees || []).slice(0, 5);

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
              Class:{' '}
              <span className="font-semibold text-white">
                {student.class_type
                  ? formatClassLabel(student.class_type)
                  : enrollment
                  ? `${formatClassLabel(enrollment.class_type)} (${enrollment.status})`
                  : 'Not Enrolled'}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            {student.class_type && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3.5 py-1.5 text-xs font-semibold text-white">
                <Award className="h-4 w-4" />
                {formatClassLabel(student.class_type)}
              </span>
            )}
            <span className="inline-flex items-center rounded-full bg-white/15 px-3.5 py-1.5 text-xs font-semibold capitalize text-white">
              {enrollment ? enrollment.status : isActive ? 'active' : 'not enrolled'}
            </span>
          </div>
        </div>
      </div>

      {/* Case 1: Student has NOT enrolled yet */}
      {!isActive && !enrollment && (
        <div className="card-surface p-6 sm:p-8 border-indigo-200 bg-gradient-to-br from-white to-indigo-50/40">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
                <Sparkles className="h-3.5 w-3.5" />
                Next Step
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                Complete Your Class Enrollment
              </h3>
              <p className="text-sm text-slate-600">
                You have not enrolled in a Karate or Skating class yet.
              </p>
            </div>
            <Link to="/student/enrollment" className="btn-primary self-start sm:self-center">
              Choose Class <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}

      {/* Case 2: Enrollment is Pending or Rejected */}
      {!isActive && enrollment && (
        <div className="card-surface p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                  enrollment.status === 'rejected'
                    ? 'bg-rose-50 text-rose-600'
                    : 'bg-amber-50 text-amber-600'
                }`}
              >
                {enrollment.status === 'rejected' ? (
                  <XCircle className="h-6 w-6" />
                ) : (
                  <Clock className="h-6 w-6" />
                )}
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Class: {formatClassLabel(enrollment.class_type)}
                </p>
                <h3 className="text-base font-bold text-slate-900">
                  {enrollment.status === 'rejected'
                    ? 'Class Enrollment Rejected'
                    : 'Class Enrollment Pending Approval'}
                </h3>
              </div>
            </div>
            <StatusBadge value={enrollment.status} uppercase />
          </div>

          <p className="text-sm text-slate-600">
            {enrollment.status === 'rejected'
              ? `Your enrollment request was rejected${
                  enrollment.rejection_reason ? ` (${enrollment.rejection_reason})` : ''
                }. You can update and resubmit your enrollment form.`
              : `Your ${formatClassLabel(
                  enrollment.class_type
                )} enrollment has been submitted and is waiting for Admin approval. Attendance and monthly fees will become available once approved.`}
          </p>

          <div>
            <Link to="/student/enrollment" className="btn-secondary text-xs">
              {enrollment.status === 'rejected'
                ? 'Update & Resubmit Enrollment'
                : 'View Enrollment Details'}
            </Link>
          </div>
        </div>
      )}

      {/* Case 3: Active Class Enrollment -> Show Attendance, Fees, Profile */}
      {isActive ? (
        <>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            <AttendanceCard summary={overallSummary} />
            <FeeCard fee={currentFee} title="Current Month Fee" />
            <ProfileCard student={student} />
          </div>

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
                          {fee.payment_date
                            ? `Paid on ${formatDate(fee.payment_date)}`
                            : 'Payment pending'}
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
        </>
      ) : (
        <div className="max-w-md">
          <ProfileCard student={student} />
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
