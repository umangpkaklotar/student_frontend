import React, { useCallback, useEffect, useState } from 'react';
import { Plus, Search, X, Loader2, CreditCard, CheckCircle2, Clock } from 'lucide-react';
import { feeService } from '../../services/feeService';
import { studentService } from '../../services/studentService';
import { useAuth } from '../../context/AuthContext';
import FeeTable from '../../components/FeeTable';
import StatCard from '../../components/StatCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import {
  formatCurrency,
  getCurrentMonthISO,
  getErrorMessage,
  getTodayISO,
} from '../../utils/helpers';

const AdminFees = () => {
  const { showToast } = useAuth();
  const [fees, setFees] = useState([]);
  const [summary, setSummary] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [monthFilter, setMonthFilter] = useState(getCurrentMonthISO());
  const [statusFilter, setStatusFilter] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [search, setSearch] = useState('');

  const [modalMode, setModalMode] = useState(null); // 'create' | 'edit' | 'markPaid'
  const [activeFee, setActiveFee] = useState(null);
  const [formState, setFormState] = useState({
    student_id: '',
    month: getCurrentMonthISO(),
    amount: '',
    status: 'paid',
    payment_date: getTodayISO(),
    payment_method: 'UPI',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchFees = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (monthFilter) params.month = monthFilter;
      if (statusFilter) params.status = statusFilter;
      if (classFilter) params.class_type = classFilter;
      if (search.trim()) params.search = search.trim();

      const data = await feeService.getAll(params);
      setFees(data.fees || []);
      setSummary(data.summary || null);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load fees.'));
    } finally {
      setLoading(false);
    }
  }, [monthFilter, statusFilter, classFilter, search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchFees();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchFees]);

  useEffect(() => {
    studentService
      .getAll({ status: 'active' })
      .then((res) => setStudents(res.students || []))
      .catch(() => {});
  }, []);

  const openCreateModal = () => {
    const first = students[0];
    setActiveFee(null);
    setModalMode('create');
    setFormState({
      student_id: first?.id || '',
      month: monthFilter || getCurrentMonthISO(),
      amount: first ? String(first.monthly_fee) : '',
      status: 'paid',
      payment_date: getTodayISO(),
      payment_method: 'UPI',
      notes: '',
    });
  };

  const openMarkPaidModal = (fee) => {
    setActiveFee(fee);
    setModalMode('markPaid');
    setFormState({
      student_id: fee.student_id,
      month: fee.month,
      amount: String(fee.amount),
      status: 'paid',
      payment_date: getTodayISO(),
      payment_method: fee.payment_method || 'UPI',
      notes: fee.notes || '',
    });
  };

  const openEditModal = (fee) => {
    setActiveFee(fee);
    setModalMode('edit');
    setFormState({
      student_id: fee.student_id,
      month: fee.month,
      amount: String(fee.amount),
      status: fee.status,
      payment_date: fee.payment_date || (fee.status === 'paid' ? getTodayISO() : ''),
      payment_method: fee.payment_method || '',
      notes: fee.notes || '',
    });
  };

  const handleSubmitModal = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (modalMode === 'create' || activeFee?.is_virtual) {
        await feeService.create({
          student_id: formState.student_id,
          month: formState.month,
          amount: Number(formState.amount),
          status: formState.status,
          payment_date:
            formState.status === 'pending'
              ? null
              : formState.payment_date || getTodayISO(),
          payment_method: formState.payment_method || null,
          notes: formState.notes || null,
        });
        showToast('Fee payment recorded successfully!');
      } else if (activeFee?.id) {
        await feeService.update(activeFee.id, {
          amount: Number(formState.amount),
          status: formState.status,
          payment_date:
            formState.status === 'pending'
              ? null
              : formState.payment_date || getTodayISO(),
          payment_method: formState.payment_method || null,
          notes: formState.notes || null,
        });
        showToast('Fee record updated successfully!');
      }
      setModalMode(null);
      fetchFees();
    } catch (err) {
      showToast(getErrorMessage(err, 'Unable to save fee record.'), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Monthly Fee Management</h2>
          <p className="text-sm text-slate-500">
            Track monthly student fees, record payments, and monitor pending dues.
          </p>
        </div>
        <button type="button" onClick={openCreateModal} className="btn-primary self-start sm:self-auto">
          <Plus className="h-4 w-4" />
          Record Fee Payment
        </button>
      </div>

      {summary && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            title="Total Fee Records"
            value={formatCurrency(summary.total_amount)}
            subtitle={`${summary.total_records} student record(s)`}
            icon={CreditCard}
            color="indigo"
          />
          <StatCard
            title="Collected (Paid)"
            value={formatCurrency(summary.paid_amount)}
            subtitle={`${summary.paid_count} paid`}
            icon={CheckCircle2}
            color="emerald"
          />
          <StatCard
            title="Outstanding (Pending / Partial)"
            value={formatCurrency(summary.pending_amount)}
            subtitle={`${summary.pending_count} pending · ${summary.partial_count} partial`}
            icon={Clock}
            color="amber"
          />
        </div>
      )}

      {/* Filters */}
      <div className="card-surface p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search student name or ID..."
              className="input-field pl-9"
            />
          </div>
          <input
            type="month"
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
            className="input-field"
          />
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
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="partial">Partial</option>
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner label="Loading monthly fees..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={fetchFees} />
      ) : (
        <FeeTable
          fees={fees}
          isAdmin
          onMarkPaid={openMarkPaidModal}
          onEdit={openEditModal}
        />
      )}

      {/* Fee Modal */}
      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
              <h3 className="text-base font-bold text-slate-900">
                {modalMode === 'create'
                  ? 'Record Monthly Fee'
                  : modalMode === 'markPaid'
                  ? 'Mark Fee as Paid'
                  : 'Update Fee Record'}
              </h3>
              <button
                type="button"
                onClick={() => setModalMode(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitModal} className="p-6 space-y-4">
              {modalMode === 'create' ? (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Student *
                  </label>
                  <select
                    required
                    value={formState.student_id}
                    onChange={(e) => {
                      const chosen = students.find((s) => s.id === e.target.value);
                      setFormState((prev) => ({
                        ...prev,
                        student_id: e.target.value,
                        amount: chosen ? String(chosen.monthly_fee) : prev.amount,
                      }));
                    }}
                    className="input-field"
                  >
                    <option value="">Select student</option>
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.student_id} — {s.name} ({s.class_type})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="rounded-xl bg-slate-50 p-3 text-sm">
                  <p className="font-semibold text-slate-900">
                    {activeFee?.student_code} · {activeFee?.student_name}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">Month: {formState.month}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Month *
                  </label>
                  <input
                    type="month"
                    required
                    disabled={modalMode !== 'create'}
                    value={formState.month}
                    onChange={(e) =>
                      setFormState((prev) => ({ ...prev, month: e.target.value }))
                    }
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Amount (INR) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formState.amount}
                    onChange={(e) =>
                      setFormState((prev) => ({ ...prev, amount: e.target.value }))
                    }
                    className="input-field"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Status *
                  </label>
                  <select
                    value={formState.status}
                    onChange={(e) => {
                      const nextStatus = e.target.value;
                      setFormState((prev) => ({
                        ...prev,
                        status: nextStatus,
                        payment_date:
                          nextStatus === 'pending'
                            ? ''
                            : prev.payment_date || getTodayISO(),
                      }));
                    }}
                    className="input-field"
                  >
                    <option value="paid">Paid</option>
                    <option value="partial">Partial</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Payment Date
                  </label>
                  <input
                    type="date"
                    disabled={formState.status === 'pending'}
                    value={formState.payment_date}
                    onChange={(e) =>
                      setFormState((prev) => ({ ...prev, payment_date: e.target.value }))
                    }
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Payment Method
                </label>
                <select
                  value={formState.payment_method}
                  onChange={(e) =>
                    setFormState((prev) => ({ ...prev, payment_method: e.target.value }))
                  }
                  className="input-field"
                >
                  <option value="">Select method</option>
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="Card">Card</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Notes
                </label>
                <textarea
                  rows={2}
                  value={formState.notes}
                  onChange={(e) =>
                    setFormState((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  placeholder="Optional receipt or payment notes..."
                  className="input-field"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalMode(null)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn-primary">
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Fee'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFees;
