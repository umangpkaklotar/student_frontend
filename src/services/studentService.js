import api from './api';

export const studentService = {
  async getAll(params = {}) {
    const { data } = await api.get('/students', { params });
    return data;
  },

  async getById(studentId) {
    const { data } = await api.get(`/students/${studentId}`);
    return data;
  },

  async create(payload) {
    const { data } = await api.post('/students', payload);
    return data;
  },

  async update(studentId, payload) {
    const { data } = await api.put(`/students/${studentId}`, payload);
    return data;
  },

  async remove(studentId, permanent = false) {
    const { data } = await api.delete(`/students/${studentId}`, {
      params: { permanent },
    });
    return data;
  },
};

