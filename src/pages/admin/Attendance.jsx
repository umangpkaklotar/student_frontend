import React, { useCallback, useEffect, useState } from 'react';
import {
  CheckCheck,
  XCircle,
  Save,
  CalendarCheck,
  Loader2,
  Pencil,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { studentService } from '../../services/studentService';
import { attendanceService } from '../../services/attendanceService';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import { formatClassLabel, formatDate, getErrorMessage } from '../../utils/helpers';

const getIndiaTodayISO = () =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());

const AdminAttendance = () => {
  const { showToast } = useAuth();
  const [mode, setMode] = useState('normal'); // 'normal' | 'edit'
  const [serverToday, setServerToday] = useState(getIndiaTodayISO);
  const [selectedDate, setSelectedDate] = useState(getIndiaTodayISO);
  const [selectedClass, setSelectedClass] = useState('karate');

  const [rows, setRows] = useState([]);
  const [existingMap, setExistingMap] = useState({});
  const [statusMap, setStatusMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [dateWarning, setDateWarning] = useState('');
  const [justUpdatedIds, setJustUpdatedIds] = useState({});

  const loadAttendanceData = useCallback(async () => {
    const targetDate = mode === 'normal' ? serverToday : selectedDate;
    if (mode === 'edit' && targetDate > serverToday) {
      setDateWarning('Future attendance is not allowed.');
      setRows([]);
      setExistingMap({});
      setStatusMap({});
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    setDateWarning('');
    try {
      const attPromise = attendanceService.getByDateAndClass(
        mode === 'normal' ? undefined : targetDate,
        selectedClass
      );
      const studentsPromise =
        mode === 'normal'
          ? studentService.getAll({ class_type: selectedClass, status: 'active' })
          : Promise.resolve({ students: [] });

      const [attRes, studentsRes] = await Promise.all([attPromise, studentsPromise]);

      if (attRes.server_today) {
        setServerToday(attRes.server_today);
        if (mode === 'normal' && selectedDate !== attRes.server_today) {
          setSelectedDate(attRes.server_today);
        }
      }

      const existingRecords = attRes.records || [];
      const existingByStudent = {};
      const nextStatusMap = {};

      existingRecords.forEach((rec) => {
        existingByStudent[rec.student_id] = rec;
        nextStatusMap[rec.student_id] = rec.status;
      });

      if (mode === 'normal') {
        const activeStudents = studentsRes.students || [];
        activeStudents.forEach((student) => {
          if (!nextStatusMap[student.id]) {
            nextStatusMap[student.id] = 'present';
          }
        });
        setRows(
          activeStudents.map((s) => ({
            id: s.id,
            student_id: s.student_id,
            name: s.name,
          }))
        );
      } else {
        setRows(
          existingRecords.map((rec) => ({
            id: rec.student_id,
            student_id: rec.student_code || '—',
            name: rec.student_name || '—',
          }))
        );
      }

      setExistingMap(existingByStudent);
      setStatusMap(nextStatusMap);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load attendance sheet.'));
    } finally {
      setLoading(false);
    }
  }, [mode, serverToday, selectedDate, selectedClass]);

  useEffect(() => {
    loadAttendanceData();
  }, [loadAttendanceData]);

  const handleEnterEditMode = () => {
    setMode('edit');
    setDateWarning('');
    setJustUpdatedIds({});
  };

  const handleBackToNormalMode = () => {
    setMode('normal');
    setSelectedDate(serverToday);
    setDateWarning('');
    setJustUpdatedIds({});
  };

  const handleEditDateChange = (nextDate) => {
    if (mode !== 'edit') return;
    setJustUpdatedIds({});
    if (nextDate && nextDate > serverToday) {
      setDateWarning('Future attendance is not allowed.');
      showToast('Future attendance is not allowed.', 'error');
      return;
    }
    setDateWarning('');
    setSelectedDate(nextDate);
  };

  const setStudentStatus = (studentId, status) => {
    setStatusMap((prev) => ({ ...prev, [studentId]: status }));
  };

  const markAll = (status) => {
    const updated = {};
    rows.forEach((r) => {
      updated[r.id] = status;
    });
    setStatusMap(updated);
  };

  const handleSaveToday = async () => {
    if (mode !== 'normal' || rows.length === 0) return;
    setSaving(true);
    try {
      const records = rows.map((r) => ({
        student_id: r.id,
        status: statusMap[r.id] || 'present',
      }));

      await attendanceService.markAttendance({
        date: serverToday,
        class_type: selectedClass,
        mode: 'normal',
        records,
      });

      showToast("Today's attendance saved successfully.");
      await loadAttendanceData();
    } catch (err) {
      showToast(getErrorMessage(err, "Failed to save today's attendance."), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateEditMode = async () => {
    if (mode !== 'edit' || rows.length === 0) return;
    if (selectedDate > serverToday) {
      setDateWarning('Future attendance is not allowed.');
      showToast('Future attendance is not allowed.', 'error');
      return;
    }

    setSaving(true);
    try {
      const records = rows.map((r) => ({
        student_id: r.id,
        status: statusMap[r.id] || 'present',
      }));

      await attendanceService.updateBulk({
        date: selectedDate,
        class_type: selectedClass,
        records,
      });

      const updatedFlags = {};
      rows.forEach((r) => {
        updatedFlags[r.id] = true;
      });
      setJustUpdatedIds(updatedFlags);
      showToast('Attendance updated successfully.');
      await loadAttendanceData();
    } catch (err) {
      showToast(getErrorMessage(err, 'Failed to update attendance.'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const presentCount = rows.filter((r) => statusMap[r.id] === 'present').length;
  const absentCount = rows.length - presentCount;
  const savedCount = rows.filter((r) => Boolean(existingMap[r.id])).length;
  const allTodaySaved = mode === 'normal' && rows.length > 0 && savedCount === rows.length;
  const activeDisplayDate = mode === 'normal' ? serverToday : selectedDate;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 className="text-lg font-bold text-slate-900">Daily Attendance</h2>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                mode === 'normal'
                  ? 'bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-600/20'
                  : 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20'
              }`}
            >
              {mode === 'normal' ? "Mark Today's Attendance" : 'Edit Attendance Mode'}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            {mode === 'normal'
              ? "Normal mode records attendance for today's date only."
              : 'Select today or a past date to edit existing attendance records.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
            Present: {presentCount}
          </span>
          <span className="rounded-full bg-rose-50 px-3 py-1 text-rose-700 ring-1 ring-inset ring-rose-600/20">
            Absent: {absentCount}
          </span>
          {mode === 'normal' ? (
            <button
              type="button"
              onClick={handleEnterEditMode}
              className="btn-secondary text-xs py-1.5 px-3"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit Attendance
            </button>
          ) : (
            <button
              type="button"
              onClick={handleBackToNormalMode}
              className="btn-secondary text-xs py-1.5 px-3"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Today&apos;s Attendance
            </button>
          )}
        </div>
      </div>

      <div className="card-surface p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:w-auto">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Select Date
              </label>
              {mode === 'normal' ? (
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={serverToday}
                    disabled
                    readOnly
                    className="input-field cursor-not-allowed bg-slate-100 text-slate-700 font-medium"
                  />
                  <span className="shrink-0 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-600/20">
                    Today
                  </span>
                </div>
              ) : (
                <input
                  type="date"
                  value={selectedDate}
                  max={serverToday}
                  onChange={(e) => handleEditDateChange(e.target.value)}
                  className="input-field"
                />
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Select Class
              </label>
              <select
                value={selectedClass}
                onChange={(e) => {
                  setJustUpdatedIds({});
                  setSelectedClass(e.target.value);
                }}
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
              disabled={rows.length === 0 || saving}
              className="btn-secondary text-xs sm:text-sm"
            >
              <CheckCheck className="h-4 w-4 text-emerald-600" />
              Mark All Present
            </button>
            <button
              type="button"
              onClick={() => markAll('absent')}
              disabled={rows.length === 0 || saving}
              className="btn-secondary text-xs sm:text-sm"
            >
              <XCircle className="h-4 w-4 text-rose-600" />
              Mark All Absent
            </button>

            {mode === 'normal' ? (
              <button
                type="button"
                onClick={handleSaveToday}
                disabled={rows.length === 0 || saving}
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
            ) : (
              <button
                type="button"
                onClick={handleUpdateEditMode}
                disabled={rows.length === 0 || saving || Boolean(dateWarning)}
                className="btn-primary text-xs sm:text-sm"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Update Attendance
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {mode === 'normal' && savedCount > 0 && (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-xs font-medium text-emerald-800">
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              {allTodaySaved
                ? "Attendance already recorded for today's date."
                : `Attendance already recorded for ${savedCount} of ${rows.length} ${formatClassLabel(
                    selectedClass
                  )} student(s) today (${formatDate(serverToday)}).`}
            </span>
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800">
              ✓ Attendance Saved
            </span>
          </div>
        )}

        {dateWarning && (
          <div className="mt-3 flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-semibold text-rose-700">
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
            <span>{dateWarning}</span>
          </div>
        )}
      </div>

      {loading ? (
        <LoadingSpinner label="Loading attendance records..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={loadAttendanceData} />
      ) : dateWarning ? null : rows.length === 0 ? (
        <div className="card-surface flex flex-col items-center justify-center px-6 py-14 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <CalendarCheck className="h-6 w-6" />
          </div>
          <h3 className="mt-4 text-sm font-semibold text-slate-900">
            {mode === 'edit'
              ? 'No attendance record found for this date.'
              : `No active students in ${formatClassLabel(selectedClass)}`}
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            {mode === 'edit'
              ? `Attendance has not been recorded for ${formatClassLabel(
                  selectedClass
                )} on ${formatDate(activeDisplayDate)}.`
              : 'Add active students to this class to mark daily attendance.'}
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
                {rows.map((student) => {
                  const status = statusMap[student.id] || 'present';
                  const isSaved = Boolean(existingMap[student.id]);
                  const wasJustUpdated = Boolean(justUpdatedIds[student.id]);
                  return (
                    <tr key={student.id} className="hover:bg-slate-50/80 transition">
                      <td className="whitespace-nowrap px-4 py-3.5 font-semibold text-indigo-600">
                        {student.student_id}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-900">{student.name}</span>
                          {mode === 'edit' && wasJustUpdated ? (
                            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                              ✓ Updated
                            </span>
                          ) : (
                            isSaved && (
                              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                                ✓ Saved
                              </span>
                            )
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
