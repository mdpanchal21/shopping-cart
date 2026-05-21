import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import api from "../../utils/api";
import { setLogin, setRole } from "../store/slices/authSlice";
import { fetchCart } from "../store/slices/cartSlice";
import { fetchAllSchemas } from "../store/slices/formSchemaSlice";
import { Mail, Lock, ArrowRight, ShoppingBag } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/shop";

  const handleLogin = async (e) => {
    e.preventDefault();

    const match = document.cookie.match(/guest_cart=([^;]+)/);
    const guestCart = match ? JSON.parse(decodeURIComponent(match[1])) : [];

    try {
      const response = await api.post("/auth/login", {
        email: formData.email,
        password: formData.password,
        guestCart: guestCart,
      });

      const accessToken = response.data.token;
      const userRole = response.data.role;

      if (accessToken) {
        dispatch(setLogin(accessToken));
        dispatch(setRole(userRole));
        document.cookie = "guest_cart=; path=/; max-age=0";
        
        if (userRole === "admin") {
          dispatch(fetchAllSchemas());
        }
      }

      dispatch(fetchCart());

      toast.success(response?.data?.message || "Login Successfully");

      setTimeout(() => {
        if (userRole === "admin") {
          navigate("/admin");
        } else {
          navigate(redirectPath);
        }
      }, 1000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Abstract Background Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl -z-10 animate-float"></div>
      <div
        className="absolute bottom-[10%] left-[-10%] w-[400px] h-[400px] bg-rose-500/5 rounded-full blur-3xl -z-10 animate-float"
        style={{ animationDelay: "2s" }}
      ></div>

      <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="bg-white rounded-[40px] shadow-2xl shadow-indigo-500/10 p-6 sm:p-10 md:p-12 border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 rounded-full -mr-16 -mt-16 -z-10"></div>

          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20 mx-auto mb-6">
              <ShoppingBag className="text-white" size={32} />
            </div>
            <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tighter uppercase">
              Welcome <span className="text-indigo-600">Back</span>
            </h1>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">
              Access your premium shopping experience
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleLogin}>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">
                Email Address
              </label>
              <div className="relative group">
                <Mail
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors"
                  size={18}
                />
                <input
                  type="email"
                  className="w-full bg-slate-50 border border-slate-100 pl-12 pr-4 py-4 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium text-sm"
                  placeholder="Enter your email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">
                Password
              </label>
              <div className="relative group">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors"
                  size={18}
                />
                <input
                  type="password"
                  className="w-full bg-slate-50 border border-slate-100 pl-12 pr-4 py-4 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium text-sm"
                  placeholder="••••••••"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full btn-primary py-4 flex items-center justify-center gap-3 group mt-4 h-14"
            >
              Sign In
              <ArrowRight
                size={20}
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-slate-50 text-center">
            <p className="text-slate-400 text-sm font-bold">
              New to ShopPro Matrix?{" "}
              <Link
                to="/register"
                className="text-indigo-600 hover:text-indigo-700 transition-colors underline decoration-indigo-200 underline-offset-8"
              >
                Create Account
              </Link>
            </p>
          </div>
        </div>

        <p className="mt-8 text-center text-slate-400 font-bold uppercase tracking-widest text-[10px]">
          © 2026 ShopPro Matrix. Secure Digital Gateway.
        </p>
      </div>
    </div>
  );
};

export default Login;
