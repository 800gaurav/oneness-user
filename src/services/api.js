import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    if ((status === 401 || status === 403) && window.location.pathname !== '/login') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
  sendOtp: (payload) => api.post('/auth/send-otp', payload),
  verifyOtp: (payload) => api.post('/auth/verify-otp', payload),
};

// Customer APIs
export const customerAPI = {
  getAll: (params) => api.get('/customers', { params }),
  getOne: (id) => api.get(`/customers/${id}`),
  create: (data) => api.post('/customers', data),
  update: (id, data) => api.put(`/customers/${id}`, data),
  delete: (id) => api.delete(`/customers/${id}`),
  toggleActive: (id) => api.patch(`/customers/${id}/toggle-active`),
  getUpcomingBirthdays: () => api.get('/customers/upcoming/birthdays'),
};

// Campaign APIs
export const campaignAPI = {
  getAll: () => api.get('/campaigns'),
  getOne: (id) => api.get(`/campaigns/${id}`),
  create: (data) => api.post('/campaigns', data),
  update: (id, data) => api.put(`/campaigns/${id}`, data),
  delete: (id) => api.delete(`/campaigns/${id}`),
  send: (id) => api.post(`/campaigns/${id}/send`),
  toggleStatus: (id) => api.post(`/campaigns/${id}/toggle`),
  sendIndividual: (data) => api.post('/campaigns/send-individual', data)
};

// Template APIs
export const templateAPI = {
  getAll: () => api.get('/templates'),
  getOne: (id) => api.get(`/templates/${id}`),
  create: (data) => api.post('/templates', data),
  update: (id, data) => api.put(`/templates/${id}`, data),
  delete: (id) => api.delete(`/templates/${id}`),
};

// Order APIs
export const orderAPI = {
  getAll: (params) => api.get('/orders', { params }),
  getOne: (id) => api.get(`/orders/${id}`),
  create: (data) => api.post('/orders', data),
  update: (id, data) => api.put(`/orders/${id}`, data),
  delete: (id) => api.delete(`/orders/${id}`),
};

// Reminder APIs
export const reminderAPI = {
  getSettings: () => api.get('/reminders/settings'),
  updateSettings: (data) => api.put('/reminders/settings', data),
  getUpcoming: (params) => api.get('/reminders/events', { params }),
  getStats: () => api.get('/reminders/stats'),
};

// Settings APIs
export const settingsAPI = {
  get: () => api.get('/settings'),
  update: (data) => api.put('/settings', data),
};

// Dashboard APIs
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getSalesData: () => api.get('/dashboard/sales'),
  getCustomerGrowth: () => api.get('/dashboard/customer-growth'),
};

// Bill APIs
export const billAPI = {
  getAll: (params) => api.get('/bills', { params }),
  getOne: (id) => api.get(`/bills/${id}`),
  create: (data) => api.post('/bills', data),
  delete: (id) => api.delete(`/bills/${id}`),
};

// WhatsApp APIs
export const whatsappAPI = {
  getStatus: () => api.get('/whatsapp/status'),
  connect: (data) => api.post('/whatsapp/connect', data),
  disconnect: () => api.post('/whatsapp/disconnect'),
};

export default api;
