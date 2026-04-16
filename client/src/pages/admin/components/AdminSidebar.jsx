import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setLogout } from "../../../store/slices/authSlice";
import api from "../../../../utils/api";
import { toast } from "react-toastify";
import {
  Package,
  ShoppingBag,
  Users,
  Layers,
  Settings,
  LogOut,
  Store,
  X,
} from "lucide-react";

const AdminSidebar = ({ isCollapsed, setIsCollapsed }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
      dispatch(setLogout());
      toast.success("Logged out successfully");
      navigate("/");
    } catch (err) {
      toast.error("Logout failed");
      dispatch(setLogout());
      navigate("/");
    }
  };

  const menuItems = [
    { name: "Products", path: "/admin/products", icon: Package },
    { name: "Orders", path: "/admin/orders", icon: ShoppingBag },
    { name: "Users", path: "/admin/users", icon: Users },
    { name: "Categories", path: "/admin/categories", icon: Layers },
  ];

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-white border-r border-slate-200 shadow-2xl lg:shadow-none transition-all duration-300 z-[60] flex flex-col ${isCollapsed ? "-translate-x-full lg:translate-x-0 lg:w-20" : "translate-x-0 w-[280px] lg:w-64"
        }`}
    >
      <button
        onClick={() => setIsCollapsed(true)}
        className="lg:hidden absolute right-4 top-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
      >
        <X size={20} />
      </button>

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
            onClick={() => {
              if (window.innerWidth < 1024) setIsCollapsed(true);
            }}
            className={({ isActive }) =>
              `admin-sidebar-item ${isActive ? "active" : ""}`
            }
          >
            <item.icon size={20} className="min-w-[20px]" />
            <span className={`truncate transition-opacity duration-300 ${isCollapsed ? "lg:opacity-0 lg:w-0" : "opacity-100"}`}>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-slate-100 space-y-1">
        <button
          onClick={handleLogout}
          className="w-full admin-sidebar-item text-rose-600 hover:bg-rose-50 hover:text-rose-600"
        >
          <LogOut size={20} className="min-w-[20px]" />
          {!isCollapsed && <span className="truncate">Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
