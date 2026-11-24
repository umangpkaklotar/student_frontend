import api from './api';

export const dashboardService = {
  async getAdminDashboard() {
    const { data } = await api.get('/dashboard/admin');
    return data;
  },

  async getAdminReports(params = {}) {
    const { data } = await api.get('/dashboard/reports', { params });
    return data;
  },

  async getStudentDashboard() {
    const { data } = await api.get('/dashboard/student');
    return data;
  },
};
