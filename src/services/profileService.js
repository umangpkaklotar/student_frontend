import api from './api';

export const profileService = {
  async getProfile() {
    const { data } = await api.get('/student/profile');
    return data;
  },

  async updateProfile(payload) {
    const { data } = await api.put('/student/profile', payload);
    return data;
  },
};
