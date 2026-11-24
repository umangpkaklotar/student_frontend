import React, { useCallback, useEffect, useState } from 'react';
import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  IndianRupee,
  User,
  Award,
} from 'lucide-react';
import { dashboardService } from '../../services/dashboardService';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import {
  formatClassLabel,
  formatCurrency,
  formatDate,
  getErrorMessage,
  getStatusBadgeClass,
} from '../../utils/helpers';

const StudentProfile = () => {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await dashboardService.getStudentDashboard();
      setStudent(res.student);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load profile.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  if (loading) return <LoadingSpinner label="Loading your profile..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchProfile} />;
  if (!student) return null;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="card-surface p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 text-2xl font-bold text-white">
              {student.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                {student.student_id}
              </span>
              <h2 className="text-xl font-bold text-slate-900">{student.name}</h2>
              <p className="text-sm text-slate-500">{student.email}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <span
              className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadgeClass(
                student.class_type
              )}`}
            >
              <Award className="h-3.5 w-3.5" />
              {formatClassLabel(student.class_type)}
            </span>
            <span
              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusBadgeClass(
                student.status
              )}`}
            >
              {student.status}
            </span>
          </div>
        </div>
      </div>

      <div className="card-surface p-6">
        <h3 className="text-base font-bold text-slate-900 mb-5">Enrollment &amp; Contact Details</h3>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 text-sm">
          <div className="flex items-start gap-3">
            <Mail className="h-4.5 w-4.5 text-slate-400 mt-0.5" />
            <div>
              <p className="text-xs text-slate-500">Email</p>
              <p className="font-medium text-slate-900">{student.email}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Phone className="h-4.5 w-4.5 text-slate-400 mt-0.5" />
            <div>
              <p className="text-xs text-slate-500">Phone</p>
              <p className="font-medium text-slate-900">{student.phone}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <User className="h-4.5 w-4.5 text-slate-400 mt-0.5" />
            <div>
              <p className="text-xs text-slate-500">Gender &amp; Date of Birth</p>
              <p className="font-medium text-slate-900">
                {student.gender} · {formatDate(student.date_of_birth)}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Calendar className="h-4.5 w-4.5 text-slate-400 mt-0.5" />
            <div>
              <p className="text-xs text-slate-500">Joining Date</p>
              <p className="font-medium text-slate-900">{formatDate(student.joining_date)}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <IndianRupee className="h-4.5 w-4.5 text-slate-400 mt-0.5" />
            <div>
              <p className="text-xs text-slate-500">Monthly Fee</p>
              <p className="font-semibold text-slate-900">
                {formatCurrency(student.monthly_fee)}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 sm:col-span-2">
            <MapPin className="h-4.5 w-4.5 text-slate-400 mt-0.5" />
            <div>
              <p className="text-xs text-slate-500">Address</p>
              <p className="font-medium text-slate-900">{student.address}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
