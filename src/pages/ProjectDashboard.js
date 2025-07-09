import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../services/adminService';
import styles from './ProjectDashboard.module.css';

const ProjectDashboard = ({ onLogout }) => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // ✅ Enhanced project creation with event emission
  const handleCreateProject = async (formData) => {
    try {
      console.log('🔄 Creating project with data:', formData);
      
      const response = await adminService.createProject(formData);
      console.log('✅ Project created successfully:', response);
      
      // Update local state
      if (response && response.project) {
        setProjects(prev => [response.project, ...prev]);
      }
      
      // Close modal
      setShowCreateModal(false);
      
      // ✅ Emit custom event to notify other components
      const projectCreatedEvent = new CustomEvent('projectCreated', {
        detail: { project: response.project }
      });
      window.dispatchEvent(projectCreatedEvent);
      
      // Show success message
      alert('Project created successfully!');
      
      // ✅ Refresh projects list
      await fetchProjects();
      
    } catch (error) {
      console.error('❌ Failed to create project:', error);
      
      const errorMessage = error.response?.data?.error || 'Failed to create project';
      alert(`Error: ${errorMessage}`);
    }
  };

  // ✅ Enhanced project deletion with event emission
  const handleDeleteProject = async (projectId) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      console.log('🗑️ Deleting project:', projectId);
      
      await adminService.deleteProject(projectId);
      console.log('✅ Project deleted successfully');
      
      // Update local state
      setProjects(prev => prev.filter(p => p.project_id !== projectId));
      
      // ✅ Emit custom event
      const projectDeletedEvent = new CustomEvent('projectDeleted', {
        detail: { projectId }
      });
      window.dispatchEvent(projectDeletedEvent);
      
      alert('Project deleted successfully!');
      
    } catch (error) {
      console.error('❌ Failed to delete project:', error);
      alert(`Error: ${error.response?.data?.error || 'Failed to delete project'}`);
    }
  };

  // ✅ Enhanced project status update with event emission
  const handleStatusChange = async (projectId, newStatus) => {
    try {
      console.log('🔄 Updating project status:', projectId, newStatus);
      
      await adminService.updateProjectStatus(projectId, newStatus);
      console.log('✅ Project status updated successfully');
      
      // Update local state
      setProjects(prev => prev.map(p => 
        p.project_id === projectId ? { ...p, status: newStatus } : p
      ));
      
      // ✅ Emit custom event
      const projectUpdatedEvent = new CustomEvent('projectUpdated', {
        detail: { projectId, status: newStatus }
      });
      window.dispatchEvent(projectUpdatedEvent);
      
      alert(`Project ${newStatus} successfully!`);
      
    } catch (error) {
      console.error('❌ Failed to update project status:', error);
      alert(`Error: ${error.response?.data?.error || 'Failed to update project status'}`);
    }
  };

  // ✅ Enhanced fetch projects function
  const fetchProjects = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching projects...');
      
      const response = await adminService.getProjects();
      console.log('📋 Projects fetched:', response);
      
      if (response && response.projects) {
        setProjects(response.projects);
        console.log('✅ Projects set in state:', response.projects.length);
      }
      
    } catch (error) {
      console.error('❌ Failed to fetch projects:', error);
      
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ Initial fetch
  useEffect(() => {
    fetchProjects();
  }, []);

  // Rest of your component...
};

export default ProjectDashboard;
