import React from 'react';

const AuthLayout = ({ children }) => {
  return (
    <div className="auth-layout">
      <div className="auth-container">
        <div className="auth-content">
          <div className="auth-header">
            <h1>Troika Chatbot SaaS</h1>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout; // ✅ Essential default export
