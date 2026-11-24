import React, { useCallback, useEffect, useState } from 'react';
import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  IndianRupee,
  User,
  Edit3,
  Save,
  X,
  Loader2,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { profileService } from '../../services/profileService';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatusBadge from '../../components/StatusBadge';
import {
  formatClassLabel,
  formatCurrency,
  formatDate,
  getErrorMessage,
} from '../../utils/helpers';

const StudentProfile = () => {
  const { user, updateUser, showToast } = useAuth();
  const [student, setStudent] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [enrollmentStatus, setEnrollmentStatus] = useState('not_enrolled');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formState, setFormState] = useState({
    name: '',
    phone: '',
    gender: 'Male',
    date_of_birth: '',
    address: '',
  });

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await profileService.getProfile();
      setStudent(res.student);
      setEnrollment(res.enrollment || null);
      setEnrollmentStatus(res.enrollment_status || 'not_enrolled');
      setFormState({
        name: res.student.name,
        phone: res.student.phone,
        gender: res.student.gender,
        date_of_birth: res.student.date_of_birth,
        address: res.student.address,
      });
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load profile.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSaveSafeFields = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await profileService.updateProfile(formState);
      setStudent(res.student);
      if (user) {
        updateUser({ ...user, name: res.student.name });
      }
      setEditing(false);
      showToast('Profile updated successfully!');
    } catch (err) {
      showToast(getErrorMessage(err, 'Unable to update profile.'), 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner label="Loading your profile..." />;

  if (error) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-800 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 text-sm">
          <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
        <button type="button" onClick={fetchProfile} className="btn-secondary text-xs py-1.5">
          <RefreshCw className="h-3.5 w-3.5" />
          Retry
        </button>
      </div>
    );
  }

  if (!student) return null;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Profile Photo Placeholder + Identity Banner */}
      <div className="card-surface p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-2xl font-bold text-white shadow-sm">
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

          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge value={student.class_type || enrollment?.class_type || 'not_enrolled'} />
            <StatusBadge value={enrollmentStatus} />
            {!editing && (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="btn-secondary text-xs py-1.5 px-3"
              >
                <Edit3 className="h-3.5 w-3.5" />
                Edit Contact Info
              </button>
            )}
          </div>
        </div>
      </div>

      {editing ? (
        <div className="card-surface p-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-5">
            <div>
              <h3 className="text-base font-bold text-slate-900">Edit Personal Details</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Student ID, Email, Class, Monthly Fee, and Account Status are managed by the academy.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSaveSafeFields} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={formState.name}
                  onChange={(e) => setFormState((p) => ({ ...p, name: e.target.value }))}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={formState.phone}
                  onChange={(e) => setFormState((p) => ({ ...p, phone: e.target.value }))}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Gender
                </label>
                <select
                  value={formState.gender}
                  onChange={(e) => setFormState((p) => ({ ...p, gender: e.target.value }))}
                  className="input-field"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Date of Birth
                </label>
                <input
                  type="date"
                  required
                  value={formState.date_of_birth}
                  onChange={(e) =>
                    setFormState((p) => ({ ...p, date_of_birth: e.target.value }))
                  }
                  className="input-field"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Address
                </label>
                <textarea
                  rows={2}
                  required
                  value={formState.address}
                  onChange={(e) => setFormState((p) => ({ ...p, address: e.target.value }))}
                  className="input-field"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="card-surface p-6">
          <h3 className="text-base font-bold text-slate-900 mb-5">Student Information</h3>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 text-sm">
            <div className="flex items-start gap-3">
              <User className="h-4.5 w-4.5 text-slate-400 mt-0.5" />
              <div>
                <p className="text-xs text-slate-500">Student ID</p>
                <p className="font-semibold text-indigo-600">{student.student_id}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="h-4.5 w-4.5 text-slate-400 mt-0.5" />
              <div>
                <p className="text-xs text-slate-500">Email</p>
                <p className="font-medium text-slate-900 break-all">{student.email}</p>
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
                <p className="text-xs text-slate-500">Class &amp; Enrollment Status</p>
                <div className="flex flex-wrap items-center gap-2 mt-0.5">
                  <span className="font-medium text-slate-900">
                    {student.class_type
                      ? formatClassLabel(student.class_type)
                      : enrollment?.class_type
                      ? formatClassLabel(enrollment.class_type)
                      : 'Not Enrolled'}
                  </span>
                  <StatusBadge value={enrollmentStatus} />
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <IndianRupee className="h-4.5 w-4.5 text-slate-400 mt-0.5" />
              <div>
                <p className="text-xs text-slate-500">Joining Date &amp; Monthly Fee</p>
                <p className="font-semibold text-slate-900 mt-0.5">
                  {student.joining_date ? formatDate(student.joining_date) : '—'} ·{' '}
                  {student.monthly_fee > 0 ? formatCurrency(student.monthly_fee) : '—'}
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
      )}
    </div>
  );
};

export default StudentProfile;
