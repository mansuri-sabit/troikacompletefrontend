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
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ===== DASHBOARD SERVICES =====

export const getDashboardStats = async (timeRange = '7d') => {
  try {
    const response = await api.get('/admin/dashboard', {
      params: { range: timeRange }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch dashboard stats:', error);
    throw error;
  }
};

export const getSystemStats = async () => {
  try {
    const response = await api.get('/admin/stats');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch system stats:', error);
    throw error;
  }
};

export const getNotifications = async (unreadOnly = false) => {
  try {
    const response = await api.get('/admin/notifications', {
      params: { unread: unreadOnly }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
    throw error;
  }
};

// ===== PROJECT SERVICES =====

export const getProjects = async (params = {}) => {
  try {
    const response = await api.get('/admin/projects', { params });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch projects:', error);
    throw error;
  }
};

export const getProject = async (projectId) => {
  try {
    const response = await api.get(`/admin/projects/${projectId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch project:', error);
    throw error;
  }
};

export const createProject = async (projectData) => {
  try {
    const response = await api.post('/admin/projects', projectData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Failed to create project:', error);
    throw error;
  }
};

export const updateProject = async (projectId, projectData) => {
  try {
    const response = await api.patch(`/admin/projects/${projectId}`, projectData);
    return response.data;
  } catch (error) {
    console.error('Failed to update project:', error);
    throw error;
  }
};

export const deleteProject = async (projectId) => {
  try {
    const response = await api.delete(`/admin/projects/${projectId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to delete project:', error);
    throw error;
  }
};

export const updateProjectStatus = async (projectId, status) => {
  try {
    const response = await api.patch(`/admin/projects/${projectId}/status`, { status });
    return response.data;
  } catch (error) {
    console.error('Failed to update project status:', error);
    throw error;
  }
};

export const suspendProject = async (projectId) => {
  try {
    const response = await api.post(`/admin/projects/${projectId}/suspend`);
    return response.data;
  } catch (error) {
    console.error('Failed to suspend project:', error);
    throw error;
  }
};

export const reactivateProject = async (projectId) => {
  try {
    const response = await api.post(`/admin/projects/${projectId}/reactivate`);
    return response.data;
  } catch (error) {
    console.error('Failed to reactivate project:', error);
    throw error;
  }
};

// ===== PROJECT ANALYTICS SERVICES =====

export const getProjectUsage = async (projectId, timeRange = '7d') => {
  try {
    const response = await api.get(`/admin/projects/${projectId}/usage`, {
      params: { range: timeRange }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch project usage:', error);
    throw error;
  }
};

export const getProjectAnalytics = async (projectId, timeRange = '7d') => {
  try {
    const response = await api.get(`/admin/projects/${projectId}/analytics`, {
      params: { range: timeRange }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch project analytics:', error);
    throw error;
  }
};

export const updateTokenLimit = async (projectId, limit) => {
  try {
    const response = await api.post(`/admin/projects/${projectId}/limit`, { limit });
    return response.data;
  } catch (error) {
    console.error('Failed to update token limit:', error);
    throw error;
  }
};

export const resetTokenUsage = async (projectId) => {
  try {
    const response = await api.post(`/admin/projects/${projectId}/usage/reset`);
    return response.data;
  } catch (error) {
    console.error('Failed to reset token usage:', error);
    throw error;
  }
};

// ===== EMBED & WIDGET SERVICES =====

export const getEmbedCode = async (projectId) => {
  try {
    const response = await api.get(`/admin/projects/${projectId}/embed`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch embed code:', error);
    throw error;
  }
};

export const regenerateEmbedCode = async (projectId) => {
  try {
    const response = await api.post(`/admin/projects/${projectId}/embed/regenerate`);
    return response.data;
  } catch (error) {
    console.error('Failed to regenerate embed code:', error);
    throw error;
  }
};

// ===== CHAT SERVICES =====

export const getChatHistory = async (projectId, sessionId = null) => {
  try {
    const params = sessionId ? { session_id: sessionId } : {};
    const response = await api.get(`/projects/${projectId}/history`, { params });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch chat history:', error);
    throw error;
  }
};

export const sendChatMessage = async (projectId, messageData) => {
  try {
    const response = await api.post(`/projects/${projectId}/chat`, messageData);
    return response.data;
  } catch (error) {
    console.error('Failed to send chat message:', error);
    throw error;
  }
};

export const rateMessage = async (projectId, messageId, rating) => {
  try {
    const response = await api.post(`/projects/${projectId}/messages/${messageId}/rate`, {
      rating,
      session_id: `admin_${Date.now()}`
    });
    return response.data;
  } catch (error) {
    console.error('Failed to rate message:', error);
    throw error;
  }
};

// ===== SUBSCRIPTION SERVICES =====

export const getSubscriptionStatus = async (projectId) => {
  try {
    const response = await api.get(`/projects/${projectId}/subscription`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch subscription status:', error);
    throw error;
  }
};

export const renewProject = async (projectId) => {
  try {
    const response = await api.post(`/admin/projects/${projectId}/renew`);
    return response.data;
  } catch (error) {
    console.error('Failed to renew project:', error);
    throw error;
  }
};

// ===== NOTIFICATION SERVICES =====

export const getProjectNotifications = async (projectId) => {
  try {
    const response = await api.get(`/admin/projects/${projectId}/notifications`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch project notifications:', error);
    throw error;
  }
};

export const sendTestNotification = async (projectId) => {
  try {
    const response = await api.post(`/admin/projects/${projectId}/notifications/test`);
    return response.data;
  } catch (error) {
    console.error('Failed to send test notification:', error);
    throw error;
  }
};

// ===== EXPORT SERVICES =====

export const exportData = async (type, format = 'csv') => {
  try {
    const response = await api.get(`/admin/export/${type}`, {
      params: { format },
      responseType: 'blob'
    });
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${type}_export_${new Date().toISOString().split('T')[0]}.${format}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    return { success: true };
  } catch (error) {
    console.error('Failed to export data:', error);
    throw error;
  }
};

// ===== USER SERVICES =====

export const getUserProfile = async () => {
  try {
    const response = await api.get('/user/profile');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch user profile:', error);
    throw error;
  }
};

export const updateUserProfile = async (profileData) => {
  try {
    const response = await api.put('/user/profile', profileData);
    return response.data;
  } catch (error) {
    console.error('Failed to update user profile:', error);
    throw error;
  }
};

export const changePassword = async (passwordData) => {
  try {
    const response = await api.post('/user/change-password', passwordData);
    return response.data;
  } catch (error) {
    console.error('Failed to change password:', error);
    throw error;
  }
};

// ===== HEALTH CHECK SERVICES =====

export const healthCheck = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    console.error('Health check failed:', error);
    throw error;
  }
};

export const pingTest = async () => {
  try {
    const response = await api.get('/ping');
    return response.data;
  } catch (error) {
    console.error('Ping test failed:', error);
    throw error;
  }
};

export default api;
