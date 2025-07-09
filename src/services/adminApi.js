import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'https://completetroikabackend.onrender.com/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('🔄 API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('❌ Response Error:', error.response?.status, error.response?.data);
    
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Admin API Services
export const adminApi = {
  // Dashboard Statistics
  getDashboardStats: async (timeRange = '7d') => {
    try {
      const response = await api.get(`/admin/dashboard?range=${timeRange}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.message,
        status: error.response?.status,
      };
    }
  },

  // Projects Management
  getProjects: async (limit = null) => {
    try {
      const url = limit ? `/admin/projects?limit=${limit}` : '/admin/projects';
      const response = await api.get(url);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.message,
        status: error.response?.status,
      };
    }
  },

  getProject: async (projectId) => {
    try {
      const response = await api.get(`/admin/projects/${projectId}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.message,
        status: error.response?.status,
      };
    }
  },

  createProject: async (projectData) => {
    try {
      const response = await api.post('/admin/projects', projectData);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.message,
        status: error.response?.status,
      };
    }
  },

  updateProject: async (projectId, projectData) => {
    try {
      const response = await api.patch(`/admin/projects/${projectId}`, projectData);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.message,
        status: error.response?.status,
      };
    }
  },

  deleteProject: async (projectId) => {
    try {
      const response = await api.delete(`/admin/projects/${projectId}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.message,
        status: error.response?.status,
      };
    }
  },

  updateProjectStatus: async (projectId, status) => {
    try {
      const response = await api.patch(`/admin/projects/${projectId}/status`, { status });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.message,
        status: error.response?.status,
      };
    }
  },

  // Notifications
  getNotifications: async (unreadOnly = false) => {
    try {
      const url = unreadOnly ? '/admin/notifications?unread=true' : '/admin/notifications';
      const response = await api.get(url);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.message,
        status: error.response?.status,
      };
    }
  },

  // System Stats
  getSystemStats: async () => {
    try {
      const response = await api.get('/admin/stats');
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.message,
        status: error.response?.status,
      };
    }
  },

  // Export Data
  exportData: async (type) => {
    try {
      const response = await api.get(`/admin/export/${type}`, {
        responseType: 'blob',
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.message,
        status: error.response?.status,
      };
    }
  },

  // Project Analytics
  getProjectAnalytics: async (projectId, timeRange = '7d') => {
    try {
      const response = await api.get(`/admin/projects/${projectId}/analytics?range=${timeRange}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.message,
        status: error.response?.status,
      };
    }
  },

  // Project Usage
  getProjectUsage: async (projectId) => {
    try {
      const response = await api.get(`/admin/projects/${projectId}/usage`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.message,
        status: error.response?.status,
      };
    }
  },
};

export default adminApi;
