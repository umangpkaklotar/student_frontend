import React, { useCallback, useEffect, useState } from 'react';
import {
  CalendarCheck,
  UserCheck,
  UserX,
  Percent,
  CreditCard,
  Award,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { dashboardService } from '../../services/dashboardService';
import StatCard from '../../components/StatCard';
import AttendanceTable from '../../components/AttendanceTable';
import FeeTable from '../../components/FeeTable';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import {
  formatClassLabel,
  formatCurrency,
  formatDate,
  formatMonthLabel,
  getErrorMessage,
  getStatusBadgeClass,
} from '../../utils/helpers';

const StudentDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await dashboardService.getStudentDashboard();
      setData(res);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load student dashboard.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (loading) return <LoadingSpinner label="Loading your dashboard..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchDashboard} />;
  if (!data) return null;

  const {
    student,
    current_month: currentMonth,
    current_month_attendance: monthAtt,
    current_month_fee: monthFee,
    recent_attendance: recentAttendance,
    recent_payments: recentPayments,
    monthly_attendance_chart: attChart,
  } = data;

  const chartData = (attChart || []).map((item) => ({
    ...item,
    label: formatMonthLabel(item.month),
  }));

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 p-6 text-white shadow-md">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-100">
              Welcome Back
            </p>
            <h2 className="mt-1 text-2xl font-bold">{student.name}</h2>
            <p className="mt-1 text-sm text-indigo-100">
              Student ID: <span className="font-semibold text-white">{student.student_id}</span>
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3.5 py-1.5 text-xs font-semibold text-white backdrop-blur-xs">
              <Award className="h-4 w-4" />
              {formatClassLabel(student.class_type)} Class
            </span>
            <span className="inline-flex items-center rounded-full bg-white/15 px-3.5 py-1.5 text-xs font-semibold capitalize text-white">
              {student.status}
            </span>
          </div>
        </div>
      </div>

      {/* Current Month Attendance & Fee Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Classes This Month"
          value={monthAtt.total_classes}
          subtitle={formatMonthLabel(currentMonth)}
          icon={CalendarCheck}
          color="indigo"
        />
        <StatCard
          title="Present Days"
          value={monthAtt.present}
          subtitle={formatMonthLabel(currentMonth)}
          icon={UserCheck}
          color="emerald"
        />
        <StatCard
          title="Absent Days"
          value={monthAtt.absent}
          subtitle={formatMonthLabel(currentMonth)}
          icon={UserX}
          color="rose"
        />
        <StatCard
          title="Attendance %"
          value={`${monthAtt.attendance_percentage}%`}
          subtitle={`${monthAtt.present}/${monthAtt.total_classes} classes`}
          icon={Percent}
          color="violet"
        />
      </div>

      {/* Current Month Fee & Attendance Chart */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="card-surface p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Current Month Fee</h3>
              <CreditCard className="h-5 w-5 text-indigo-600" />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Billing month: {formatMonthLabel(currentMonth)}
            </p>

            {monthFee ? (
              <div className="mt-5 space-y-4">
                <div>
                  <p className="text-xs text-slate-500">Amount</p>
                  <p className="text-3xl font-extrabold text-slate-900 mt-0.5">
                    {formatCurrency(monthFee.amount)}
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-sm">
                  <span className="text-slate-500">Status</span>
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${getStatusBadgeClass(
                      monthFee.status
                    )}`}
                  >
                    {monthFee.status}
                  </span>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-sm">
                  <span className="text-slate-500">Payment Date</span>
                  <span className="font-medium text-slate-800">
                    {formatDate(monthFee.payment_date)}
                  </span>
                </div>
              </div>
            ) : (
              <p className="mt-6 text-sm text-slate-500">No fee record for this month.</p>
            )}
          </div>
        </div>

        <div className="card-surface p-5 lg:col-span-2">
          <div className="mb-4">
            <h3 className="text-base font-bold text-slate-900">Monthly Attendance Trend</h3>
            <p className="text-xs text-slate-500">Your attendance over the last 6 months</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="present" name="Present" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="absent" name="Absent" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Attendance & Recent Payments */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <h3 className="text-base font-bold text-slate-900">Recent Attendance</h3>
          <AttendanceTable records={recentAttendance} />
        </div>
        <div className="space-y-3">
          <h3 className="text-base font-bold text-slate-900">Recent Payments</h3>
          <FeeTable fees={recentPayments} isAdmin={false} />
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
