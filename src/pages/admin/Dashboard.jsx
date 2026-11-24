import React, { useCallback, useEffect, useState } from 'react';
import {
  Users,
  Award,
  Wind,
  UserCheck,
  UserX,
  Clock,
  CheckCircle2,
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
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { dashboardService } from '../../services/dashboardService';
import StatCard from '../../components/StatCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import { formatCurrency, formatShortMonthLabel, getErrorMessage } from '../../utils/helpers';

const CLASS_COLORS = ['#4f46e5', '#8b5cf6'];
const FEE_COLORS = ['#10b981', '#f59e0b'];

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await dashboardService.getAdminDashboard();
      setData(res);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load admin dashboard.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (loading) return <LoadingSpinner label="Loading dashboard metrics..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchDashboard} />;
  if (!data) return null;

  const { cards, charts, current_month: currentMonth } = data;

  const monthlyAttendanceData = (charts.monthly_attendance || []).map((item) => ({
    ...item,
    label: formatShortMonthLabel(item.month),
  }));

  const monthlyFeeData = (charts.monthly_fee_collection || []).map((item) => ({
    ...item,
    label: formatShortMonthLabel(item.month),
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Students"
          value={cards.total_students}
          subtitle={`${cards.active_students} active enrolled`}
          icon={Users}
          color="indigo"
        />
        <StatCard
          title="Karate Students"
          value={cards.karate_students}
          subtitle="Active Karate batch"
          icon={Award}
          color="sky"
        />
        <StatCard
          title="Skating Students"
          value={cards.skating_students}
          subtitle="Active Skating batch"
          icon={Wind}
          color="violet"
        />
        <StatCard
          title="Present Today"
          value={cards.present_today}
          subtitle="Marked for today"
          icon={UserCheck}
          color="emerald"
        />
        <StatCard
          title="Absent Today"
          value={cards.absent_today}
          subtitle="Marked absent today"
          icon={UserX}
          color="rose"
        />
        <StatCard
          title="Pending Fees"
          value={formatCurrency(cards.pending_fees_amount)}
          subtitle={`${cards.pending_fees_count} student(s) · ${formatShortMonthLabel(currentMonth)}`}
          icon={Clock}
          color="amber"
        />
        <StatCard
          title="Paid Fees"
          value={formatCurrency(cards.paid_fees_amount)}
          subtitle={`${cards.paid_fees_count} student(s) · ${formatShortMonthLabel(currentMonth)}`}
          icon={CheckCircle2}
          color="emerald"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card-surface p-5">
          <div className="mb-4">
            <h2 className="text-base font-bold text-slate-900">Monthly Attendance</h2>
            <p className="text-xs text-slate-500">Present vs Absent sessions (last 6 months)</p>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyAttendanceData}>
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

        <div className="card-surface p-5">
          <div className="mb-4">
            <h2 className="text-base font-bold text-slate-900">Karate vs Skating Students</h2>
            <p className="text-xs text-slate-500">Active student enrollment by class</p>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.class_distribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={4}
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {charts.class_distribution.map((entry, idx) => (
                    <Cell key={entry.name} fill={CLASS_COLORS[idx % CLASS_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card-surface p-5">
          <div className="mb-4">
            <h2 className="text-base font-bold text-slate-900">Monthly Fee Collection</h2>
            <p className="text-xs text-slate-500">Collected vs pending fee amounts (last 6 months)</p>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyFeeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip formatter={(val) => formatCurrency(val)} />
                <Legend />
                <Bar dataKey="paid" name="Paid" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pending" name="Pending" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card-surface p-5">
          <div className="mb-4">
            <h2 className="text-base font-bold text-slate-900">Pending vs Paid Fees</h2>
            <p className="text-xs text-slate-500">
              Current month ({formatShortMonthLabel(currentMonth)}) collection split
            </p>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.fee_status_breakdown}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={4}
                  label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
                >
                  {charts.fee_status_breakdown.map((entry, idx) => (
                    <Cell key={entry.name} fill={FEE_COLORS[idx % FEE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(val) => formatCurrency(val)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
