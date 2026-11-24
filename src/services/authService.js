import api from './api';

export const authService = {
  async registerSendOtp(payload) {
    const { data } = await api.post('/auth/register/send-otp', payload);
    return data;
  },

  async registerVerifyOtp(payload) {
    const { data } = await api.post('/auth/register/verify-otp', payload);
    return data;
  },

  async login(credentials) {
    const { data } = await api.post('/auth/login', credentials);
    return data;
  },

  async forgotPasswordSendOtp(email) {
    const { data } = await api.post('/auth/forgot-password/send-otp', { email });
    return data;
  },

  async forgotPasswordVerifyOtp(email, otp) {
    const { data } = await api.post('/auth/forgot-password/verify-otp', {
      email,
      otp,
    });
    return data;
  },

  async resetPassword(payload) {
    const { data } = await api.post('/auth/reset-password', payload);
    return data;
  },

  async getMe() {
    const { data } = await api.get('/auth/me');
    return data;
  },

  async updateProfile(payload) {
    const { data } = await api.put('/auth/profile', payload);
    return data;
  },
};
