const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://completetroikabackend.onrender.com/api';

class AdminService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  async fetchDashboardStats(timeRange = '7d') {
    try {
      const response = await fetch(`${this.baseURL}/admin/dashboard?range=${timeRange}`, {
        headers: this.getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      throw error;
    }
  }

  async fetchProjects(limit = null) {
    try {
      const url = limit ? `${this.baseURL}/admin/projects?limit=${limit}` : `${this.baseURL}/admin/projects`;
      const response = await fetch(url, {
        headers: this.getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      throw error;
    }
  }

  async fetchNotifications(unreadOnly = true) {
    try {
      const url = `${this.baseURL}/admin/notifications${unreadOnly ? '?unread=true' : ''}`;
      const response = await fetch(url, {
        headers: this.getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      throw error;
    }
  }

  async exportData(type) {
    try {
      const response = await fetch(`${this.baseURL}/admin/export/${type}`, {
        headers: this.getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.blob();
    } catch (error) {
      console.error('Failed to export data:', error);
      throw error;
    }
  }

  async createProject(projectData) {
    try {
      const response = await fetch(`${this.baseURL}/admin/projects`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(projectData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to create project:', error);
      throw error;
    }
  }

  async updateProject(projectId, projectData) {
    try {
      const response = await fetch(`${this.baseURL}/admin/projects/${projectId}`, {
        method: 'PATCH',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(projectData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to update project:', error);
      throw error;
    }
  }

  async deleteProject(projectId) {
    try {
      const response = await fetch(`${this.baseURL}/admin/projects/${projectId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to delete project:', error);
      throw error;
    }
  }

  async updateProjectStatus(projectId, status) {
    try {
      const response = await fetch(`${this.baseURL}/admin/projects/${projectId}/status`, {
        method: 'PATCH',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ status })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to update project status:', error);
      throw error;
    }
  }
}

export default new AdminService();
