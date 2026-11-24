import React, { useCallback, useEffect, useState } from 'react';
import { Eye, CheckCircle2, XCircle, ClipboardCheck, X } from 'lucide-react';
import { enrollmentService } from '../../services/enrollmentService';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import StatusBadge from '../../components/StatusBadge';
import { formatClassLabel, getErrorMessage } from '../../utils/helpers';

const AdminEnrollments = () => {
  const { showToast } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionId, setActionId] = useState(null);

  const fetchEnrollments = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (classFilter) params.class_type = classFilter;
      const res = await enrollmentService.getAdminEnrollments(params);
      setEnrollments(res.enrollments || []);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load class enrollments.'));
    } finally {
      setLoading(false);
    }
  }, [statusFilter, classFilter]);

  useEffect(() => {
    fetchEnrollments();
  }, [fetchEnrollments]);

  const handleApprove = async (item) => {
    setActionId(item.id);
    try {
      await enrollmentService.approveEnrollment(item.id);
      showToast(
        `${item.student_name} approved for ${formatClassLabel(item.class_type)}!`
      );
      setSelectedEnrollment(null);
      await fetchEnrollments();
    } catch (err) {
      showToast(getErrorMessage(err, 'Failed to approve enrollment.'), 'error');
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (e) => {
    e.preventDefault();
    if (!rejectModal) return;
    setActionId(rejectModal.id);
    try {
      await enrollmentService.rejectEnrollment(rejectModal.id, rejectReason);
      showToast(`Enrollment rejected for ${rejectModal.student_name}.`, 'info');
      setRejectModal(null);
      setRejectReason('');
      setSelectedEnrollment(null);
      await fetchEnrollments();
    } catch (err) {
      showToast(getErrorMessage(err, 'Failed to reject enrollment.'), 'error');
    } finally {
      setActionId(null);
    }
  };

  const formatIsoDate = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Class Enrollments</h2>
        <p className="text-sm text-slate-500">
          Review student Karate and Skating enrollment requests and approve active access.
        </p>
      </div>

      <div className="card-surface p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:max-w-lg">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="active">Active</option>
            <option value="rejected">Rejected</option>
          </select>

          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="input-field"
          >
            <option value="">All Classes</option>
            <option value="karate">Karate</option>
            <option value="skating">Skating</option>
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner label="Loading enrollments..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={fetchEnrollments} />
      ) : enrollments.length === 0 ? (
        <div className="card-surface flex flex-col items-center justify-center px-6 py-14 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <ClipboardCheck className="h-6 w-6" />
          </div>
          <h3 className="mt-4 text-sm font-semibold text-slate-900">
            No class enrollments found
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Student Karate and Skating enrollment requests will appear here.
          </p>
        </div>
      ) : (
        <div className="card-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3.5">Student ID</th>
                  <th className="px-4 py-3.5">Student Name</th>
                  <th className="px-4 py-3.5">Email</th>
                  <th className="px-4 py-3.5">Class</th>
                  <th className="px-4 py-3.5">Enrollment Date</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {enrollments.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition">
                    <td className="whitespace-nowrap px-4 py-3.5 font-semibold text-indigo-600">
                      {item.student_code}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 font-medium text-slate-900">
                      {item.student_name}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-slate-600">
                      {item.student_email}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5">
                      <StatusBadge value={item.class_type} />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-slate-600">
                      {formatIsoDate(item.created_at)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5">
                      <StatusBadge value={item.status} />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedEnrollment(item)}
                          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-indigo-600"
                          title="View enrollment details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {item.status !== 'active' && (
                          <button
                            type="button"
                            disabled={actionId === item.id}
                            onClick={() => handleApprove(item)}
                            className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition disabled:opacity-50"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Approve
                          </button>
                        )}
                        {item.status !== 'rejected' && (
                          <button
                            type="button"
                            disabled={actionId === item.id}
                            onClick={() => {
                              setRejectModal(item);
                              setRejectReason('');
                            }}
                            className="inline-flex items-center gap-1 rounded-lg bg-rose-50 px-2.5 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition disabled:opacity-50"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            Reject
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View Enrollment Modal */}
      {selectedEnrollment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                  {selectedEnrollment.student_code}
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  {selectedEnrollment.student_name} — {formatClassLabel(selectedEnrollment.class_type)}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEnrollment(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-sm">
              <div className="flex items-center gap-2">
                <StatusBadge value={selectedEnrollment.class_type} />
                <StatusBadge value={selectedEnrollment.status} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500">Email</p>
                  <p className="font-medium text-slate-900 break-all">
                    {selectedEnrollment.student_email}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Mobile</p>
                  <p className="font-medium text-slate-900">
                    {selectedEnrollment.student_phone}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Emergency Contact</p>
                  <p className="font-medium text-slate-900">
                    {selectedEnrollment.enrollment_data?.emergency_contact_name} (
                    {selectedEnrollment.enrollment_data?.emergency_contact_number})
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Preferred Batch</p>
                  <p className="font-medium text-slate-900">
                    {selectedEnrollment.enrollment_data?.preferred_batch}
                  </p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-xs text-slate-500">Previous Experience</p>
                  <p className="font-medium text-slate-900">
                    {selectedEnrollment.enrollment_data?.previous_experience || 'None'}
                  </p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-xs text-slate-500">Address</p>
                  <p className="font-medium text-slate-900">{selectedEnrollment.address}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-3.5">
              {selectedEnrollment.status !== 'active' && (
                <button
                  type="button"
                  onClick={() => handleApprove(selectedEnrollment)}
                  disabled={actionId === selectedEnrollment.id}
                  className="btn-primary text-xs py-2"
                >
                  Approve
                </button>
              )}
              <button
                type="button"
                onClick={() => setSelectedEnrollment(null)}
                className="btn-secondary text-xs py-2"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Reason Modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <h3 className="text-base font-bold text-slate-900">
              Reject Class Enrollment?
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              Reject {rejectModal.student_name}&apos;s {formatClassLabel(rejectModal.class_type)} request.
            </p>
            <form onSubmit={handleReject} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Reason (optional)
                </label>
                <textarea
                  rows={2}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Optional note for student..."
                  className="input-field"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setRejectModal(null)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionId === rejectModal.id}
                  className="btn-danger"
                >
                  Reject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEnrollments;
