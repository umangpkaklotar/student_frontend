import React, { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Award,
  Wind,
  CheckCircle2,
  Clock,
  XCircle,
  Loader2,
  AlertCircle,
  Send,
} from 'lucide-react';
import { enrollmentService } from '../../services/enrollmentService';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatusBadge from '../../components/StatusBadge';
import { formatClassLabel, getErrorMessage } from '../../utils/helpers';

const computeAge = (dobStr) => {
  if (!dobStr) return '';
  const dob = new Date(`${dobStr}T00:00:00`);
  if (Number.isNaN(dob.getTime())) return '';
  const diff = Date.now() - dob.getTime();
  const age = Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
  return age > 0 ? `${age} yrs` : '';
};

const StudentEnrollment = () => {
  const { showToast } = useAuth();
  const [searchParams] = useSearchParams();
  const initialClassParam = (searchParams.get('class') || '').toLowerCase();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [student, setStudent] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [selectedClass, setSelectedClass] = useState(
    initialClassParam === 'skating' ? 'skating' : 'karate'
  );
  const [editingPending, setEditingPending] = useState(false);

  const [formState, setFormState] = useState({
    phone: '',
    address: '',
    date_of_birth: '',
    emergency_contact_name: '',
    emergency_contact_number: '',
    previous_experience: '',
    preferred_batch: 'Evening (5:00 PM - 6:30 PM)',
  });

  const loadEnrollment = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await enrollmentService.getMyEnrollment();
      setStudent(res.student);
      setEnrollment(res.enrollment);

      if (res.enrollment) {
        setSelectedClass(res.enrollment.class_type);
        setFormState({
          phone: res.student.phone || '',
          address: res.student.address || '',
          date_of_birth: res.student.date_of_birth || '',
          emergency_contact_name:
            res.enrollment.enrollment_data?.emergency_contact_name || '',
          emergency_contact_number:
            res.enrollment.enrollment_data?.emergency_contact_number || '',
          previous_experience:
            res.enrollment.enrollment_data?.previous_experience || '',
          preferred_batch:
            res.enrollment.enrollment_data?.preferred_batch ||
            'Evening (5:00 PM - 6:30 PM)',
        });
      } else if (res.student) {
        setFormState((prev) => ({
          ...prev,
          phone: res.student.phone || '',
          address: res.student.address || '',
          date_of_birth: res.student.date_of_birth || '',
        }));
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load enrollment details.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEnrollment();
  }, [loadEnrollment]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const payload = {
        class_type: selectedClass,
        emergency_contact_name: formState.emergency_contact_name,
        emergency_contact_number: formState.emergency_contact_number,
        previous_experience: formState.previous_experience || 'None',
        preferred_batch: formState.preferred_batch,
        phone: formState.phone,
        address: formState.address,
        date_of_birth: formState.date_of_birth,
      };

      if (enrollment && (editingPending || enrollment.status === 'rejected')) {
        await enrollmentService.updateEnrollment(payload);
        showToast('Enrollment updated successfully.');
      } else {
        await enrollmentService.submitEnrollment(payload);
        showToast('Enrollment submitted successfully.');
      }
      setEditingPending(false);
      await loadEnrollment();
    } catch (err) {
      const msg = getErrorMessage(err, 'Unable to submit enrollment.');
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner label="Loading enrollment status..." />;

  const isKarate = selectedClass === 'karate';
  const showStatusView = enrollment && !editingPending && enrollment.status !== 'rejected';

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Class Enrollment</h2>
        <p className="text-sm text-slate-500">
          Choose Karate or Skating and submit your enrollment form for admin approval.
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <AlertCircle className="h-5 w-5 shrink-0 text-rose-600 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {showStatusView ? (
        <div className="card-surface p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                  enrollment.status === 'active'
                    ? 'bg-emerald-50 text-emerald-600'
                    : 'bg-amber-50 text-amber-600'
                }`}
              >
                {enrollment.status === 'active' ? (
                  <CheckCircle2 className="h-6 w-6" />
                ) : (
                  <Clock className="h-6 w-6" />
                )}
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Class Enrollment Status
                </p>
                <h3 className="text-lg font-bold text-slate-900">
                  {formatClassLabel(enrollment.class_type)} Class
                </h3>
              </div>
            </div>
            <StatusBadge value={enrollment.status} uppercase />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-sm">
            <div>
              <p className="text-xs text-slate-500">Student</p>
              <p className="font-semibold text-slate-900">
                {student?.name} ({student?.student_id})
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Preferred Batch</p>
              <p className="font-medium text-slate-900">
                {enrollment.enrollment_data?.preferred_batch}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Emergency Contact</p>
              <p className="font-medium text-slate-900">
                {enrollment.enrollment_data?.emergency_contact_name} ·{' '}
                {enrollment.enrollment_data?.emergency_contact_number}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Previous Experience</p>
              <p className="font-medium text-slate-900">
                {enrollment.enrollment_data?.previous_experience || 'None'}
              </p>
            </div>
          </div>

          {enrollment.status === 'pending' ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <p className="text-xs sm:text-sm text-amber-800">
                Your {formatClassLabel(enrollment.class_type)} enrollment is awaiting admin approval.
              </p>
              <button
                type="button"
                onClick={() => setEditingPending(true)}
                className="btn-secondary text-xs py-1.5 px-3 self-start sm:self-auto"
              >
                Edit Form
              </button>
            </div>
          ) : (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <p className="text-xs sm:text-sm font-medium text-emerald-800">
                Your {formatClassLabel(enrollment.class_type)} enrollment is active! You can now view attendance and fees.
              </p>
              <Link to="/student/dashboard" className="btn-primary text-xs py-2 px-3.5">
                Go to Dashboard
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-5">
          {enrollment?.status === 'rejected' && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 flex items-start gap-3">
              <XCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-sm text-rose-800">
                <p className="font-semibold">Previous enrollment was rejected</p>
                {enrollment.rejection_reason && (
                  <p className="mt-0.5 text-xs">Reason: {enrollment.rejection_reason}</p>
                )}
                <p className="mt-1 text-xs">
                  You can update your details below and resubmit for approval.
                </p>
              </div>
            </div>
          )}

          {/* Class Selector */}
          <div className="card-surface p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Choose Your Class
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setSelectedClass('karate')}
                className={`flex items-center gap-3 rounded-xl border p-4 text-left transition ${
                  selectedClass === 'karate'
                    ? 'border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600 text-white">
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Karate</p>
                  <p className="text-xs text-slate-500">Martial arts &amp; discipline</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedClass('skating')}
                className={`flex items-center gap-3 rounded-xl border p-4 text-left transition ${
                  selectedClass === 'skating'
                    ? 'border-violet-600 bg-violet-50 ring-1 ring-violet-600'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-600 text-white">
                  <Wind className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Skating</p>
                  <p className="text-xs text-slate-500">Balance, speed &amp; rink drills</p>
                </div>
              </button>
            </div>
          </div>

          {/* Dedicated Karate or Skating Enrollment Form */}
          <form onSubmit={handleSubmit} className="card-surface p-6 space-y-5">
            <div className="border-b border-slate-200 pb-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {isKarate ? 'Karate Class Enrollment' : 'Skating Class Enrollment'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Account information is auto-filled from your verified profile.
                </p>
              </div>
              <StatusBadge value={selectedClass} />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={student?.name || ''}
                  disabled
                  className="input-field bg-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  Student ID
                </label>
                <input
                  type="text"
                  value={student?.student_id || ''}
                  disabled
                  className="input-field bg-slate-100 font-semibold text-indigo-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Date of Birth {formState.date_of_birth ? `(${computeAge(formState.date_of_birth)})` : ''} *
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

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  required
                  value={formState.phone}
                  onChange={(e) =>
                    setFormState((p) => ({ ...p, phone: e.target.value }))
                  }
                  className="input-field"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Address *
                </label>
                <input
                  type="text"
                  required
                  value={formState.address}
                  onChange={(e) =>
                    setFormState((p) => ({ ...p, address: e.target.value }))
                  }
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Emergency Contact Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Parent / Guardian name"
                  value={formState.emergency_contact_name}
                  onChange={(e) =>
                    setFormState((p) => ({
                      ...p,
                      emergency_contact_name: e.target.value,
                    }))
                  }
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Emergency Contact Number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="9876543210"
                  value={formState.emergency_contact_number}
                  onChange={(e) =>
                    setFormState((p) => ({
                      ...p,
                      emergency_contact_number: e.target.value,
                    }))
                  }
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {isKarate ? 'Previous Karate Experience' : 'Previous Skating Experience'}
                </label>
                <input
                  type="text"
                  placeholder={
                    isKarate
                      ? 'e.g. Beginner / White Belt / 6 months'
                      : 'e.g. Beginner / Quad skates / 1 year'
                  }
                  value={formState.previous_experience}
                  onChange={(e) =>
                    setFormState((p) => ({
                      ...p,
                      previous_experience: e.target.value,
                    }))
                  }
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Preferred Batch *
                </label>
                <select
                  value={formState.preferred_batch}
                  onChange={(e) =>
                    setFormState((p) => ({ ...p, preferred_batch: e.target.value }))
                  }
                  className="input-field"
                >
                  {isKarate ? (
                    <>
                      <option value="Morning (6:30 AM - 8:00 AM)">
                        Morning (6:30 AM - 8:00 AM)
                      </option>
                      <option value="Evening (5:00 PM - 6:30 PM)">
                        Evening (5:00 PM - 6:30 PM)
                      </option>
                      <option value="Evening Late (6:30 PM - 7:30 PM)">
                        Evening Late (6:30 PM - 7:30 PM)
                      </option>
                    </>
                  ) : (
                    <>
                      <option value="Morning (7:00 AM - 8:30 AM)">
                        Morning (7:00 AM - 8:30 AM)
                      </option>
                      <option value="Evening (4:30 PM - 6:00 PM)">
                        Evening (4:30 PM - 6:00 PM)
                      </option>
                      <option value="Evening Late (6:00 PM - 7:00 PM)">
                        Evening Late (6:00 PM - 7:00 PM)
                      </option>
                    </>
                  )}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
              {editingPending && (
                <button
                  type="button"
                  onClick={() => setEditingPending(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              )}
              <button type="submit" disabled={submitting} className="btn-primary">
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    {isKarate ? 'Submit Karate Enrollment' : 'Submit Skating Enrollment'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default StudentEnrollment;
