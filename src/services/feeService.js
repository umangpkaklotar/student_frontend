import api from './api';

export const feeService = {
  async create(payload) {
    const { data } = await api.post('/fees', payload);
    return data;
  },

  async getAll(params = {}) {
    const { data } = await api.get('/fees', { params });
    return data;
  },

  async getByStudent(studentId) {
    const { data } = await api.get(`/fees/student/${studentId}`);
    return data;
  },

  async getByMonth(month, params = {}) {
    const { data } = await api.get(`/fees/month/${month}`, { params });
    return data;
  },

  async update(feeId, payload) {
    const { data } = await api.put(`/fees/${feeId}`, payload);
    return data;
  },
};
