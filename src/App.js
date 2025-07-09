import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import ProjectDashboard from './pages/ProjectDashboard';
import ProjectDetails from './pages/ProjectDetails';
import WidgetTester from './pages/WidgetTester';
import ProjectAnalytics from './pages/ProjectAnalytics';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Enhanced authentication check with debugging
  const checkAuthentication = () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    console.log('🔍 Checking authentication...');
    console.log('Token exists:', !!token);
    console.log('User exists:', !!user);

    if (token && user) {
      try {
        const userData = JSON.parse(user);
        console.log('User data:', userData);

        if (userData.role === 'admin') {
          console.log('✅ Admin authentication confirmed');
          return true;
        } else {
          console.log('❌ User is not admin:', userData.role);
        }
      } catch (error) {
        console.error('❌ Invalid user data in localStorage:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    } else {
      console.log('❌ Missing authentication data');
    }
    return false;
  };

  useEffect(() => {
    const authStatus = checkAuthentication();
    setIsAuthenticated(authStatus);
    setLoading(false);
    console.log('🔐 Authentication status:', authStatus);
  }, []);

  // Handle login success
  const handleLoginSuccess = () => {
    console.log('🎉 Login success callback triggered');
    const authStatus = checkAuthentication();
    setIsAuthenticated(authStatus);
  };

  // Handle logout
  const handleLogout = () => {
    console.log('👋 Logout triggered');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading Troika Tech Admin...</p>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public Routes */}
          <Route
            path="/login"
            element={
              isAuthenticated ?
                <Navigate to="/admin/dashboard" replace /> :
                <Login onLoginSuccess={handleLoginSuccess} />
            }
          />

          {/* Protected Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              isAuthenticated ?
                <AdminDashboard onLogout={handleLogout} /> :
                <Navigate to="/login" replace />
            }
          />

          <Route
            path="/admin/projects"
            element={
              isAuthenticated ?
                <ProjectDashboard onLogout={handleLogout} /> :
                <Navigate to="/login" replace />
            }
          />

          <Route
            path="/admin/projects/:projectId"
            element={
              isAuthenticated ?
                <ProjectDetails onLogout={handleLogout} /> :
                <Navigate to="/login" replace />
            }
          />

          <Route
            path="/admin/projects/:projectId/test"
            element={
              isAuthenticated ?
                <WidgetTester onLogout={handleLogout} /> :
                <Navigate to="/login" replace />
            }
          />

          <Route
            path="/admin/projects/:projectId/analytics"
            element={
              isAuthenticated ?
                <ProjectAnalytics onLogout={handleLogout} /> :
                <Navigate to="/login" replace />
            }
          />

          {/* Redirect Routes */}
          <Route
            path="/dashboard"
            element={<Navigate to="/admin/dashboard" replace />}
          />

          <Route
            path="/"
            element={
              <Navigate to={isAuthenticated ? "/admin/dashboard" : "/login"} replace />
            }
          />

          <Route
            path="/admin"
            element={<Navigate to="/admin/dashboard" replace />}
          />

          {/* 404 Route */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
