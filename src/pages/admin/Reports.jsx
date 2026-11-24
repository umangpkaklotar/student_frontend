import React, { useCallback, useEffect, useState } from 'react';
import {
  Users,
  CalendarCheck,
  UserCheck,
  UserX,
  Percent,
  IndianRupee,
  CheckCircle2,
  Clock,
  Download,
} from 'lucide-react';
import { dashboardService } from '../../services/dashboardService';
import { studentService } from '../../services/studentService';
import StatCard from '../../components/StatCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import {
  formatClassLabel,
  formatCurrency,
  getErrorMessage,
  getStatusBadgeClass,
} from '../../utils/helpers';

const Reports = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [classType, setClassType] = useState('');
  const [studentId, setStudentId] = useState('');
  const [students, setStudents] = useState([]);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    studentService
      .getAll()
      .then((res) => setStudents(res.students || []))
      .catch(() => {});
  }, []);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      if (classType) params.class_type = classType;
      if (studentId) params.student_id = studentId;
      const data = await dashboardService.getAdminReports(params);
      setReport(data);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to generate report.'));
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, classType, studentId]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const exportCsv = () => {
    if (!report?.rows?.length) return;
    const headers = [
      'Student ID',
      'Name',
      'Class',
      'Status',
      'Total Classes',
      'Present',
      'Absent',
      'Attendance %',
      'Paid Fees',
      'Pending Fees',
      'Total Fees',
    ];
    const lines = report.rows.map((r) =>
      [
        r.student_id,
        `"${r.name.replace(/"/g, '""')}"`,
        r.class_type,
        r.status,
        r.total_classes,
        r.present,
        r.absent,
        r.attendance_percentage,
        r.paid_fees,
        r.pending_fees,
        r.total_fees,
      ].join(',')
    );
    const csv = [headers.join(','), ...lines].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'academy-report.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const summary = report?.summary;
  const rows = report?.rows || [];

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Attendance &amp; Fee Reports</h2>
          <p className="text-sm text-slate-500">
            Filter by date range, class, or individual student.
          </p>
        </div>
        <button
          type="button"
          onClick={exportCsv}
          disabled={!rows.length}
          className="btn-secondary self-start sm:self-auto"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="card-surface p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
              From Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
              To Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Class
            </label>
            <select
              value={classType}
              onChange={(e) => setClassType(e.target.value)}
              className="input-field"
            >
              <option value="">All Classes</option>
              <option value="karate">Karate</option>
              <option value="skating">Skating</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Student
            </label>
            <select
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="input-field"
            >
              <option value="">All Students</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.student_id} — {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner label="Generating report..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={fetchReport} />
      ) : (
        <>
          {summary && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard title="Total Students" value={summary.total_students} icon={Users} color="indigo" />
              <StatCard title="Total Attendance" value={summary.total_attendance} icon={CalendarCheck} color="sky" />
              <StatCard title="Present" value={summary.present} icon={UserCheck} color="emerald" />
              <StatCard title="Absent" value={summary.absent} icon={UserX} color="rose" />
              <StatCard
                title="Attendance %"
                value={`${summary.attendance_percentage}%`}
                icon={Percent}
                color="violet"
              />
              <StatCard
                title="Total Fees"
                value={formatCurrency(summary.total_fees)}
                icon={IndianRupee}
                color="indigo"
              />
              <StatCard
                title="Paid Fees"
                value={formatCurrency(summary.paid_fees)}
                icon={CheckCircle2}
                color="emerald"
              />
              <StatCard
                title="Pending Fees"
                value={formatCurrency(summary.pending_fees)}
                icon={Clock}
                color="amber"
              />
            </div>
          )}

          <div className="card-surface overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-4 py-3.5">Student ID</th>
                    <th className="px-4 py-3.5">Name</th>
                    <th className="px-4 py-3.5">Class</th>
                    <th className="px-4 py-3.5">Classes</th>
                    <th className="px-4 py-3.5">Present</th>
                    <th className="px-4 py-3.5">Absent</th>
                    <th className="px-4 py-3.5">Attendance %</th>
                    <th className="px-4 py-3.5">Paid Fees</th>
                    <th className="px-4 py-3.5">Pending Fees</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-10 text-center text-slate-500">
                        No report data matching the selected filters.
                      </td>
                    </tr>
                  ) : (
                    rows.map((row) => (
                      <tr key={row.id} className="hover:bg-slate-50/80 transition">
                        <td className="whitespace-nowrap px-4 py-3.5 font-semibold text-indigo-600">
                          {row.student_id}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3.5 font-medium text-slate-900">
                          {row.name}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3.5">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusBadgeClass(
                              row.class_type
                            )}`}
                          >
                            {formatClassLabel(row.class_type)}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3.5 text-slate-700">
                          {row.total_classes}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3.5 font-medium text-emerald-700">
                          {row.present}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3.5 font-medium text-rose-700">
                          {row.absent}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3.5 font-semibold text-slate-900">
                          {row.attendance_percentage}%
                        </td>
                        <td className="whitespace-nowrap px-4 py-3.5 font-medium text-emerald-700">
                          {formatCurrency(row.paid_fees)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3.5 font-medium text-amber-700">
                          {formatCurrency(row.pending_fees)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Reports;
