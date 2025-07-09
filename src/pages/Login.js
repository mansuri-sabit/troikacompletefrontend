import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './Login.module.css';

// Configure axios defaults
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'https://completetroikabackend.onrender.com',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log('🔄 API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.status, response.data);
    return response;
  },
  (error) => {
    console.error('❌ Response Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

const Login = ({ onLoginSuccess }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('🔄 Attempting login with:', formData.email);
      
      // Use axios for the login request
      const response = await api.post('/api/auth/login', formData);
      const data = response.data;

      console.log('📥 Login response:', data);

      // Check if response contains required data
      if (data.token && data.user) {
        // Store authentication data
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Verify storage
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        
        console.log('✅ Token stored successfully:', storedToken ? storedToken.substring(0, 20) + '...' : 'FAILED');
        console.log('✅ User stored successfully:', storedUser ? JSON.parse(storedUser) : 'FAILED');
        
        // Trigger authentication state update
        if (onLoginSuccess) {
          onLoginSuccess();
        }
        
        // Navigate to dashboard with small delay
        setTimeout(() => {
          navigate('/admin/dashboard');
        }, 100);
      } else {
        setError('Invalid response from server. Missing token or user data.');
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      
      // Handle different types of errors
      if (error.response) {
        // Server responded with error status
        const { status, data } = error.response;
        
        switch (status) {
          case 400:
            setError(data.error || 'Invalid request. Please check your input.');
            break;
          case 401:
            setError(data.error || 'Invalid credentials. Please try again.');
            break;
          case 403:
            setError(data.error || 'Access denied. Admin privileges required.');
            break;
          case 429:
            setError('Too many login attempts. Please try again later.');
            break;
          case 500:
            setError('Server error. Please try again later.');
            break;
          default:
            setError(data.error || 'Login failed. Please try again.');
        }
      } else if (error.request) {
        // Network error
        setError('Network error. Please check your connection and try again.');
      } else if (error.code === 'ECONNABORTED') {
        // Timeout error
        setError('Request timeout. Please try again.');
      } else {
        // Other errors
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setFormData({
      email: 'admin@troikatech.com',
      password: 'Admin@123456'
    });
    setError('');
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <div className={styles.loginHeader}>
          <div className={styles.logo}>
            <h1>Troika Tech</h1>
            <p>Chatbot SaaS Platform</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className={styles.loginForm}>
          <h2>Admin Login</h2>
          
          {error && (
            <div className={styles.errorMessage}>
              <svg className={styles.errorIcon} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={styles.input}
              placeholder="admin@troikatech.com"
              required
              autoComplete="email"
              disabled={loading}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={styles.input}
              placeholder="Enter your password"
              required
              autoComplete="current-password"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`${styles.submitButton} ${loading ? styles.loading : ''}`}
          >
            {loading ? (
              <>
                <div className={styles.spinner}></div>
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>

          <div className={styles.loginFooter}>
            <p>
              <a href="#" className={styles.forgotPassword}>
                Forgot your password?
              </a>
            </p>
            <div className={styles.divider}>
              <span>or</span>
            </div>
            <div className={styles.demoCredentials}>
              <p><strong>Demo Credentials:</strong></p>
              <p>Email: admin@troikatech.com</p>
              <p>Password: Admin@123456</p>
              <button 
                type="button"
                onClick={handleDemoLogin}
                className={styles.demoButton}
                disabled={loading}
              >
                Use Demo Credentials
              </button>
            </div>
          </div>
        </form>
      </div>

      <div className={styles.backgroundPattern}></div>
    </div>
  );
};

export default Login;
