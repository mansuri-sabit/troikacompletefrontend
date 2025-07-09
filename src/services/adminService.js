import api from './api';

export const adminService = {
  // Dashboard Statistics
  getDashboardStats: async (timeRange = '7d') => {
    const response = await api.get(`/admin/stats?range=${timeRange}`);
    return response.data;
  },

  // Projects
  getProjects: async (params = {}) => {
    const response = await api.get('/admin/projects', { params });
    return response.data;
  },

  getProject: async (projectId) => {
    const response = await api.get(`/admin/projects/${projectId}`);
    return response.data;
  },

  createProject: async (projectData) => {
    const response = await api.post('/admin/projects', projectData);
    return response.data;
  },

  updateProject: async (projectId, projectData) => {
    const response = await api.patch(`/admin/projects/${projectId}`, projectData);
    return response.data;
  },

  deleteProject: async (projectId) => {
    const response = await api.delete(`/admin/projects/${projectId}`);
    return response.data;
  },

  updateProjectStatus: async (projectId, status) => {
    const response = await api.patch(`/admin/projects/${projectId}/status`, { status });
    return response.data;
  },

  // Usage and Analytics
  getProjectUsage: async (projectId) => {
    const response = await api.get(`/admin/projects/${projectId}/usage`);
    return response.data;
  },

  getSystemAnalytics: async (timeRange = '7d') => {
    const response = await api.get(`/admin/analytics?range=${timeRange}`);
    return response.data;
  },

  // Notifications
  getNotifications: async (unreadOnly = false) => {
    const response = await api.get(`/admin/notifications?unread=${unreadOnly}`);
    return response.data;
  },

  markNotificationRead: async (notificationId) => {
    const response = await api.patch(`/admin/notifications/${notificationId}/read`);
    return response.data;
  },

  // Export functionality
  exportData: async (type, format = 'csv') => {
    const response = await api.get(`/admin/export/${type}`, {
      params: { format },
      responseType: 'blob'
    });
    return response.data;
  },

  // Recent Activity
  getRecentActivity: async (limit = 10) => {
    const response = await api.get(`/admin/activity?limit=${limit}`);
    return response.data;
  }
};
