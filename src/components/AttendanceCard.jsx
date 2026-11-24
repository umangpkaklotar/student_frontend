import React from 'react';
import { CalendarCheck, UserCheck, UserX, Percent } from 'lucide-react';

const AttendanceCard = ({ summary }) => {
  const total = summary?.total_classes || 0;
  const present = summary?.present || 0;
  const absent = summary?.absent || 0;
  const percentage = summary?.attendance_percentage || 0;

  return (
    <div className="card-surface p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Attendance Summary
          </p>
          <p className="text-2xl font-extrabold text-slate-900 mt-0.5">
            {percentage}%
          </p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 ring-1 ring-inset ring-indigo-600/10">
          <Percent className="h-5 w-5" />
        </div>
      </div>

      <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-emerald-500 transition-all duration-300"
          style={{ width: `${Math.min(100, percentage)}%` }}
        />
      </div>

      <div className="grid grid-cols-3 gap-2 pt-1 text-center">
        <div className="rounded-lg bg-slate-50 p-2.5">
          <CalendarCheck className="mx-auto h-4 w-4 text-indigo-600" />
          <p className="mt-1 text-base font-bold text-slate-900">{total}</p>
          <p className="text-[11px] font-medium text-slate-500">Total Classes</p>
        </div>
        <div className="rounded-lg bg-emerald-50/70 p-2.5">
          <UserCheck className="mx-auto h-4 w-4 text-emerald-600" />
          <p className="mt-1 text-base font-bold text-emerald-700">{present}</p>
          <p className="text-[11px] font-medium text-emerald-700">Present</p>
        </div>
        <div className="rounded-lg bg-rose-50/70 p-2.5">
          <UserX className="mx-auto h-4 w-4 text-rose-600" />
          <p className="mt-1 text-base font-bold text-rose-700">{absent}</p>
          <p className="text-[11px] font-medium text-rose-700">Absent</p>
        </div>
      </div>
    </div>
  );
};

export default AttendanceCard;
