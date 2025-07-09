import api from './api';

export const adminService = {
  // ✅ Enhanced dashboard stats with retry logic
  getDashboardStats: async (timeRange = '7d', retries = 3) => {
    for (let i = 0; i < retries; i++) {
      try {
        console.log(`🔄 Fetching dashboard stats (attempt ${i + 1}/${retries})`);
        
        const response = await api.get('/admin/dashboard', {
          params: { range: timeRange }
        });
        
        console.log('✅ Dashboard stats fetched successfully:', response.data);
        return response.data;
        
      } catch (error) {
        console.error(`❌ Dashboard stats fetch failed (attempt ${i + 1}):`, error);
        
        if (i === retries - 1) throw error;
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
  },

  // ✅ Enhanced projects fetch with retry logic
  getProjects: async (params = {}, retries = 3) => {
    for (let i = 0; i < retries; i++) {
      try {
        console.log(`🔄 Fetching projects (attempt ${i + 1}/${retries}):`, params);
        
        const response = await api.get('/admin/projects', { params });
        
        console.log('✅ Projects fetched successfully:', response.data);
        return response.data;
        
      } catch (error) {
        console.error(`❌ Projects fetch failed (attempt ${i + 1}):`, error);
        
        if (i === retries - 1) throw error;
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
  },

  // ✅ Enhanced project creation with validation
  createProject: async (projectData) => {
    try {
      console.log('🔄 Creating project with data:', projectData);
      
      // Validate required fields
      if (!projectData.get || !projectData.get('name')) {
        throw new Error('Project name is required');
      }
      
      const response = await api.post('/admin/projects', projectData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000, // 30 seconds for file uploads
      });
      
      console.log('✅ Project created successfully:', response.data);
      return response.data;
      
    } catch (error) {
      console.error('❌ Project creation failed:', error);
      throw error;
    }
  },

  // ✅ Enhanced notifications fetch
  getNotifications: async (unreadOnly = false) => {
    try {
      console.log('🔄 Fetching notifications, unread only:', unreadOnly);
      
      const response = await api.get('/admin/notifications', {
        params: { unread: unreadOnly }
      });
      
      console.log('✅ Notifications fetched successfully:', response.data);
      return response.data;
      
    } catch (error) {
      console.error('❌ Notifications fetch failed:', error);
      
      // Return empty notifications on error to prevent UI breaks
      return { notifications: [] };
    }
  },

  // ✅ Enhanced project status update
  updateProjectStatus: async (projectId, status) => {
    try {
      console.log('🔄 Updating project status:', projectId, status);
      
      const response = await api.patch(`/admin/projects/${projectId}/status`, { status });
      
      console.log('✅ Project status updated successfully:', response.data);
      return response.data;
      
    } catch (error) {
      console.error('❌ Project status update failed:', error);
      throw error;
    }
  },

  // ✅ Enhanced project deletion
  deleteProject: async (projectId) => {
    try {
      console.log('🔄 Deleting project:', projectId);
      
      const response = await api.delete(`/admin/projects/${projectId}`);
      
      console.log('✅ Project deleted successfully:', response.data);
      return response.data;
      
    } catch (error) {
      console.error('❌ Project deletion failed:', error);
      throw error;
    }
  }
};
