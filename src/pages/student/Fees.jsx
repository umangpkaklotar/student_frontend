import React, { useCallback, useEffect, useState } from 'react';
import { CreditCard, CheckCircle2, Clock } from 'lucide-react';
import { dashboardService } from '../../services/dashboardService';
import { feeService } from '../../services/feeService';
import StatCard from '../../components/StatCard';
import FeeTable from '../../components/FeeTable';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import {
  formatCurrency,
  formatDate,
  formatMonthLabel,
  getErrorMessage,
  getStatusBadgeClass,
} from '../../utils/helpers';

const StudentFees = () => {
  const [fees, setFees] = useState([]);
  const [currentMonthFee, setCurrentMonthFee] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchFees = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const dash = await dashboardService.getStudentDashboard();
      const res = await feeService.getByStudent(dash.student.id);
      setFees(res.fees || []);
      setCurrentMonthFee(res.current_month_fee || null);
      setSummary(res.summary || null);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load fee details.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFees();
  }, [fetchFees]);

  if (loading) return <LoadingSpinner label="Loading fee history..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchFees} />;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-slate-900">My Fees &amp; Payments</h2>
        <p className="text-sm text-slate-500">
          Review your current month fee status and full payment history.
        </p>
      </div>

      {currentMonthFee && (
        <div className="card-surface p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                Current Month Fee · {formatMonthLabel(currentMonthFee.month)}
              </p>
              <p className="mt-1 text-2xl font-extrabold text-slate-900">
                {formatCurrency(currentMonthFee.amount)}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Payment Date: {formatDate(currentMonthFee.payment_date)}
              </p>
            </div>
            <span
              className={`inline-flex self-start sm:self-center rounded-full px-3.5 py-1.5 text-xs font-bold capitalize ${getStatusBadgeClass(
                currentMonthFee.status
              )}`}
            >
              {currentMonthFee.status}
            </span>
          </div>
        </div>
      )}

      {summary && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            title="Total Paid"
            value={formatCurrency(summary.total_paid)}
            subtitle={`${summary.paid_months} month(s) paid`}
            icon={CheckCircle2}
            color="emerald"
          />
          <StatCard
            title="Total Pending"
            value={formatCurrency(summary.total_pending)}
            subtitle={`${summary.pending_months} month(s) pending`}
            icon={Clock}
            color="amber"
          />
          <StatCard
            title="Fee Records"
            value={fees.length}
            subtitle="All recorded months"
            icon={CreditCard}
            color="indigo"
          />
        </div>
      )}

      <div className="space-y-3">
        <h3 className="text-base font-bold text-slate-900">Payment History</h3>
        <FeeTable fees={fees} isAdmin={false} />
      </div>
    </div>
  );
};

export default StudentFees;
