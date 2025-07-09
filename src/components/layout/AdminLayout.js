import React from 'react';
import { Outlet } from 'react-router-dom';

const AdminLayout = () => {
  return (
    <div className="admin-layout">
      <div className="admin-container">
        <header className="admin-header">
          <h1>Troika Chatbot SaaS Admin</h1>
        </header>
        <main className="admin-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout; // ✅ Essential default export
