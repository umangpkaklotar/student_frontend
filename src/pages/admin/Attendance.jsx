import React, { useCallback, useEffect, useState } from 'react';
import { CheckCheck, XCircle, Save, CalendarCheck, Loader2 } from 'lucide-react';
import { studentService } from '../../services/studentService';
import { attendanceService } from '../../services/attendanceService';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import { formatClassLabel, getErrorMessage, getTodayISO } from '../../utils/helpers';

const AdminAttendance = () => {
  const { showToast } = useAuth();
  const [selectedDate, setSelectedDate] = useState(getTodayISO());
  const [selectedClass, setSelectedClass] = useState('karate');
  const [students, setStudents] = useState([]);
  const [existingMap, setExistingMap] = useState({});
  const [statusMap, setStatusMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadAttendanceData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [studentsRes, attRes] = await Promise.all([
        studentService.getAll({ class_type: selectedClass, status: 'active' }),
        attendanceService.getByDate(selectedDate, selectedClass),
      ]);

      const activeStudents = studentsRes.students || [];
      const existingByStudent = {};
      const nextStatusMap = {};

      (attRes.records || []).forEach((rec) => {
        existingByStudent[rec.student_id] = rec;
        nextStatusMap[rec.student_id] = rec.status;
      });

      activeStudents.forEach((student) => {
        if (!nextStatusMap[student.id]) {
          nextStatusMap[student.id] = 'present';
        }
      });

      setStudents(activeStudents);
      setExistingMap(existingByStudent);
      setStatusMap(nextStatusMap);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load attendance sheet.'));
    } finally {
      setLoading(false);
    }
  }, [selectedDate, selectedClass]);

  useEffect(() => {
    loadAttendanceData();
  }, [loadAttendanceData]);

  const setStudentStatus = (studentId, status) => {
    setStatusMap((prev) => ({ ...prev, [studentId]: status }));
  };

  const markAll = (status) => {
    const updated = {};
    students.forEach((s) => {
      updated[s.id] = status;
    });
    setStatusMap(updated);
  };

  const handleSave = async () => {
    if (students.length === 0) return;
    setSaving(true);
    try {
      const toCreate = [];
      const toUpdate = [];

      students.forEach((s) => {
        const chosenStatus = statusMap[s.id] || 'present';
        const existing = existingMap[s.id];
        if (!existing) {
          toCreate.push({ student_id: s.id, status: chosenStatus });
        } else if (existing.status !== chosenStatus) {
          toUpdate.push({ attendanceId: existing.id, status: chosenStatus });
        }
      });

      if (toCreate.length === 0 && toUpdate.length === 0) {
        showToast('Attendance is already up to date.', 'info');
        setSaving(false);
        return;
      }

      if (toCreate.length > 0) {
        await attendanceService.markAttendance({
          date: selectedDate,
          class_type: selectedClass,
          records: toCreate,
        });
      }

      if (toUpdate.length > 0) {
        await Promise.all(
          toUpdate.map((item) => attendanceService.update(item.attendanceId, item.status))
        );
      }

      showToast(
        `Saved attendance (${toCreate.length} created, ${toUpdate.length} updated).`
      );
      await loadAttendanceData();
    } catch (err) {
      showToast(getErrorMessage(err, 'Failed to save attendance.'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const presentCount = students.filter((s) => statusMap[s.id] === 'present').length;
  const absentCount = students.length - presentCount;
  const markedExistingCount = students.filter((s) => Boolean(existingMap[s.id])).length;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Daily Attendance</h2>
          <p className="text-sm text-slate-500">
            Mark or update attendance for Karate and Skating classes.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
            Present: {presentCount}
          </span>
          <span className="rounded-full bg-rose-50 px-3 py-1 text-rose-700 ring-1 ring-inset ring-rose-600/20">
            Absent: {absentCount}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="card-surface p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:w-auto">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Select Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Select Class
              </label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="input-field"
              >
                <option value="karate">Karate</option>
                <option value="skating">Skating</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => markAll('present')}
              disabled={students.length === 0 || saving}
              className="btn-secondary text-xs sm:text-sm"
            >
              <CheckCheck className="h-4 w-4 text-emerald-600" />
              Mark All Present
            </button>
            <button
              type="button"
              onClick={() => markAll('absent')}
              disabled={students.length === 0 || saving}
              className="btn-secondary text-xs sm:text-sm"
            >
              <XCircle className="h-4 w-4 text-rose-600" />
              Mark All Absent
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={students.length === 0 || saving}
              className="btn-primary text-xs sm:text-sm"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Attendance
                </>
              )}
            </button>
          </div>
        </div>

        {markedExistingCount > 0 && (
          <p className="mt-3 text-xs font-medium text-indigo-700">
            Attendance already recorded for {markedExistingCount} of {students.length}{' '}
            {formatClassLabel(selectedClass)} student(s) on {selectedDate}. Any changes will update existing records.
          </p>
        )}
      </div>

      {loading ? (
        <LoadingSpinner label="Loading class roster..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={loadAttendanceData} />
      ) : students.length === 0 ? (
        <div className="card-surface flex flex-col items-center justify-center px-6 py-14 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <CalendarCheck className="h-6 w-6" />
          </div>
          <h3 className="mt-4 text-sm font-semibold text-slate-900">
            No active students in {formatClassLabel(selectedClass)}
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Add active students to this class to mark daily attendance.
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
                  <th className="px-4 py-3.5 text-center">Present</th>
                  <th className="px-4 py-3.5 text-center">Absent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {students.map((student) => {
                  const status = statusMap[student.id] || 'present';
                  const isSaved = Boolean(existingMap[student.id]);
                  return (
                    <tr key={student.id} className="hover:bg-slate-50/80 transition">
                      <td className="whitespace-nowrap px-4 py-3.5 font-semibold text-indigo-600">
                        {student.student_id}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-900">{student.name}</span>
                          {isSaved && (
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                              Saved
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-center">
                        <button
                          type="button"
                          onClick={() => setStudentStatus(student.id, 'present')}
                          className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition ${
                            status === 'present'
                              ? 'bg-emerald-600 text-white shadow-sm'
                              : 'border border-slate-200 bg-white text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                          }`}
                        >
                          Present
                        </button>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-center">
                        <button
                          type="button"
                          onClick={() => setStudentStatus(student.id, 'absent')}
                          className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition ${
                            status === 'absent'
                              ? 'bg-rose-600 text-white shadow-sm'
                              : 'border border-slate-200 bg-white text-slate-600 hover:bg-rose-50 hover:text-rose-700'
                          }`}
                        >
                          Absent
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAttendance;
