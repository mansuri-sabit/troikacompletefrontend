import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../services/adminService';
import styles from './AdminDashboard.module.css';

const AdminDashboard = ({ onLogout }) => {
  const navigate = useNavigate();
  
  // State Management
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    totalUsers: 0,
    monthlyRevenue: 0,
    tokensUsed: 0,
    apiCalls: 0,
    avgResponseTime: 0,
    successRate: 0
  });

  const [projects, setProjects] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');
  const [refreshing, setRefreshing] = useState(false);

  // ✅ Enhanced data fetching with proper error handling
  const fetchDashboardData = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setRefreshing(true);
    
    try {
      console.log('🔄 Fetching dashboard data...');
      
      // Fetch dashboard stats
      const statsResponse = await adminService.getDashboardStats(timeRange);
      console.log('📊 Stats response:', statsResponse);
      
      if (statsResponse && statsResponse.stats) {
        setStats(statsResponse.stats);
      }

      // Fetch recent projects
      const projectsResponse = await adminService.getProjects({ limit: 5 });
      console.log('📋 Projects response:', projectsResponse);
      
      if (projectsResponse && projectsResponse.projects) {
        setProjects(projectsResponse.projects);
      }

      // Fetch notifications
      const notificationsResponse = await adminService.getNotifications(true);
      console.log('🔔 Notifications response:', notificationsResponse);
      
      if (notificationsResponse && notificationsResponse.notifications) {
        setNotifications(notificationsResponse.notifications);
      }

      console.log('✅ Dashboard data fetched successfully');
      
    } catch (error) {
      console.error('❌ Failed to fetch dashboard data:', error);
      
      // Show user-friendly error message
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [timeRange, navigate]);

  // ✅ Manual refresh function
  const handleRefresh = useCallback(async () => {
    await fetchDashboardData(false);
  }, [fetchDashboardData]);

  // ✅ Navigation with data refresh
  const handleCreateProject = useCallback(() => {
    console.log('🔄 Navigating to create project...');
    navigate('/admin/projects');
  }, [navigate]);

  const handleViewAllProjects = useCallback(() => {
    console.log('🔄 Navigating to all projects...');
    navigate('/admin/projects');
  }, [navigate]);

  // ✅ Listen for project creation events
  useEffect(() => {
    const handleProjectCreated = () => {
      console.log('🎉 Project created event received, refreshing dashboard...');
      fetchDashboardData(false);
    };

    // Listen for custom events
    window.addEventListener('projectCreated', handleProjectCreated);
    window.addEventListener('projectUpdated', handleProjectCreated);
    window.addEventListener('projectDeleted', handleProjectCreated);

    return () => {
      window.removeEventListener('projectCreated', handleProjectCreated);
      window.removeEventListener('projectUpdated', handleProjectCreated);
      window.removeEventListener('projectDeleted', handleProjectCreated);
    };
  }, [fetchDashboardData]);

  // ✅ Initial data fetch
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // ✅ Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!document.hidden) { // Only refresh if tab is active
        fetchDashboardData(false);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  // ✅ Refresh when time range changes
  useEffect(() => {
    fetchDashboardData(false);
  }, [timeRange, fetchDashboardData]);

  // Rest of your component remains the same...
  return (
    <div className={styles.dashboard}>
      {/* Your existing JSX */}
    </div>
  );
};

export default AdminDashboard;
