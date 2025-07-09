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
  Filter,
  Calendar,
  BarChart3,
  PieChart,
  FileText,
  Clock,
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
import styles from './AdminDashboard.module.css';

const AdminDashboard = ({ onLogout }) => {
  const navigate = useNavigate();
  
  // ✅ Backend Live URL Configuration
  const API_BASE_URL = 'https://completetroikabackend.onrender.com/';
  
  // State Management
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    suspendedProjects: 0,
    expiredProjects: 0,
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
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');
  const [searchTerm, setSearchTerm] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);

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

  // ✅ Enhanced Data Fetching with Live Backend
  const fetchDashboardData = async () => {
    if (!checkAuthToken()) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      console.log('🔄 Fetching dashboard data from:', API_BASE_URL);
      
      // Fetch dashboard statistics
      const statsResponse = await fetch(`${API_BASE_URL}/api/admin/dashboard`, {
        headers
      });
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        console.log('✅ Dashboard stats received:', statsData);
        
        setStats({
          totalProjects: statsData.stats?.totalProjects || 0,
          activeProjects: statsData.stats?.activeProjects || 0,
          suspendedProjects: statsData.stats?.suspendedProjects || 0,
          expiredProjects: statsData.stats?.expiredProjects || 0,
          totalUsers: statsData.stats?.totalUsers || 0,
          monthlyRevenue: statsData.stats?.monthlyRevenue || 0,
          tokensUsed: statsData.stats?.tokensUsed || 0,
          apiCalls: statsData.stats?.apiCalls || 0,
          avgResponseTime: statsData.stats?.avgResponseTime || 0,
          successRate: statsData.stats?.successRate || 0
        });
        
        // Set projects from dashboard response
        if (statsData.projects) {
          setProjects(statsData.projects);
        }
      } else if (statsResponse.status === 401) {
        console.error('❌ Unauthorized access - redirecting to login');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
        return;
      } else {
        console.error('❌ Failed to fetch dashboard stats:', statsResponse.status);
      }

      // Fetch recent projects if not included in dashboard response
      try {
        const projectsResponse = await fetch(`${API_BASE_URL}/api/admin/projects?limit=5`, {
          headers
        });
        
        if (projectsResponse.ok) {
          const projectsData = await projectsResponse.json();
          setProjects(projectsData.projects || []);
          console.log('✅ Recent projects fetched:', projectsData.projects?.length || 0);
        }
      } catch (projectError) {
        console.error('⚠️ Failed to fetch recent projects:', projectError);
      }

      // Fetch notifications
      try {
        const notificationsResponse = await fetch(`${API_BASE_URL}/api/admin/notifications?unread=true`, {
          headers
        });
        
        if (notificationsResponse.ok) {
          const notificationsData = await notificationsResponse.json();
          setNotifications(notificationsData.notifications || []);
          console.log('✅ Notifications fetched:', notificationsData.notifications?.length || 0);
        }
      } catch (notifError) {
        console.error('⚠️ Failed to fetch notifications:', notifError);
      }

    } catch (error) {
      console.error('❌ Network error fetching dashboard data:', error);
      
      // Set fallback mock data for development
      setStats({
        totalProjects: 156,
        activeProjects: 142,
        suspendedProjects: 8,
        expiredProjects: 6,
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
          client_id: 'admin@techcorp.com'
        },
        { 
          id: 2, 
          project_id: 'proj_1704067300_def456',
          name: 'E-commerce Support', 
          status: 'active', 
          total_tokens_used: 78000, 
          monthly_token_limit: 100000,
          created_at: new Date().toISOString(),
          client_id: 'support@ecommerce.com'
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

  // ✅ Real-time Project Status Data
  const projectStatusData = [
    { 
      name: 'Active', 
      value: Math.round((stats.activeProjects / Math.max(stats.totalProjects, 1)) * 100), 
      color: '#10B981',
      count: stats.activeProjects
    },
    { 
      name: 'Suspended', 
      value: Math.round((stats.suspendedProjects / Math.max(stats.totalProjects, 1)) * 100), 
      color: '#F59E0B',
      count: stats.suspendedProjects
    },
    { 
      name: 'Expired', 
      value: Math.round((stats.expiredProjects / Math.max(stats.totalProjects, 1)) * 100), 
      color: '#EF4444',
      count: stats.expiredProjects
    }
  ];

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

  // ✅ Export Data with Live Backend
  const handleExportData = async (type) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/admin/export/${type}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${type}_export_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        console.log('✅ Export completed:', type);
      } else {
        throw new Error(`Export failed with status: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Export failed:', error);
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
          {new Date(project.created_at).toLocaleDateString()}
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
    }, 60000); // Refresh every 60 seconds for live data

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
            change={`+${((stats.totalProjects - stats.expiredProjects) / Math.max(stats.totalProjects, 1) * 100).toFixed(1)}%`}
            changeType="positive"
            color="blue"
            onClick={handleViewAllProjects}
          />
          <StatCard
            title="Active Projects"
            value={stats.activeProjects}
            icon={CheckCircle}
            change={`${(stats.activeProjects / Math.max(stats.totalProjects, 1) * 100).toFixed(1)}%`}
            changeType="positive"
            color="green"
            onClick={handleViewAllProjects}
          />
          <StatCard
            title="Suspended Projects"
            value={stats.suspendedProjects}
            icon={AlertTriangle}
            change={stats.suspendedProjects > 0 ? "Needs attention" : "All good"}
            changeType={stats.suspendedProjects > 0 ? "negative" : "positive"}
            color="yellow"
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
                  <span className={styles.legendText}>
                    {item.name} ({item.count}) - {item.value}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Token Usage Chart */}
          <div className={styles.chartCard}>
            <div className={styles.chartHeader}>
              <h3 className={styles.chartTitle}>System Overview</h3>
              <div className={styles.chartActions}>
                <button 
                  className={styles.exportBtn}
                  onClick={() => handleExportData('overview')}
                >
                  <Download className={styles.buttonIcon} />
                  Export
                </button>
              </div>
            </div>
            <div className={styles.overviewStats}>
              <div className={styles.overviewItem}>
                <h4>Total Tokens</h4>
                <p>{stats.tokensUsed.toLocaleString()}</p>
              </div>
              <div className={styles.overviewItem}>
                <h4>Avg Response Time</h4>
                <p>{stats.avgResponseTime}s</p>
              </div>
              <div className={styles.overviewItem}>
                <h4>Success Rate</h4>
                <p>{stats.successRate}%</p>
              </div>
            </div>
          </div>
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
                    <ProjectRow key={project.id || project.project_id} project={project} />
                  ))}
              </tbody>
            </table>
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
            <p className={styles.actionDescription}>{stats.expiredProjects} projects need attention</p>
          </div>
          
          <div className={styles.actionCard}>
            <XCircle className={styles.actionIcon} />
            <h4 className={styles.actionTitle}>High Usage</h4>
            <p className={styles.actionDescription}>Monitor token consumption</p>
          </div>
          
          <div className={styles.actionCard}>
            <Settings className={styles.actionIcon} />
            <h4 className={styles.actionTitle}>System Health</h4>
            <p className={styles.actionDescription}>All services operational</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
