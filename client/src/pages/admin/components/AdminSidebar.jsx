import { NavLink } from "react-router-dom";
import {
  Package,
  ShoppingBag,
  Users,
  Layers,
  Settings,
  LogOut,
  Store,
} from "lucide-react";

const AdminSidebar = ({ isCollapsed }) => {
  const menuItems = [
    { name: "Products", path: "/admin/products", icon: Package },
    { name: "Orders", path: "/admin/orders", icon: ShoppingBag },
    { name: "Users", path: "/admin/users", icon: Users },
    { name: "Categories", path: "/admin/categories", icon: Layers },
  ];

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-white border-r border-slate-200 transition-all duration-300 z-50 flex flex-col ${
        isCollapsed ? "w-0 -translate-x-full lg:w-20 lg:translate-x-0" : "w-64"
      }`}
    >
      <div className="h-20 flex items-center px-6 gap-3">
        <div className="p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/20">
          <Store className="text-white" size={24} />
        </div>
        {!isCollapsed && (
          <span className="text-xl font-bold text-slate-900 tracking-tight">
            AdminPanel
          </span>
        )}
      </div>

      <nav className="flex-1 px-3 py-6 space-y-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `admin-sidebar-item ${isActive ? "active" : ""}`
            }
          >
            <item.icon size={20} className="min-w-[20px]" />
            {!isCollapsed && <span className="truncate">{item.name}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-slate-100 space-y-1">
        <button className="w-full admin-sidebar-item text-rose-600 hover:bg-rose-50 hover:text-rose-600">
          <LogOut size={20} className="min-w-[20px]" />
          {!isCollapsed && <span className="truncate">Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
