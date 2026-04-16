import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './components/AdminSidebar';
import AdminHeader from './components/AdminHeader';


const AdminLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(true);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-500/30">
      <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      {!isCollapsed && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 lg:hidden animate-in fade-in duration-300"
          onClick={() => setIsCollapsed(true)}
        />
      )}


      <main
        className={`transition-all duration-300 min-h-screen flex flex-col ${isCollapsed ? 'pl-0 lg:pl-20' : 'pl-0 lg:pl-64'
          }`}
      >
        <AdminHeader isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

        <div className="flex-1 p-4 md:p-8 mt-20 relative flex flex-col min-h-[calc(100vh-5rem)]">
          <Outlet />
        </div>


      </main>
    </div>
  );
};

export default AdminLayout;
