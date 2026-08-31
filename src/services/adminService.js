import api from './api';

// Admin Service for all admin-related API calls
export const adminService = {
  // 1. Admin Register User
  registerUser: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // 2. Admin Login as Client
  loginAsClient: async (clientId) => {
    try {
      const response = await api.post('/auth/admin/login-as-client', { clientId });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // 3. Get All Users with Filters and Pagination
  getAllUsers: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      // Add pagination
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      
      // Add filters
      if (params.name) queryParams.append('name', params.name);
      if (params.email) queryParams.append('email', params.email);
      if (params.phone) queryParams.append('phone', params.phone);
      if (params.status) queryParams.append('status', params.status);
      if (params.subscriptionStatus) queryParams.append('subscriptionStatus', params.subscriptionStatus);
      if (params.role) queryParams.append('role', params.role);
      
      const response = await api.get(`/users?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // 4. Admin Dashboard Stats
  getDashboardStats: async () => {
    try {
      const response = await api.get('/admin-dashboard');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // 5. Get Users by Status (Active/Inactive)
  getUsersByStatus: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.status) queryParams.append('status', params.status);
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.search) queryParams.append('search', params.search);
      
      const response = await api.get(`/admin-dashboard/users?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Additional helper methods
  updateUserStatus: async (userId, status) => {
    try {
      const response = await api.put(`/users/${userId}/status`, { status });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  deleteUser: async (userId) => {
    try {
      const response = await api.delete(`/users/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Bulk operations
  bulkUpdateUserStatus: async (userIds, status) => {
    try {
      const response = await api.put('/users/bulk-status', { userIds, status });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Export users data
  exportUsers: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams(filters);
      const response = await api.get(`/users/export?${queryParams.toString()}`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Update user details
  updateUser: async (userId, userData) => {
    try {
      const response = await api.put(`/users/${userId}`, userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Plan Management APIs
  createPlan: async (planData) => {
    try {
      const response = await api.post('/plans', planData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  updatePlan: async (planId, planData) => {
    try {
      const response = await api.put(`/plans/${planId}`, planData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  deletePlan: async (planId) => {
    try {
      const response = await api.delete(`/plans/${planId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getAllPlans: async () => {
    try {
      const response = await api.get('/plans');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  assignPlanToUser: async (userId, planId) => {
    try {
      const response = await api.post(`/plans/assign/${userId}`, { planId });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  updateUserPlanExpiry: async (userId, endDate) => {
    try {
      const response = await api.post(`/plans/expiry/${userId}`, { endDate });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

export default adminService;