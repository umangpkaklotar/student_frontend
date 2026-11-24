import api from './api';

export const attendanceService = {
  async markAttendance(payload) {
    const { data } = await api.post('/attendance', payload);
    return data;
  },

  async getByStudent(studentId, params = {}) {
    const { data } = await api.get(`/attendance/student/${studentId}`, { params });
    return data;
  },

  async getMonthlyByStudent(studentId, month) {
    const { data } = await api.get(`/attendance/monthly/${studentId}`, {
      params: month ? { month } : {},
    });
    return data;
  },

  async getByDate(date, classType) {
    const { data } = await api.get(`/attendance/date/${date}`, {
      params: classType ? { class_type: classType } : {},
    });
    return data;
  },

  async update(attendanceId, status) {
    const { data } = await api.put(`/attendance/${attendanceId}`, { status });
    return data;
  },
};
