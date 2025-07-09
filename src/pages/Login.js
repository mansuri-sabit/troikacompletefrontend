import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Login.module.css';

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
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      console.log('📥 Login response:', data);

      if (response.ok) {
        // ✅ Enhanced token storage with validation
        if (data.token && data.user) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          
          // ✅ Verify storage
          const storedToken = localStorage.getItem('token');
          const storedUser = localStorage.getItem('user');
          
          console.log('✅ Token stored successfully:', storedToken ? storedToken.substring(0, 20) + '...' : 'FAILED');
          console.log('✅ User stored successfully:', storedUser ? JSON.parse(storedUser) : 'FAILED');
          
          // Trigger authentication state update
          if (onLoginSuccess) {
            onLoginSuccess();
          }
          
          // Small delay to ensure state update
          setTimeout(() => {
            navigate('/admin/dashboard');
          }, 100);
        } else {
          setError('Invalid response from server. Missing token or user data.');
        }
      } else {
        console.error('❌ Login failed:', data);
        setError(data.error || 'Login failed. Please try again.');
      }
    } catch (error) {
      console.error('❌ Login network error:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
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
            <p className={styles.demoCredentials}>
              <strong>Demo Credentials:</strong><br />
              Email: admin@troikatech.com<br />
              Password: Admin@123456
            </p>
          </div>
        </form>
      </div>

      <div className={styles.backgroundPattern}></div>
    </div>
  );
};

export default Login;
