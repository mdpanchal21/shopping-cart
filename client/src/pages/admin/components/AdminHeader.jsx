import React from 'react';
import { Bell, User, Menu } from 'lucide-react';

const AdminHeader = ({ isCollapsed, setIsCollapsed }) => {
  return (
    <header className={`h-20 border-b border-slate-200 bg-white/95 backdrop-blur-xl fixed top-0 right-0 z-40 px-4 md:px-8 flex items-center justify-between transition-all duration-300 ${isCollapsed ? 'left-0 lg:left-20' : 'left-0 lg:left-64'}`}>
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
          aria-label="Toggle Sidebar"
        >
          <Menu size={24} />
        </button>
        
        <h2 className="text-lg font-bold text-slate-800 hidden sm:block">Dashboard</h2>
      </div>

      <div className="flex items-center gap-2 md:gap-6">
        <button className="relative p-2 text-slate-500 hover:text-indigo-600 transition-colors">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full border-2 border-white"></span>
        </button>

        <div className="flex items-center gap-3 pl-3 md:pl-6 border-l border-slate-200">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-900 line-clamp-1">Admin User</p>
            <p className="text-xs font-medium text-slate-500">Super Admin</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <User size={20} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
