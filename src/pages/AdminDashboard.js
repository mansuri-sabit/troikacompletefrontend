import React, { useState, useEffect, useCallback } from 'react';
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
  Clock
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
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
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
  const [recentActivity, setRecentActivity] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [analyticsData, setAnalyticsData] = useState({
    usageChart: [],
    revenueChart: [],
    statusDistribution: []
  });

  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');
  const [searchTerm, setSearchTerm] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [error, setError] = useState(null);

  // Data Fetching Functions
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch all dashboard data in parallel
      const [
        statsResponse,
        projectsResponse,
        activityResponse,
        notificationsResponse,
        analyticsResponse
      ] = await Promise.all([
        adminService.getDashboardStats(timeRange),
        adminService.getProjects({ limit: 5, sort: 'created_at', order: 'desc' }),
        adminService.getRecentActivity(10),
        adminService.getNotifications(true),
        adminService.getSystemAnalytics(timeRange)
      ]);

      setStats(statsResponse.stats || {});
      setProjects(projectsResponse.projects || []);
      setRecentActivity(activityResponse.activities || []);
      setNotifications(notificationsResponse.notifications || []);
      setAnalyticsData({
        usageChart: analyticsResponse.usageChart || [],
        revenueChart: analyticsResponse.revenueChart || [],
        statusDistribution: analyticsResponse.statusDistribution || []
      });

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  const refreshData = useCallback(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

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
      const blob = await adminService.exportData(type, 'csv');
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    }
  };

  const handleNotificationClick = async (notification) => {
    try {
      await adminService.markNotificationRead(notification.id);
      setNotifications(prev => 
        prev.map(n => n.id === notification.id ? { ...n, unread: false } : n)
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
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
    const usagePercent = project.monthly_token_limit > 0 
      ? (project.total_tokens_used / project.monthly_token_limit) * 100 
      : 0;

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
              {project.total_tokens_used?.toLocaleString() || 0} / {project.monthly_token_limit?.toLocaleString() || 0}
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
          {project.created_at ? new Date(project.created_at).toLocaleDateString() : 'N/A'}
        </td>
        <td className={`${styles.tableCell} ${styles.actions}`}>
          <button 
            className={styles.actionBtn}
            onClick={() => navigate(`/admin/projects/${project.project_id}`)}
          >
            View
          </button>
        </td>
      </tr>
    );
  };

  const ActivityItem = ({ activity }) => (
    <div className={styles.activityItem}>
      <div className={`${styles.activityIcon} ${styles[activity.type]}`}>
        {activity.type === 'project_created' && <Plus size={16} />}
        {activity.type === 'user_registered' && <Users size={16} />}
        {activity.type === 'token_limit_reached' && <AlertTriangle size={16} />}
        {activity.type === 'project_updated' && <Settings size={16} />}
      </div>
      <div className={styles.activityContent}>
        <p className={styles.activityMessage}>{activity.message}</p>
        <p className={styles.activityTime}>
          {activity.timestamp ? new Date(activity.timestamp).toLocaleString() : 'Recently'}
        </p>
      </div>
    </div>
  );

  // Effects
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  // Loading State
  if (loading && !stats.totalProjects) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingContent}>
          <RefreshCw className={styles.loadingIcon} />
          <span className={styles.loadingText}>Loading dashboard...</span>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorContent}>
          <AlertTriangle className={styles.errorIcon} />
          <h2>Error Loading Dashboard</h2>
          <p>{error}</p>
          <button onClick={refreshData} className={styles.retryButton}>
            <RefreshCw size={16} />
            Retry
          </button>
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
                onClick={refreshData}
                disabled={loading}
                title="Refresh Data"
              >
                <RefreshCw className={`${styles.buttonIcon} ${loading ? styles.spinning : ''}`} />
              </button>

              <div className={styles.notificationContainer}>
                <button 
                  className={styles.notificationBtn}
                  onClick={() => setShowNotifications(!showNotifications)}
                >
                  <Bell className={styles.buttonIcon} />
                  {notifications.filter(n => n.unread).length > 0 && (
                    <span className={styles.notificationBadge}>
                      {notifications.filter(n => n.unread).length}
                    </span>
                  )}
                </button>
                
                {showNotifications && (
                  <div className={styles.notificationDropdown}>
                    <div className={styles.notificationHeader}>
                      <h3>Notifications</h3>
                    </div>
                    <div className={styles.notificationList}>
                      {notifications.length > 0 ? (
                        notifications.map(notification => (
                          <div 
                            key={notification.id} 
                            className={`${styles.notificationItem} ${notification.unread ? styles.unread : ''}`}
                            onClick={() => handleNotificationClick(notification)}
                          >
                            <div className={`${styles.notificationIcon} ${styles[notification.type]}`}>
                              {notification.type === 'warning' && <AlertTriangle size={16} />}
                              {notification.type === 'info' && <Bell size={16} />}
                              {notification.type === 'success' && <CheckCircle size={16} />}
                            </div>
                            <div className={styles.notificationContent}>
                              <p>{notification.message}</p>
                              <span className={styles.notificationTime}>
                                {notification.created_at ? new Date(notification.created_at).toLocaleString() : 'Recently'}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className={styles.noNotifications}>
                          <p>No notifications</p>
                        </div>
                      )}
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
            value={stats.totalProjects || 0}
            icon={MessageSquare}
            change={stats.projectsGrowth}
            changeType="positive"
            color="blue"
            onClick={handleViewAllProjects}
          />
          <StatCard
            title="Active Projects"
            value={stats.activeProjects || 0}
            icon={CheckCircle}
            change={stats.activeGrowth}
            changeType="positive"
            color="green"
            onClick={handleViewAllProjects}
          />
          <StatCard
            title="Monthly Revenue"
            value={`₹${(stats.monthlyRevenue || 0).toLocaleString()}`}
            icon={DollarSign}
            change={stats.revenueGrowth}
            changeType="positive"
            color="purple"
          />
          <StatCard
            title="API Calls Today"
            value={(stats.apiCalls || 0).toLocaleString()}
            icon={Activity}
            change={stats.apiGrowth}
            changeType="positive"
            color="orange"
          />
          <StatCard
            title="Avg Response Time"
            value={`${stats.avgResponseTime || 0}s`}
            icon={Clock}
            change={stats.responseTimeChange}
            changeType={stats.responseTimeChange?.includes('-') ? 'positive' : 'negative'}
            color="teal"
          />
          <StatCard
            title="Success Rate"
            value={`${stats.successRate || 0}%`}
            icon={CheckCircle}
            change={stats.successRateChange}
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
              <AreaChart data={analyticsData.usageChart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
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
              <PieChart>
                <Pie
                  data={analyticsData.statusDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {analyticsData.statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
              </PieChart>
            </ResponsiveContainer>
            <div className={styles.chartLegend}>
              {analyticsData.statusDistribution.map((item, index) => (
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
            <LineChart data={analyticsData.revenueChart}>
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

        {/* Main Content Grid */}
        <div className={styles.mainGrid}>
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
              {projects.length > 0 ? (
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
                        project.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        project.project_id?.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map((project) => (
                        <ProjectRow key={project.id || project.project_id} project={project} />
                      ))}
                  </tbody>
                </table>
              ) : (
                <div className={styles.emptyState}>
                  <MessageSquare size={48} />
                  <h3>No projects found</h3>
                  <p>Create your first project to get started</p>
                  <button className={styles.createBtn} onClick={handleCreateProject}>
                    <Plus size={16} />
                    Create Project
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className={styles.activityCard}>
            <div className={styles.activityHeader}>
              <h3 className={styles.activityTitle}>Recent Activity</h3>
              <button className={styles.viewAllBtn}>View All</button>
            </div>
            <div className={styles.activityList}>
              {recentActivity.length > 0 ? (
                recentActivity.map((activity, index) => (
                  <ActivityItem key={activity.id || index} activity={activity} />
                ))
              ) : (
                <div className={styles.emptyState}>
                  <Activity size={32} />
                  <p>No recent activity</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className={styles.quickActions}>
          <div className={styles.actionCard} onClick={handleCreateProject}>
            <MessageSquare className={styles.actionIcon} />
            <h4 className={styles.actionTitle}>Create New Project</h4>
            <p className={styles.actionDescription}>Set up a new chatbot project</p>
          </div>
          
          <div className={styles.actionCard}>
            <AlertTriangle className={styles.actionIcon} />
            <h4 className={styles.actionTitle}>Expiring Soon</h4>
            <p className={styles.actionDescription}>
              {stats.expiringSoon || 0} projects expiring in next 7 days
            </p>
          </div>
          
          <div className={styles.actionCard}>
            <XCircle className={styles.actionIcon} />
            <h4 className={styles.actionTitle}>High Usage</h4>
            <p className={styles.actionDescription}>
              {stats.highUsage || 0} projects over 80% token limit
            </p>
          </div>
          
          <div className={styles.actionCard}>
            <Settings className={styles.actionIcon} />
            <h4 className={styles.actionTitle}>System Health</h4>
            <p className={styles.actionDescription}>
              {stats.systemHealth || 'All services operational'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
