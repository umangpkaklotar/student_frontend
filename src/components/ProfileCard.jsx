import React from 'react';
import { Mail, Phone, Award, Calendar, User } from 'lucide-react';
import StatusBadge from './StatusBadge';
import { formatDate } from '../utils/helpers';

const ProfileCard = ({ student }) => {
  if (!student) return null;

  return (
    <div className="card-surface p-5 space-y-4">
      <div className="flex items-center gap-3.5">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-lg font-bold text-white shadow-sm">
          {(student.name || 'S').charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">
            {student.student_id}
          </p>
          <h3 className="text-base font-bold text-slate-900 truncate">
            {student.name}
          </h3>
        </div>
        <StatusBadge value={student.class_type} />
      </div>

      <div className="space-y-2.5 border-t border-slate-100 pt-3 text-sm">
        <div className="flex items-center gap-2.5 text-slate-600">
          <Mail className="h-4 w-4 text-slate-400 shrink-0" />
          <span className="truncate">{student.email}</span>
        </div>
        <div className="flex items-center gap-2.5 text-slate-600">
          <Phone className="h-4 w-4 text-slate-400 shrink-0" />
          <span>{student.phone}</span>
        </div>
        <div className="flex items-center gap-2.5 text-slate-600">
          <Award className="h-4 w-4 text-slate-400 shrink-0" />
          <span className="capitalize">{student.class_type} Class</span>
        </div>
        <div className="flex items-center gap-2.5 text-slate-600">
          <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
          <span>Joined {formatDate(student.joining_date)}</span>
        </div>
        <div className="flex items-center gap-2.5 text-slate-600">
          <User className="h-4 w-4 text-slate-400 shrink-0" />
          <span>Status: <StatusBadge value={student.status} /></span>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
