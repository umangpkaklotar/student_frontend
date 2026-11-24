import React from 'react';
import { formatClassLabel } from '../utils/helpers';

const STYLE_MAP = {
  present: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  paid: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  active: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  absent: 'bg-rose-50 text-rose-700 ring-rose-600/20',
  inactive: 'bg-rose-50 text-rose-700 ring-rose-600/20',
  pending: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  partial: 'bg-sky-50 text-sky-700 ring-sky-600/20',
  karate: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
  skating: 'bg-violet-50 text-violet-700 ring-violet-600/20',
};

const StatusBadge = ({ value, uppercase = false }) => {
  const key = (value || '').toLowerCase();
  const style = STYLE_MAP[key] || 'bg-slate-100 text-slate-700 ring-slate-500/20';
  const label =
    key === 'karate' || key === 'skating' ? formatClassLabel(key) : value || '—';

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${
        uppercase ? 'uppercase tracking-wide' : 'capitalize'
      } ${style}`}
    >
      {label}
    </span>
  );
};

export default StatusBadge;
