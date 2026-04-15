import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './components/AdminSidebar';
import AdminHeader from './components/AdminHeader';

const AdminLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-500/30">
      {/* Sidebar */}
      <AdminSidebar isCollapsed={isCollapsed} />

      {/* Main Content Area */}
      <main 
        className={`transition-all duration-300 min-h-screen flex flex-col ${
          isCollapsed ? 'pl-0 lg:pl-20' : 'pl-0 lg:pl-64'
        }`}
      >
        <AdminHeader isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
        
        <div className="flex-1 p-4 md:p-8 mt-20">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
