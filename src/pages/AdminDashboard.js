import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  MessageSquare, 
  DollarSign, 
  TrendingUp, 
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Settings,
  Plus,
  Search,
  Download,
  RefreshCw,
  LogOut,
  Bell,
  Clock,
  Eye,
  Trash2
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { adminApi } from '../services/adminApi';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);

  // Chart Data
  const usageData = [
    { name: 'Mon', tokens: 12000, cost: 24.50, requests: 450 },
    { name: 'Tue', tokens: 15000, cost: 30.75, requests: 520 },
    { name: 'Wed', tokens: 18000, cost: 36.20, requests: 680 },
    { name: 'Thu', tokens: 14000, cost: 28.90, requests: 390 },
    { name: 'Fri', tokens: 22000, cost: 45.10, requests: 750 },
    { name: 'Sat', tokens: 16000, cost: 32.80, requests: 480 },
    { name: 'Sun', tokens: 19000, cost: 38.95, requests: 620 }
  ];

  const projectStatusData = [
    { name: 'Active', value: 65, color: '#10B981' },
    { name: 'Suspended', value: 15, color: '#F59E0B' },
    { name: 'Expired', value: 20, color: '#EF4444' }
  ];

  const revenueData = [
    { month: 'Jan', revenue: 12000, subscriptions: 45, growth: 5.2 },
    { month: 'Feb', revenue: 15000, subscriptions: 52, growth: 8.1 },
    { month: 'Mar', revenue: 18000, subscriptions: 61, growth: 12.3 },
    { month: 'Apr', revenue: 22000, subscriptions: 68, growth: 15.7 },
    { month: 'May', revenue: 25000, subscriptions: 75, growth: 18.9 },
    { month: 'Jun', revenue: 28000, subscriptions: 82, growth: 22.1 }
  ];

  // Authentication Check
  const checkAuthToken = () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (!token || !user) {
      navigate('/login');
      return false;
    }
    
    try {
      const userData = JSON.parse(user);
      if (userData.role !== 'admin') {
        navigate('/login');
        return false;
      }
      return true;
    } catch (error) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
      return false;
    }
  };

  // Data Fetching Functions using Axios Services
  const fetchDashboardData = async () => {
    if (!checkAuthToken()) return;
    
    setLoading(true);
    try {
      // Fetch dashboard statistics using axios service
      const statsResult = await adminApi.getDashboardStats(timeRange);
      if (statsResult.success) {
        setStats(statsResult.data.stats || {});
      } else {
        console.error('Failed to fetch stats:', statsResult.error);
      }

      // Fetch recent projects using axios service
      const projectsResult = await adminApi.getProjects(5);
      if (projectsResult.success) {
        setProjects(projectsResult.data.projects || []);
      } else {
        console.error('Failed to fetch projects:', projectsResult.error);
      }

      // Fetch notifications using axios service
      const notificationsResult = await adminApi.getNotifications(true);
      if (notificationsResult.success) {
        setNotifications(notificationsResult.data.notifications || []);
      } else {
        console.error('Failed to fetch notifications:', notificationsResult.error);
      }

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      // Set mock data for development
      setStats({
        totalProjects: 156,
        activeProjects: 142,
        totalUsers: 1247,
        monthlyRevenue: 28500,
        tokensUsed: 2847392,
        apiCalls: 45782,
        avgResponseTime: 1.2,
        successRate: 98.5
      });
      
      setProjects([
        { 
          id: 1, 
          project_id: 'proj_1704067200_abc123',
          name: 'TechCorp Chatbot', 
          status: 'active', 
          total_tokens_used: 45000, 
          monthly_token_limit: 100000,
          created_at: new Date().toISOString(),
          client_email: 'admin@techcorp.com'
        },
        { 
          id: 2, 
          project_id: 'proj_1704067300_def456',
          name: 'E-commerce Support', 
          status: 'active', 
          total_tokens_used: 78000, 
          monthly_token_limit: 100000,
          created_at: new Date().toISOString(),
          client_email: 'support@ecommerce.com'
        }
      ]);

      setNotifications([
        { id: 1, type: 'warning', message: '3 projects expiring in 7 days', unread: true },
        { id: 2, type: 'info', message: 'System maintenance scheduled for tomorrow', unread: true }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Project Management Functions using Axios Services
  const handleProjectStatusChange = async (projectId, newStatus) => {
    try {
      const result = await adminApi.updateProjectStatus(projectId, newStatus);
      
      if (result.success) {
        setProjects(projects.map(p => 
          p.project_id === projectId ? { ...p, status: newStatus } : p
        ));
        alert(`Project ${newStatus} successfully!`);
        fetchDashboardData(); // Refresh stats
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Error updating project status:', error);
      alert('Failed to update project status');
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;

    try {
      const result = await adminApi.deleteProject(projectId);
      
      if (result.success) {
        setProjects(projects.filter(p => p.project_id !== projectId));
        alert('Project deleted successfully!');
        fetchDashboardData(); // Refresh stats
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Failed to delete project');
    }
  };

  // Navigation Functions
  const handleCreateProject = () => {
    navigate('/admin/projects');
  };

  const handleViewAllProjects = () => {
    navigate('/admin/projects');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (onLogout) onLogout();
    navigate('/login');
  };

  const handleExportData = async (type) => {
    try {
      const result = await adminApi.exportData(type);
      
      if (result.success) {
        const url = window.URL.createObjectURL(result.data);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${type}_export_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
        alert(`Export failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    }
  };

  // Component Functions
  const StatCard = ({ title, value, icon: Icon, change, changeType, color = "blue", onClick }) => (
    <div 
      className={`${styles.statCard} ${onClick ? styles.clickable : ''}`}
      onClick={onClick}
    >
      <div className={styles.statCardContent}>
        <div className={styles.statInfo}>
          <p className={styles.statTitle}>{title}</p>
          <p className={styles.statValue}>{value}</p>
          {change && (
            <p className={`${styles.statChange} ${changeType === 'positive' ? styles.positive : styles.negative}`}>
              <TrendingUp className={styles.trendIcon} />
              {change}
            </p>
          )}
        </div>
        <div className={`${styles.iconContainer} ${styles[color]}`}>
          <Icon className={styles.icon} />
        </div>
      </div>
    </div>
  );

  const ProjectRow = ({ project }) => {
    const usagePercent = (project.total_tokens_used / project.monthly_token_limit) * 100;

    return (
      <tr className={styles.tableRow}>
        <td className={styles.tableCell}>
          <div className={styles.projectInfo}>
            <div className={styles.projectName}>{project.name}</div>
            <div className={styles.projectId}>{project.project_id}</div>
          </div>
        </td>
        <td className={styles.tableCell}>
          <span className={`${styles.statusBadge} ${styles[project.status]}`}>
            {project.status}
          </span>
        </td>
        <td className={styles.tableCell}>
          <div className={styles.usageInfo}>
            <div className={styles.usageText}>
              {project.total_tokens_used.toLocaleString()} / {project.monthly_token_limit.toLocaleString()}
            </div>
            <div className={styles.progressBar}>
              <div 
                className={`${styles.progressFill} ${
                  usagePercent > 80 ? styles.danger : 
                  usagePercent > 60 ? styles.warning : 
                  styles.success
                }`}
                style={{ width: `${Math.min(usagePercent, 100)}%` }}
              />
            </div>
          </div>
        </td>
        <td className={styles.tableCell}>
          {new Date(project.created_at).toLocaleDateString()}
        </td>
        <td className={`${styles.tableCell} ${styles.actions}`}>
          <button 
            className={styles.actionBtn}
            onClick={() => navigate(`/admin/projects/${project.project_id}`)}
            title="View Details"
          >
            <Eye size={16} />
          </button>
          <button 
            className={styles.actionBtn}
            onClick={() => handleProjectStatusChange(
              project.project_id, 
              project.status === 'active' ? 'suspended' : 'active'
            )}
            title={project.status === 'active' ? 'Suspend' : 'Activate'}
          >
            <Settings size={16} />
          </button>
          <button 
            className={`${styles.actionBtn} ${styles.danger}`}
            onClick={() => handleDeleteProject(project.project_id)}
            title="Delete Project"
          >
            <Trash2 size={16} />
          </button>
        </td>
      </tr>
    );
  };

  // Effects
  useEffect(() => {
    if (!checkAuthToken()) return;
    fetchDashboardData();
  }, [timeRange]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (checkAuthToken()) {
        fetchDashboardData();
      }
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Loading State
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingContent}>
          <RefreshCw className={styles.loadingIcon} />
          <span className={styles.loadingText}>Loading dashboard...</span>
        </div>
      </div>
    );
  }

  // Main Render
  return (
    <div className={styles.dashboard}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <h1 className={styles.title}>Admin Dashboard</h1>
            <p className={styles.subtitle}>Troika Tech Chatbot SaaS Management</p>
          </div>
          <div className={styles.headerRight}>
            <div className={styles.headerControls}>
              <select 
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className={styles.timeRangeSelect}
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
              
              <button 
                className={styles.refreshBtn}
                onClick={fetchDashboardData}
                title="Refresh Data"
              >
                <RefreshCw className={styles.buttonIcon} />
              </button>

              <div className={styles.notificationContainer}>
                <button 
                  className={styles.notificationBtn}
                  onClick={() => setShowNotifications(!showNotifications)}
                >
                  <Bell className={styles.buttonIcon} />
                  {notifications.length > 0 && (
                    <span className={styles.notificationBadge}>{notifications.length}</span>
                  )}
                </button>
                
                {showNotifications && (
                  <div className={styles.notificationDropdown}>
                    <div className={styles.notificationHeader}>
                      <h3>Notifications</h3>
                    </div>
                    <div className={styles.notificationList}>
                      {notifications.map(notification => (
                        <div key={notification.id} className={styles.notificationItem}>
                          <div className={`${styles.notificationIcon} ${styles[notification.type]}`}>
                            {notification.type === 'warning' && <AlertTriangle size={16} />}
                            {notification.type === 'info' && <Bell size={16} />}
                          </div>
                          <p>{notification.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button 
                className={styles.createBtn}
                onClick={handleCreateProject}
              >
                <Plus className={styles.buttonIcon} />
                New Project
              </button>

              <button 
                className={styles.logoutBtn}
                onClick={handleLogout}
                title="Logout"
              >
                <LogOut className={styles.buttonIcon} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.content}>
        {/* Stats Grid */}
        <div className={styles.statsGrid}>
          <StatCard
            title="Total Projects"
            value={stats.totalProjects}
            icon={MessageSquare}
            change="+12%"
            changeType="positive"
            color="blue"
            onClick={handleViewAllProjects}
          />
          <StatCard
            title="Active Projects"
            value={stats.activeProjects}
            icon={CheckCircle}
            change="+8%"
            changeType="positive"
            color="green"
            onClick={handleViewAllProjects}
          />
          <StatCard
            title="Monthly Revenue"
            value={`₹${stats.monthlyRevenue.toLocaleString()}`}
            icon={DollarSign}
            change="+15%"
            changeType="positive"
            color="purple"
          />
          <StatCard
            title="API Calls Today"
            value={stats.apiCalls.toLocaleString()}
            icon={Activity}
            change="+5%"
            changeType="positive"
            color="orange"
          />
          <StatCard
            title="Avg Response Time"
            value={`${stats.avgResponseTime}s`}
            icon={Clock}
            change="-0.2s"
            changeType="positive"
            color="teal"
          />
          <StatCard
            title="Success Rate"
            value={`${stats.successRate}%`}
            icon={CheckCircle}
            change="+0.5%"
            changeType="positive"
            color="green"
          />
        </div>

        {/* Charts Section */}
        <div className={styles.chartsSection}>
          {/* Token Usage Chart */}
          <div className={styles.chartCard}>
            <div className={styles.chartHeader}>
              <h3 className={styles.chartTitle}>Token Usage & API Calls</h3>
              <div className={styles.chartActions}>
                <button 
                  className={styles.exportBtn}
                  onClick={() => handleExportData('usage')}
                >
                  <Download className={styles.buttonIcon} />
                  Export
                </button>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={usageData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'tokens' ? `${value.toLocaleString()} tokens` : 
                    name === 'requests' ? `${value.toLocaleString()} requests` :
                    `₹${value}`,
                    name === 'tokens' ? 'Tokens Used' : 
                    name === 'requests' ? 'API Requests' : 'Cost'
                  ]}
                />
                <Area yAxisId="left" type="monotone" dataKey="tokens" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
                <Area yAxisId="right" type="monotone" dataKey="requests" stackId="2" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Project Status Distribution */}
          <div className={styles.chartCard}>
            <div className={styles.chartHeader}>
              <h3 className={styles.chartTitle}>Project Status Distribution</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={projectStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {projectStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
              </RechartsPieChart>
            </ResponsiveContainer>
            <div className={styles.chartLegend}>
              {projectStatusData.map((item, index) => (
                <div key={index} className={styles.legendItem}>
                  <div 
                    className={styles.legendColor}
                    style={{ backgroundColor: item.color }}
                  />
                  <span className={styles.legendText}>{item.name} ({item.value}%)</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Revenue Trend Chart */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h3 className={styles.chartTitle}>Revenue & Growth Trends</h3>
            <div className={styles.chartActions}>
              <button 
                className={styles.exportBtn}
                onClick={() => handleExportData('revenue')}
              >
                <Download className={styles.buttonIcon} />
                Export
              </button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Bar yAxisId="left" dataKey="revenue" fill="#3B82F6" />
              <Line yAxisId="right" type="monotone" dataKey="growth" stroke="#10B981" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Projects Table */}
        <div className={styles.tableCard}>
          <div className={styles.tableHeader}>
            <h3 className={styles.tableTitle}>Recent Projects</h3>
            <div className={styles.tableActions}>
              <div className={styles.searchContainer}>
                <Search className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={styles.searchInput}
                />
              </div>
              <button 
                className={styles.viewAllBtn}
                onClick={handleViewAllProjects}
              >
                View All
              </button>
            </div>
          </div>
          
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Status</th>
                  <th>Token Usage</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects
                  .filter(project => 
                    project.name.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((project) => (
                    <ProjectRow key={project.id} project={project} />
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
