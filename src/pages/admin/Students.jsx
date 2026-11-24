import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, AlertTriangle } from 'lucide-react';
import { studentService } from '../../services/studentService';
import { useAuth } from '../../context/AuthContext';
import StudentTable from '../../components/StudentTable';
import StudentCard from '../../components/StudentCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import { getErrorMessage } from '../../utils/helpers';

const Students = () => {
  const navigate = useNavigate();
  const { showToast } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (classFilter) params.class_type = classFilter;
      if (statusFilter) params.status = statusFilter;
      const data = await studentService.getAll(params);
      setStudents(data.students || []);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load students.'));
    } finally {
      setLoading(false);
    }
  }, [search, classFilter, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStudents();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchStudents]);

  const handleConfirm = async () => {
    if (!confirmAction) return;
    setActionLoading(true);
    try {
      const { type, student } = confirmAction;
      if (type === 'delete') {
        await studentService.remove(student.id, true);
        showToast(`${student.name} permanently deleted.`);
      } else if (type === 'toggle') {
        if (student.status === 'active') {
          await studentService.remove(student.id, false);
          showToast(`${student.name} deactivated.`);
        } else {
          await studentService.update(student.id, { status: 'active' });
          showToast(`${student.name} activated.`);
        }
      }
      setConfirmAction(null);
      fetchStudents();
    } catch (err) {
      showToast(getErrorMessage(err, 'Action failed.'), 'error');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Student Directory</h2>
          <p className="text-sm text-slate-500">
            Manage Karate &amp; Skating student enrollments, fees, and account status.
          </p>
        </div>
        <Link to="/admin/students/add" className="btn-primary self-start sm:self-auto">
          <Plus className="h-4 w-4" />
          Add Student
        </Link>
      </div>

      {/* Filters */}
      <div className="card-surface p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
          <div className="relative sm:col-span-2">
            <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by ID, name, email, or phone..."
              className="input-field pl-9"
            />
          </div>
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="input-field"
          >
            <option value="">All Classes</option>
            <option value="karate">Karate</option>
            <option value="skating">Skating</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner label="Loading students..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={fetchStudents} />
      ) : (
        <StudentTable
          students={students}
          onView={(s) => setSelectedStudent(s)}
          onEdit={(s) => navigate(`/admin/students/edit/${s.id}`)}
          onToggleStatus={(s) => setConfirmAction({ type: 'toggle', student: s })}
          onDelete={(s) => setConfirmAction({ type: 'delete', student: s })}
        />
      )}

      {selectedStudent && (
        <StudentCard student={selectedStudent} onClose={() => setSelectedStudent(null)} />
      )}

      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {confirmAction.type === 'delete'
                    ? 'Permanently Delete Student?'
                    : confirmAction.student.status === 'active'
                    ? 'Deactivate Student?'
                    : 'Activate Student?'}
                </h3>
                <p className="mt-1.5 text-sm text-slate-600">
                  {confirmAction.type === 'delete'
                    ? `This will permanently delete ${confirmAction.student.name} (${confirmAction.student.student_id}) along with their attendance and fee history.`
                    : confirmAction.student.status === 'active'
                    ? `Deactivating ${confirmAction.student.name} will mark their status as inactive while keeping historical records.`
                    : `Reactivate ${confirmAction.student.name} (${confirmAction.student.student_id})?`}
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmAction(null)}
                disabled={actionLoading}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={actionLoading}
                className={confirmAction.type === 'delete' ? 'btn-danger' : 'btn-primary'}
              >
                {actionLoading ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;
