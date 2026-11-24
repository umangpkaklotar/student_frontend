import React from 'react';
import { CalendarCheck } from 'lucide-react';
import { formatClassLabel, formatDate, getStatusBadgeClass } from '../utils/helpers';

const AttendanceTable = ({ records, showStudentColumns = false }) => {
  if (!records || records.length === 0) {
    return (
      <div className="card-surface flex flex-col items-center justify-center px-6 py-12 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
          <CalendarCheck className="h-6 w-6" />
        </div>
        <h3 className="mt-3 text-sm font-semibold text-slate-900">
          No attendance records
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          Attendance records will appear here once marked.
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
              <th className="px-4 py-3.5">Date</th>
              {showStudentColumns && (
                <>
                  <th className="px-4 py-3.5">Student ID</th>
                  <th className="px-4 py-3.5">Student Name</th>
                </>
              )}
              <th className="px-4 py-3.5">Class</th>
              <th className="px-4 py-3.5">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {records.map((rec) => (
              <tr key={rec.id} className="hover:bg-slate-50/80 transition">
                <td className="whitespace-nowrap px-4 py-3.5 font-medium text-slate-900">
                  {formatDate(rec.date)}
                </td>
                {showStudentColumns && (
                  <>
                    <td className="whitespace-nowrap px-4 py-3.5 font-semibold text-indigo-600">
                      {rec.student_code || '—'}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-slate-800">
                      {rec.student_name || '—'}
                    </td>
                  </>
                )}
                <td className="whitespace-nowrap px-4 py-3.5">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusBadgeClass(
                      rec.class_type
                    )}`}
                  >
                    {formatClassLabel(rec.class_type)}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-3.5">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${getStatusBadgeClass(
                      rec.status
                    )}`}
                  >
                    {rec.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendanceTable;
