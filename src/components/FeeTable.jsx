import React from 'react';
import { CreditCard, CheckCircle2, Edit3 } from 'lucide-react';
import {
  formatClassLabel,
  formatCurrency,
  formatDate,
  formatMonthLabel,
  getStatusBadgeClass,
} from '../utils/helpers';

const FeeTable = ({
  fees,
  isAdmin = false,
  onMarkPaid,
  onEdit,
}) => {
  if (!fees || fees.length === 0) {
    return (
      <div className="card-surface flex flex-col items-center justify-center px-6 py-12 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
          <CreditCard className="h-6 w-6" />
        </div>
        <h3 className="mt-3 text-sm font-semibold text-slate-900">No fee records found</h3>
        <p className="mt-1 text-sm text-slate-500">
          Monthly fee records matching your filter will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="card-surface overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <tr>
              {isAdmin && (
                <>
                  <th className="px-4 py-3.5">Student ID</th>
                  <th className="px-4 py-3.5">Student Name</th>
                  <th className="px-4 py-3.5">Class</th>
                </>
              )}
              <th className="px-4 py-3.5">Month</th>
              <th className="px-4 py-3.5">Amount</th>
              <th className="px-4 py-3.5">Status</th>
              <th className="px-4 py-3.5">Payment Date</th>
              <th className="px-4 py-3.5">Method</th>
              <th className="px-4 py-3.5">Notes</th>
              {isAdmin && <th className="px-4 py-3.5 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {fees.map((fee) => (
              <tr
                key={fee.id || `${fee.student_id}-${fee.month}`}
                className="hover:bg-slate-50/80 transition"
              >
                {isAdmin && (
                  <>
                    <td className="whitespace-nowrap px-4 py-3.5 font-semibold text-indigo-600">
                      {fee.student_code}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 font-medium text-slate-900">
                      {fee.student_name}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusBadgeClass(
                          fee.class_type
                        )}`}
                      >
                        {formatClassLabel(fee.class_type)}
                      </span>
                    </td>
                  </>
                )}
                <td className="whitespace-nowrap px-4 py-3.5 font-medium text-slate-900">
                  {formatMonthLabel(fee.month)}
                </td>
                <td className="whitespace-nowrap px-4 py-3.5 font-semibold text-slate-900">
                  {formatCurrency(fee.amount)}
                </td>
                <td className="whitespace-nowrap px-4 py-3.5">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${getStatusBadgeClass(
                      fee.status
                    )}`}
                  >
                    {fee.status}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-3.5 text-slate-600">
                  {formatDate(fee.payment_date)}
                </td>
                <td className="whitespace-nowrap px-4 py-3.5 text-slate-600">
                  {fee.payment_method || '—'}
                </td>
                <td className="max-w-[180px] truncate px-4 py-3.5 text-slate-500">
                  {fee.notes || '—'}
                </td>
                {isAdmin && (
                  <td className="whitespace-nowrap px-4 py-3.5 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      {fee.status !== 'paid' && onMarkPaid && (
                        <button
                          type="button"
                          onClick={() => onMarkPaid(fee)}
                          className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Mark Paid
                        </button>
                      )}
                      {onEdit && (
                        <button
                          type="button"
                          onClick={() => onEdit(fee)}
                          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-indigo-600"
                          title="Update fee"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FeeTable;
