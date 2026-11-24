import api from './api';

export const attendanceService = {
  async getMyAttendance(params = {}) {
    const { data } = await api.get('/student/attendance', { params });
    return data;
  },

  async getMyAttendanceSummary() {
    const { data } = await api.get('/student/attendance/summary');
    return data;
  },

  async markAttendance(payload) {
    const { data } = await api.post('/attendance', payload);
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
