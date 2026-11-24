import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarCheck, UserCheck, UserX, Percent, AlertTriangle, RefreshCw } from 'lucide-react';
import { attendanceService } from '../../services/attendanceService';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatusBadge from '../../components/StatusBadge';
import {
  MONTH_OPTIONS,
  formatClassLabel,
  formatDate,
  getErrorMessage,
} from '../../utils/helpers';

const StudentAttendance = () => {
  const currentYear = String(new Date().getFullYear());
  const currentMonth = String(new Date().getMonth() + 1);

  const [month, setMonth] = useState(currentMonth);
  const [year, setYear] = useState(currentYear);
  const [enrolledClass, setEnrolledClass] = useState(null);
  const [hasLoadedClass, setHasLoadedClass] = useState(false);
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState({
    total_classes: 0,
    present: 0,
    absent: 0,
    attendance_percentage: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const yearOptions = [
    String(Number(currentYear) - 2),
    String(Number(currentYear) - 1),
    currentYear,
    String(Number(currentYear) + 1),
  ];

  const fetchAttendance = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (month) params.month = month;
      if (year) params.year = year;
      const res = await attendanceService.getMyAttendance(params);
      setEnrolledClass(res.student?.class_type || null);
      setHasLoadedClass(true);
      setRecords(res.records || []);
      setSummary(
        res.summary || {
          total_classes: 0,
          present: 0,
          absent: 0,
          attendance_percentage: 0,
        }
      );
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load attendance.'));
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">My Attendance</h2>
          <p className="text-sm text-slate-500">
            Read-only attendance records for your assigned class.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="input-field sm:w-40"
            aria-label="Filter by month"
          >
            <option value="">All Months</option>
            {MONTH_OPTIONS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>

          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="input-field sm:w-28"
            aria-label="Filter by year"
          >
            <option value="">All Years</option>
            {yearOptions.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Top 4 Summary Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <div className="card-surface p-4">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Total Classes</span>
            <CalendarCheck className="h-4 w-4 text-indigo-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{summary.total_classes}</p>
        </div>
        <div className="card-surface p-4">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Present</span>
            <UserCheck className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-emerald-700">{summary.present}</p>
        </div>
        <div className="card-surface p-4">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Absent</span>
            <UserX className="h-4 w-4 text-rose-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-rose-700">{summary.absent}</p>
        </div>
        <div className="card-surface p-4">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Attendance %</span>
            <Percent className="h-4 w-4 text-violet-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-indigo-700">
            {summary.attendance_percentage}%
          </p>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner label="Loading attendance records..." />
      ) : error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-sm">
            <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button type="button" onClick={fetchAttendance} className="btn-secondary text-xs py-1.5">
            <RefreshCw className="h-3.5 w-3.5" />
            Retry
          </button>
        </div>
      ) : hasLoadedClass && !enrolledClass ? (
        <div className="card-surface flex flex-col items-center justify-center px-6 py-12 text-center space-y-3">
          <CalendarCheck className="h-10 w-10 text-indigo-400" />
          <h3 className="text-sm font-semibold text-slate-900">
            No Active Class Enrollment
          </h3>
          <p className="text-sm text-slate-500 max-w-md">
            Once you complete your Karate or Skating enrollment and the Admin approves it, your class attendance will appear here.
          </p>
          <Link to="/student/enrollment" className="btn-primary text-xs">
            Go to Class Enrollment
          </Link>
        </div>
      ) : records.length === 0 ? (
        <div className="card-surface flex flex-col items-center justify-center px-6 py-12 text-center">
          <CalendarCheck className="h-10 w-10 text-slate-300" />
          <h3 className="mt-3 text-sm font-semibold text-slate-900">
            No attendance records found
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            No sessions recorded for the selected month/year filter.
          </p>
        </div>
      ) : (
        <>
          {/* Mobile Cards */}
          <div className="space-y-3 sm:hidden">
            {records.map((rec) => (
              <div
                key={rec.id}
                className="card-surface flex items-center justify-between p-4"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {formatDate(rec.date)}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {formatClassLabel(rec.class_type)}
                  </p>
                </div>
                <StatusBadge value={rec.status} />
              </div>
            ))}
          </div>

          {/* Desktop Table */}
          <div className="hidden sm:block card-surface overflow-hidden">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-5 py-3.5">Class</th>
                  <th className="px-5 py-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {records.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-5 py-3.5 font-medium text-slate-900">
                      {formatDate(rec.date)}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge value={rec.class_type} />
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge value={rec.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default StudentAttendance;
