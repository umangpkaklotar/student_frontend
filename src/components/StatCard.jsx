import React from 'react';

const COLOR_MAP = {
  indigo: 'bg-indigo-50 text-indigo-600 ring-indigo-600/10',
  emerald: 'bg-emerald-50 text-emerald-600 ring-emerald-600/10',
  amber: 'bg-amber-50 text-amber-600 ring-amber-600/10',
  rose: 'bg-rose-50 text-rose-600 ring-rose-600/10',
  violet: 'bg-violet-50 text-violet-600 ring-violet-600/10',
  sky: 'bg-sky-50 text-sky-600 ring-sky-600/10',
};

const StatCard = ({ title, value, subtitle, icon: Icon, color = 'indigo' }) => {
  const iconStyle = COLOR_MAP[color] || COLOR_MAP.indigo;

  return (
    <div className="card-surface p-5 transition hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {title}
          </p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900 truncate">
            {value}
          </p>
          {subtitle && (
            <p className="mt-1 text-xs font-medium text-slate-500 truncate">{subtitle}</p>
          )}
        </div>
        {Icon && (
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset ${iconStyle}`}
          >
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;

