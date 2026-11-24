import React, { useCallback, useEffect, useState } from 'react';
import { CalendarCheck, UserCheck, UserX, Percent } from 'lucide-react';
import { dashboardService } from '../../services/dashboardService';
import { attendanceService } from '../../services/attendanceService';
import StatCard from '../../components/StatCard';
import AttendanceTable from '../../components/AttendanceTable';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import { getCurrentMonthISO, getErrorMessage } from '../../utils/helpers';

const StudentAttendance = () => {
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthISO());
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState({
    total_classes: 0,
    present: 0,
    absent: 0,
    attendance_percentage: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAttendance = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const dash = await dashboardService.getStudentDashboard();
      const studentId = dash.student.id;

      if (selectedMonth) {
        const res = await attendanceService.getMonthlyByStudent(studentId, selectedMonth);
        setRecords(res.records || []);
        setSummary({
          total_classes: res.total_classes || 0,
          present: res.present || 0,
          absent: res.absent || 0,
          attendance_percentage: res.attendance_percentage || 0,
        });
      } else {
        const res = await attendanceService.getByStudent(studentId);
        setRecords(res.records || []);
        setSummary(
          res.summary || {
            total_classes: 0,
            present: 0,
            absent: 0,
            attendance_percentage: 0,
          }
        );
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load attendance records.'));
    } finally {
      setLoading(false);
    }
  }, [selectedMonth]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">My Attendance</h2>
          <p className="text-sm text-slate-500">
            View your class attendance history and monthly attendance percentage.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="input-field w-auto"
          />
          {selectedMonth && (
            <button
              type="button"
              onClick={() => setSelectedMonth('')}
              className="btn-secondary text-xs"
            >
              All Time
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <LoadingSpinner label="Loading attendance history..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={fetchAttendance} />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Classes"
              value={summary.total_classes}
              icon={CalendarCheck}
              color="indigo"
            />
            <StatCard
              title="Present"
              value={summary.present}
              icon={UserCheck}
              color="emerald"
            />
            <StatCard
              title="Absent"
              value={summary.absent}
              icon={UserX}
              color="rose"
            />
            <StatCard
              title="Attendance %"
              value={`${summary.attendance_percentage}%`}
              icon={Percent}
              color="violet"
            />
          </div>

          <div className="card-surface p-5">
            <div className="flex items-center justify-between text-sm font-semibold text-slate-800 mb-2">
              <span>Attendance Progress</span>
              <span>{summary.attendance_percentage}%</span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-indigo-600 transition-all duration-300"
                style={{ width: `${Math.min(100, summary.attendance_percentage)}%` }}
              />
            </div>
          </div>

          <AttendanceTable records={records} />
        </>
      )}
    </div>
  );
};

export default StudentAttendance;
