import api from './api';

export const enrollmentService = {
  async getMyEnrollment() {
    const { data } = await api.get('/student/enrollment');
    return data;
  },

  async submitEnrollment(payload) {
    const { data } = await api.post('/student/enrollment', payload);
    return data;
  },

  async updateEnrollment(payload) {
    const { data } = await api.put('/student/enrollment', payload);
    return data;
  },

  async getAdminEnrollments(params = {}) {
    const { data } = await api.get('/admin/enrollments', { params });
    return data;
  },

  async approveEnrollment(enrollmentId) {
    const { data } = await api.put(`/admin/enrollments/${enrollmentId}/approve`);
    return data;
  },

  async rejectEnrollment(enrollmentId, reason = '') {
    const { data } = await api.put(`/admin/enrollments/${enrollmentId}/reject`, {
      reason: reason || null,
    });
    return data;
  },
};
