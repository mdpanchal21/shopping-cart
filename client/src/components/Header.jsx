import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  ShoppingCart,
  CircleUserRound,
  LogOut,
  LayoutGrid,
  Menu,
  X,
  LayoutDashboard,
} from "lucide-react";
import api from "../../utils/api";
import { useDispatch, useSelector } from "react-redux";
import { fetchCart, clearCart } from "../store/slices/cartSlice";
import { setLogout } from "../store/slices/authSlice";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

const Header = () => {
  const dispatch = useDispatch();
  const { items: cart, loading } = useSelector((state) => state.cart);
  const { isAuthenticated: token, role } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isProfilePage = location.pathname === "/profile";

  const uniqueItemCount = cart.length;

  useEffect(() => {
    if (token) {
      dispatch(fetchCart());
    }
  }, [token, dispatch]);

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");

      dispatch(setLogout());
      dispatch(clearCart());
      toast.success("Logged out successfully");
      window.location.href = "/";
    } catch (err) {
      console.log(err);
      toast.error("Failed to logout. Please try again.");
      setTimeout(() => {
        navigate("/shop");
      }, 1000);
    }
  };

  return (
    <header className="glass-nav h-[72px] px-4 md:px-8 flex items-center justify-center">
      <div className="relative w-full max-w-7xl flex justify-between items-center">
        <Link
          to="/"
          className={`flex items-center gap-2 group z-50 transition-all duration-500 ${
            isProfilePage ? "md:ml-10" : ""
          }`}
          onClick={() => setIsMenuOpen(false)}
        >
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform">
            <ShoppingCart className="text-white" size={20} strokeWidth={2.5} />
          </div>
          <span className="text-2xl font-black tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
            SHOP<span className="text-indigo-600">PRO</span>
          </span>
        </Link>

        <button
          className="md:hidden z-50 p-2 text-slate-600 hover:text-indigo-600 transition-colors"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

        <nav className="hidden md:flex items-center gap-2 md:gap-6">
          <Link
            to="/shop"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-all font-semibold text-sm"
          >
            <LayoutGrid size={18} />
            <span>Explore</span>
          </Link>
          {token && role === "admin" && (
            <Link
              to="/admin"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-slate-600 hover:text-indigo-600 hover:bg-slate-50 transition-all font-semibold text-sm"
            >
              <LayoutDashboard size={18} />
              <span>Admin</span>
            </Link>
          )}

          {!token ? (
            <div className="flex items-center gap-2 md:gap-4 ml-2 border-l border-slate-200 pl-4 md:pl-6">
              <Link
                to="/mycart"
                className="relative p-2.5 rounded-xl text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
              >
                <ShoppingCart size={22} />
                {uniqueItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white font-bold text-[10px] w-5 h-5 flex items-center justify-center rounded-full border-2 border-white animate-in zoom-in duration-300">
                    {loading ? "..." : uniqueItemCount}
                  </span>
                )}
              </Link>
              <Link
                to="/login"
                className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors px-2"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="btn-primary py-2.5 !px-5 !text-sm"
              >
                Join Home
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-2 md:gap-4 ml-2 border-l border-slate-200 pl-4 md:pl-6">
              <Link
                to="/mycart"
                className="relative p-2.5 rounded-xl text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
              >
                <ShoppingCart size={22} />
                {uniqueItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white font-bold text-[10px] w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                    {loading ? "..." : uniqueItemCount}
                  </span>
                )}
              </Link>

              <Link
                to="/profile"
                className="p-2.5 rounded-xl text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
              >
                <CircleUserRound size={22} />
              </Link>

              <button
                onClick={handleLogout}
                className="p-2.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          )}
        </nav>

        {isMenuOpen && (
          <div className="md:hidden absolute top-[64px] right-0 bg-white border border-slate-100 rounded-2xl shadow-xl w-52 py-2 z-[70] flex flex-col">
            <Link
              to="/shop"
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:text-indigo-600 hover:bg-slate-50 transition-colors font-bold text-sm"
            >
              <LayoutGrid size={18} />
              Explore
            </Link>
            <Link
              to="/mycart"
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:text-indigo-600 hover:bg-slate-50 transition-colors font-bold text-sm"
            >
              <ShoppingCart size={18} />
              Your Bag
              {uniqueItemCount > 0 && (
                <span className="ml-auto text-[10px] bg-indigo-600 text-white px-2 py-0.5 rounded-full font-black">
                  {uniqueItemCount}
                </span>
              )}
            </Link>

            {token && (
              <Link
                to="/"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:text-indigo-600 hover:bg-slate-50 transition-colors font-bold text-sm"
              >
                <LayoutDashboard size={18} />
                Admin Panel
              </Link>
            )}

            <div className="my-1 border-t border-slate-100 mx-2" />

            {!token ? (
              <>
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:text-indigo-600 hover:bg-slate-50 transition-colors font-bold text-sm"
                >
                  <CircleUserRound size={18} />
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMenuOpen(false)}
                  className="mx-4 my-2 btn-primary flex items-center justify-center py-2 rounded-xl text-xs"
                >
                  Join Home
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/profile"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:text-indigo-600 hover:bg-slate-50 transition-colors font-bold text-sm"
                >
                  <CircleUserRound size={18} />
                  Profile
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center gap-3 px-4 py-3 w-full text-rose-500 hover:bg-rose-50 transition-colors font-bold text-sm text-left"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
