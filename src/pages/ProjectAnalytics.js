import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, MessageSquare, Clock, DollarSign } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import styles from './ProjectAnalytics.module.css';

const ProjectAnalytics = ({ onLogout }) => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    fetchAnalytics();
  }, [projectId, timeRange]);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/projects/${projectId}/analytics?range=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      } else {
        // Mock data for development
        setAnalytics({
          totalMessages: 1250,
          tokensUsed: 45000,
          avgResponseTime: 1.2,
          estimatedCost: 12.50,
          dailyMessages: [
            { date: '2024-01-01', messages: 45 },
            { date: '2024-01-02', messages: 52 },
            { date: '2024-01-03', messages: 38 },
            { date: '2024-01-04', messages: 61 },
            { date: '2024-01-05', messages: 49 },
            { date: '2024-01-06', messages: 55 },
            { date: '2024-01-07', messages: 42 }
          ],
          tokenUsage: [
            { date: '2024-01-01', tokens: 1200 },
            { date: '2024-01-02', tokens: 1450 },
            { date: '2024-01-03', tokens: 980 },
            { date: '2024-01-04', tokens: 1680 },
            { date: '2024-01-05', tokens: 1320 },
            { date: '2024-01-06', tokens: 1550 },
            { date: '2024-01-07', tokens: 1180 }
          ]
        });
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading analytics...</div>;
  }

  return (
    <div className={styles.analytics}>
      <div className={styles.header}>
        <button 
          className={styles.backButton}
          onClick={() => navigate(`/admin/projects/${projectId}`)}
        >
          <ArrowLeft size={20} />
          Back to Project
        </button>
        <h2>Project Analytics</h2>
        <select 
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className={styles.timeRangeSelect}
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
        </select>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <MessageSquare className={styles.statIcon} />
          <div>
            <h3>Total Messages</h3>
            <p className={styles.statValue}>{analytics?.totalMessages || 0}</p>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <TrendingUp className={styles.statIcon} />
          <div>
            <h3>Tokens Used</h3>
            <p className={styles.statValue}>{analytics?.tokensUsed || 0}</p>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <Clock className={styles.statIcon} />
          <div>
            <h3>Avg Response Time</h3>
            <p className={styles.statValue}>{analytics?.avgResponseTime || 0}s</p>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <DollarSign className={styles.statIcon} />
          <div>
            <h3>Estimated Cost</h3>
            <p className={styles.statValue}>${analytics?.estimatedCost || 0}</p>
          </div>
        </div>
      </div>

      <div className={styles.chartsGrid}>
        <div className={styles.chartCard}>
          <h3>Daily Messages</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics?.dailyMessages || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="messages" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className={styles.chartCard}>
          <h3>Token Usage Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics?.tokenUsage || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="tokens" stroke="#10b981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ProjectAnalytics;
