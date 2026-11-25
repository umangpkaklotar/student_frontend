import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CreditCard, AlertTriangle, RefreshCw } from 'lucide-react';
import { feeService } from '../../services/feeService';
import LoadingSpinner from '../../components/LoadingSpinner';
import FeeCard from '../../components/FeeCard';
import StatusBadge from '../../components/StatusBadge';
import {
  formatCurrency,
  formatDate,
  formatMonthLabel,
  getErrorMessage,
} from '../../utils/helpers';

const StudentFees = () => {
  const [student, setStudent] = useState(null);
  const [currentFee, setCurrentFee] = useState(null);
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchFees = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await feeService.getMyFees();
      setStudent(res.student || null);
      setCurrentFee(res.current_month_fee || null);
      setFees(res.fees || []);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load fee information.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFees();
  }, [fetchFees]);

  if (loading) return <LoadingSpinner label="Loading fee details..." />;

  if (error) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-800 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 text-sm">
          <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
        <button type="button" onClick={fetchFees} className="btn-secondary text-xs py-1.5">
          <RefreshCw className="h-3.5 w-3.5" />
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Fees &amp; Payment History</h2>
        <p className="text-sm text-slate-500">
          Read-only view of your monthly fee status and payment receipts.
        </p>
      </div>

      {student && !student.class_type ? (
        <div className="card-surface flex flex-col items-center justify-center px-6 py-12 text-center space-y-3">
          <CreditCard className="h-10 w-10 text-indigo-400" />
          <h3 className="text-sm font-semibold text-slate-900">
            No Active Class Enrollment
          </h3>
          <p className="text-sm text-slate-500 max-w-md">
            Monthly fees apply once your Karate or Skating class enrollment is approved by the Admin.
          </p>
          <Link to="/student/enrollment" className="btn-primary text-xs">
            Go to Class Enrollment
          </Link>
        </div>
      ) : (
        <>
          <div className="max-w-lg">
            <FeeCard fee={currentFee} title="Current Month Fee" />
          </div>

          {/* Payment History */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-slate-900">Payment History</h3>

            {fees.length === 0 ? (
              <div className="card-surface flex flex-col items-center justify-center px-6 py-12 text-center">
                <CreditCard className="h-10 w-10 text-slate-300" />
                <h4 className="mt-3 text-sm font-semibold text-slate-900">No fee records yet</h4>
                <p className="mt-1 text-sm text-slate-500">
                  Your monthly fee records will appear here.
                </p>
              </div>
            ) : (
              <>
                {/* Mobile Cards */}
                <div className="space-y-3 sm:hidden">
                  {fees.map((fee) => (
                    <div
                      key={fee.id || `${fee.student_id}-${fee.month}`}
                      className="card-surface p-4 flex items-center justify-between"
                    >
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {formatMonthLabel(fee.month)}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Payment Date: {fee.payment_date ? formatDate(fee.payment_date) : '—'}
                        </p>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="text-sm font-bold text-slate-900">
                          {formatCurrency(fee.amount)}
                        </p>
                        <StatusBadge value={fee.status} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop Table */}
                <div className="hidden sm:block card-surface overflow-hidden">
                  <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                    <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      <tr>
                        <th className="px-5 py-3.5">Month</th>
                        <th className="px-5 py-3.5">Amount</th>
                        <th className="px-5 py-3.5">Status</th>
                        <th className="px-5 py-3.5">Payment Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {fees.map((fee) => (
                        <tr
                          key={fee.id || `${fee.student_id}-${fee.month}`}
                          className="hover:bg-slate-50/80 transition"
                        >
                          <td className="px-5 py-3.5 font-medium text-slate-900">
                            {formatMonthLabel(fee.month)}
                          </td>
                          <td className="px-5 py-3.5 font-semibold text-slate-900">
                            {formatCurrency(fee.amount)}
                          </td>
                          <td className="px-5 py-3.5">
                            <StatusBadge value={fee.status} />
                          </td>
                          <td className="px-5 py-3.5 text-slate-600">
                            {fee.payment_date ? formatDate(fee.payment_date) : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default StudentFees;
