import api from './api';

export const feeService = {
  async getMyFees() {
    const { data } = await api.get('/student/fees');
    return data;
  },

  async getMyCurrentFee() {
    const { data } = await api.get('/student/fees/current');
    return data;
  },

  async create(payload) {
    const { data } = await api.post('/fees', payload);
    return data;
  },

  async getAll(params = {}) {
    const { data } = await api.get('/fees', { params });
    return data;
  },

  async update(feeId, payload) {
    const { data } = await api.put(`/fees/${feeId}`, payload);
    return data;
  },
};
