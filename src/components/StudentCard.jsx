import React from 'react';
import { X, Mail, Phone, MapPin, Calendar, IndianRupee, User } from 'lucide-react';
import {
  formatClassLabel,
  formatCurrency,
  formatDate,
  getStatusBadgeClass,
} from '../utils/helpers';

const StudentCard = ({ student, onClose }) => {
  if (!student) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              {student.student_id}
            </span>
            <h3 className="text-lg font-bold text-slate-900">{student.name}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusBadgeClass(
                student.class_type
              )}`}
            >
              {formatClassLabel(student.class_type)}
            </span>
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${getStatusBadgeClass(
                student.status
              )}`}
            >
              {student.status}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-2.5">
              <Mail className="h-4 w-4 text-slate-400 mt-0.5" />
              <div>
                <p className="text-xs text-slate-500">Email</p>
                <p className="font-medium text-slate-800 break-all">{student.email}</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Phone className="h-4 w-4 text-slate-400 mt-0.5" />
              <div>
                <p className="text-xs text-slate-500">Phone</p>
                <p className="font-medium text-slate-800">{student.phone}</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <User className="h-4 w-4 text-slate-400 mt-0.5" />
              <div>
                <p className="text-xs text-slate-500">Gender &amp; DOB</p>
                <p className="font-medium text-slate-800">
                  {student.gender} · {formatDate(student.date_of_birth)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Calendar className="h-4 w-4 text-slate-400 mt-0.5" />
              <div>
                <p className="text-xs text-slate-500">Joining Date</p>
                <p className="font-medium text-slate-800">
                  {formatDate(student.joining_date)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <IndianRupee className="h-4 w-4 text-slate-400 mt-0.5" />
              <div>
                <p className="text-xs text-slate-500">Monthly Fee</p>
                <p className="font-semibold text-slate-900">
                  {formatCurrency(student.monthly_fee)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 sm:col-span-2">
              <MapPin className="h-4 w-4 text-slate-400 mt-0.5" />
              <div>
                <p className="text-xs text-slate-500">Address</p>
                <p className="font-medium text-slate-800">{student.address}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end border-t border-slate-200 bg-slate-50 px-6 py-3.5">
          <button type="button" onClick={onClose} className="btn-secondary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentCard;
