import React from 'react';
import { CreditCard, Calendar } from 'lucide-react';
import StatusBadge from './StatusBadge';
import { formatCurrency, formatLongDate, formatMonthLabel } from '../utils/helpers';

const FeeCard = ({ fee, title = 'Current Month Fee' }) => {
  if (!fee) {
    return (
      <div className="card-surface p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {title}
        </p>
        <p className="mt-3 text-sm text-slate-500">No fee record available.</p>
      </div>
    );
  }

  return (
    <div className="card-surface p-5 flex flex-col justify-between space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {title}
          </p>
          <p className="mt-1 text-sm font-semibold text-indigo-600">
            {formatMonthLabel(fee.month)}
          </p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
          <CreditCard className="h-5 w-5" />
        </div>
      </div>

      <div>
        <p className="text-xs text-slate-500">Amount</p>
        <div className="mt-1 flex items-center justify-between gap-2">
          <span className="text-3xl font-extrabold text-slate-900">
            {formatCurrency(fee.amount)}
          </span>
          <StatusBadge value={fee.status} uppercase />
        </div>
      </div>

      <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-xs">
        <span className="inline-flex items-center gap-1.5 text-slate-500">
          <Calendar className="h-3.5 w-3.5" />
          Payment Date
        </span>
        <span className="font-semibold text-slate-800">
          {fee.payment_date ? formatLongDate(fee.payment_date) : '—'}
        </span>
      </div>
    </div>
  );
};

export default FeeCard;
