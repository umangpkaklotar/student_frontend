import React from 'react';
import { Eye, Edit, UserX, UserCheck, Trash2, Users } from 'lucide-react';
import {
  formatClassLabel,
  formatCurrency,
  getStatusBadgeClass,
} from '../utils/helpers';

const StudentTable = ({
  students,
  onView,
  onEdit,
  onToggleStatus,
  onDelete,
}) => {
  if (!students || students.length === 0) {
    return (
      <div className="card-surface flex flex-col items-center justify-center px-6 py-14 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
          <Users className="h-6 w-6" />
        </div>
        <h3 className="mt-4 text-sm font-semibold text-slate-900">No students found</h3>
        <p className="mt-1 text-sm text-slate-500">
          Try adjusting your search or add a new student to get started.
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
              <th className="px-4 py-3.5">Student ID</th>
              <th className="px-4 py-3.5">Name</th>
              <th className="px-4 py-3.5">Phone</th>
              <th className="px-4 py-3.5">Email</th>
              <th className="px-4 py-3.5">Class</th>
              <th className="px-4 py-3.5">Monthly Fee</th>
              <th className="px-4 py-3.5">Status</th>
              <th className="px-4 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {students.map((student) => (
              <tr key={student.id} className="hover:bg-slate-50/80 transition">
                <td className="whitespace-nowrap px-4 py-3.5 font-semibold text-indigo-600">
                  {student.student_id}
                </td>
                <td className="whitespace-nowrap px-4 py-3.5 font-medium text-slate-900">
                  {student.name}
                </td>
                <td className="whitespace-nowrap px-4 py-3.5 text-slate-600">
                  {student.phone}
                </td>
                <td className="whitespace-nowrap px-4 py-3.5 text-slate-600">
                  {student.email}
                </td>
                <td className="whitespace-nowrap px-4 py-3.5">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusBadgeClass(
                      student.class_type || 'not_enrolled'
                    )}`}
                  >
                    {student.class_type ? formatClassLabel(student.class_type) : 'Not Enrolled'}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-3.5 font-medium text-slate-900">
                  {student.monthly_fee > 0 ? formatCurrency(student.monthly_fee) : '—'}
                </td>
                <td className="whitespace-nowrap px-4 py-3.5">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${getStatusBadgeClass(
                      student.status
                    )}`}
                  >
                    {student.status}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-3.5 text-right">
                  <div className="inline-flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onView(student)}
                      className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-indigo-600"
                      title="View details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onEdit(student)}
                      className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-indigo-600"
                      title="Edit student"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onToggleStatus(student)}
                      className={`rounded-lg p-1.5 ${student.status === 'active'
                        ? 'text-slate-500 hover:bg-amber-50 hover:text-amber-600'
                        : 'text-slate-500 hover:bg-emerald-50 hover:text-emerald-600'
                        }`}
                      title={
                        student.status === 'active'
                          ? 'Deactivate student'
                          : 'Activate student'
                      }
                    >
                      {student.status === 'active' ? (
                        <UserX className="h-4 w-4" />
                      ) : (
                        <UserCheck className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(student)}
                      className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                      title="Delete permanently"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentTable;

