import { useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";
import { useDispatch } from "react-redux";
import { clearCart } from "../store/slices/cartSlice";
import { setLogout } from "../store/slices/authSlice";

import {
  CircleUserRound,
  Menu,
  X,
  User,
  ShoppingBag,
  MapPin,
  Package,
  LogOut,
  Camera,
  Plus,
  ArrowLeft,
  Pencil,
  ChevronRight,
  ShieldCheck,
  CreditCard,
  Clock,
  CheckCircle2,
  Lock,
  Eye,
  EyeOff,
  Trash2,
} from "lucide-react";

const Profile = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [userData, setUserData] = useState(null);
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
  });
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("My Details");
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [selectedAddressType, setSelectedAddressType] = useState("home");
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    const initData = async () => {
      try {
        const [profileRes, orderRes] = await Promise.all([
          api.get("/users/profile"),
          api.get("/order").catch(() => ({ data: { data: [] } })),
        ]);

        const user = profileRes.data.data;
        setUserData(user);
        setFormData({
          firstname: user.firstname || "",
          lastname: user.lastname || "",
          email: user.email || "",
        });
        setOrders(orderRes.data.data || []);
      } catch (err) {
        toast.error("Failed to load account data");
      }
    };
    initData();
  }, []);

  const handleUpdateProfile = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }
    try {
      setIsSubmitting(true);
      const data = new FormData();
      data.append("firstname", formData.firstname);
      data.append("lastname", formData.lastname);
      data.append("email", formData.email);

      if (selectedFile) {
        data.append("avatar", selectedFile);
      }

      const response = await api.put("/users/profile", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setUserData(response.data.data);
      setIsEditing(false);
      setSelectedFile(null);
      setPreviewUrl(null);
      toast.success("Profile updated successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    try {
      setIsSubmitting(true);
      const response = await api.put("/password", {
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword,
      });
      if (response.data.success) {
        toast.success("Password updated successfully");
        setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const type = fd.get("type").toLowerCase();
    const addressPayload = {
      address: {
        [type]: {
          street: fd.get("street"),
          city: fd.get("city"),
          state: fd.get("state"),
          zipcode: fd.get("zipcode"),
          country: fd.get("country") || "India",
        },
      },
    };

    try {
      setIsSubmitting(true);
      const response = await api.put("/users/profile", addressPayload);
      setUserData(response.data.data);
      setIsAddingAddress(false);
      toast.success(`${type} address updated successfully!`);
    } catch (err) {
      toast.error("Failed to update address");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    try {
      const res = await api.put("/order", { orderId, newStatus: "cancelled" });
      if (res.data.success) {
        toast.success("Order cancelled successfully");
        const orderRes = await api.get("/order");
        setOrders(orderRes.data.data || []);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to cancel order");
    }
  };

  const handleLogout = async () => {
    try {
      if (!window.confirm("Are you sure you want to logout?")) return;
      await api.post("/auth/logout");
      dispatch(setLogout());
      dispatch(clearCart());
      toast.success("Logged out successfully");
      window.location.href = "/";
    } catch (err) {
      toast.error("Failed to logout. Please try again.");
    }
  };

  const handleDeleteAddress = async (type) => {
    if (!window.confirm(`Delete ${type} address?`)) return;
    try {
      const res = await api.delete(`/users/profile/address/${type.toLowerCase()}`);
      setUserData(res.data.data);
      toast.success(`${type} address deleted`);
    } catch (err) {
      toast.error("Failed to delete address");
    }
  };

  const menuItems = [
    { name: "My Details", icon: <User size={18} /> },
    { name: "My Orders", icon: <ShoppingBag size={18} /> },
    { name: "Address", icon: <MapPin size={18} /> },
    { name: "Security", icon: <Lock size={18} /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-x-hidden">
      {/* Sidebar Navigation */}
      <aside
        className={`
        fixed top-0 left-0 h-screen bg-white border-r border-slate-100 transition-all duration-500 ease-in-out
        w-80 flex flex-col z-[60] shadow-2xl shadow-indigo-500/5
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"} 
      `}
      >
        <div className="p-10 flex flex-col h-full">
          <div className="flex items-center justify-between mb-16 px-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-500/20 transform -rotate-6">
                <ShieldCheck className="text-white" size={22} />
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">
                Account<span className="text-indigo-600">Pro</span>
              </h2>
            </div>
            <button
              className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <X size={20} />
            </button>
          </div>

          <nav className="flex flex-col gap-2">
            <p className="px-4 text-[10px] font-black uppercase tracking-widest text-slate-300 mb-2">Navigation</p>
            {menuItems.map((item) => (
              <button
                key={item.name}
                onClick={() => {
                  setActiveTab(item.name);
                  setIsMobileMenuOpen(false);
                  setIsAddingAddress(false);
                }}
                className={`flex items-center gap-4 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300
                  ${
                    activeTab === item.name
                      ? "bg-indigo-600 text-white shadow-xl shadow-indigo-500/20 translate-x-2"
                      : "text-slate-400 hover:bg-slate-50 hover:text-indigo-600"
                  }
                `}
              >
                {item.icon}
                {item.name}
                {activeTab === item.name && (
                  <ChevronRight size={14} className="ml-auto" />
                )}
              </button>
            ))}
          </nav>

          <div className="mt-auto pt-8 border-t border-slate-50">
            <button
              className="flex items-center gap-4 px-6 py-5 w-full rounded-2xl text-[10px] font-black uppercase tracking-widest text-rose-500 bg-rose-50/50 hover:bg-rose-50 hover:text-rose-600 transition-all group"
              onClick={handleLogout}
            >
              <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[55] md:hidden animate-in fade-in duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 md:ml-80 p-4 sm:p-6 md:p-12 lg:p-16 transition-all min-w-0">
        <div className="max-w-5xl mx-auto space-y-12">
          {/* Mobile Header */}
          <div className="md:hidden flex items-center justify-between mb-8">
            <h1 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">{activeTab}</h1>
            <button
              className="p-3 bg-white text-indigo-600 rounded-2xl shadow-lg shadow-indigo-500/10 border border-indigo-50"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={24} />
            </button>
          </div>

          <div className="bg-white rounded-[48px] shadow-2xl shadow-indigo-500/5 border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* Page Header */}
            <div className="bg-slate-50/50 border-b border-slate-50 px-6 sm:px-10 py-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="flex items-center gap-4">
                {isAddingAddress && (
                  <button
                    onClick={() => setIsAddingAddress(false)}
                    className="w-12 h-12 flex items-center justify-center bg-white border border-slate-100 rounded-2xl hover:text-indigo-600 transition-colors shadow-sm"
                  >
                    <ArrowLeft size={20} />
                  </button>
                )}
                <div>
                  <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">
                    {isAddingAddress ? `Manage ${selectedAddressType}` : activeTab}
                  </h1>
                </div>
              </div>

              {!isEditing && activeTab === "My Details" && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-8 py-3.5 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                >
                  <Pencil size={14} strokeWidth={3} />
                  Update Details
                </button>
              )}
            </div>

            <div className="p-6 sm:p-10 md:p-16">
              {/* My Details Content */}
              {activeTab === "My Details" && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8 lg:gap-16 mb-12">
                    <div className="relative group">
                      <div className="w-48 h-48 bg-slate-50 rounded-[48px] flex items-center justify-center overflow-hidden border-[6px] border-white shadow-2xl shadow-indigo-500/10 rotate-3 group-hover:rotate-0 transition-all duration-500 scale-95 group-hover:scale-100">
                        {previewUrl ? (
                          <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
                        ) : userData?.avatar ? (
                          <img 
                            src={`${import.meta.env.VITE_BASE_URL}${userData.avatar.startsWith("/") ? "" : "/"}${userData.avatar}`} 
                            className="w-full h-full object-cover" 
                            alt="Profile" 
                          />
                        ) : (
                          <div className="w-full h-full bg-indigo-50 flex items-center justify-center">
                            <CircleUserRound size={100} className="text-indigo-200" strokeWidth={1} />
                          </div>
                        )}
                      </div>

                      {isEditing && (
                        <button
                          type="button"
                          onClick={() => fileInputRef.current.click()}
                          className="absolute -bottom-2 -right-2 w-14 h-14 bg-indigo-600 text-white rounded-[24px] shadow-xl shadow-indigo-500/20 flex items-center justify-center hover:scale-110 transition-transform active:scale-95 z-10"
                        >
                          <Camera size={20} />
                        </button>
                      )}

                      <input
                        type="file"
                        ref={fileInputRef}
                        hidden
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            setSelectedFile(file);
                            setPreviewUrl(URL.createObjectURL(file));
                          }
                        }}
                      />
                    </div>

                    <div className="text-center lg:text-left flex-1 space-y-4">
                      <div className="flex items-center gap-3 justify-center lg:justify-start">
                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 px-3 py-1 bg-indigo-50 rounded-full border border-indigo-100">
                          Active Member
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                          ID: #{userData?._id?.slice(-8).toUpperCase()}
                        </span>
                      </div>
                      <h3 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">
                        {userData?.firstname} {userData?.lastname}
                      </h3>
                      <p className="text-slate-400 font-bold text-sm tracking-tight">{userData?.email}</p>

                      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
                        <div className="bg-slate-50 p-5 rounded-[24px] border border-slate-100 group hover:border-indigo-200 transition-colors">
                          <Package size={18} className="text-indigo-600 mb-2" />
                          <p className="text-2xl font-black text-slate-900 leading-none">{orders.length}</p>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Total Orders</p>
                        </div>
                        <div className="bg-slate-50 p-5 rounded-[24px] border border-slate-100 group hover:border-indigo-200 transition-colors">
                          <ShieldCheck size={18} className="text-indigo-600 mb-2" />
                          <p className="text-2xl font-black text-slate-900 leading-none">Silver</p>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Badge</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-slate-50 pt-10">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">First Name</label>
                      <input
                        type="text"
                        className={`w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold text-sm ${isEditing ? "bg-white" : "cursor-not-allowed opacity-60"}`}
                        name="firstname"
                        value={formData.firstname}
                        onChange={(e) => setFormData({...formData, firstname: e.target.value})}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Last Name</label>
                      <input
                        type="text"
                        className={`w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold text-sm ${isEditing ? "bg-white" : "cursor-not-allowed opacity-60"}`}
                        name="lastname"
                        value={formData.lastname}
                        onChange={(e) => setFormData({...formData, lastname: e.target.value})}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-3 md:col-span-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Communication Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        disabled={!isEditing}
                        className={`w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold text-sm ${isEditing ? "bg-white" : "cursor-not-allowed opacity-60"}`}
                      />
                    </div>
                  </div>

                  {isEditing && (
                    <div className="mt-12 flex flex-col sm:flex-row justify-end gap-4">
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          setFormData({ firstname: userData.firstname, lastname: userData.lastname, email: userData.email });
                          setPreviewUrl(null);
                          setSelectedFile(null);
                        }}
                        className="px-10 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors order-2 sm:order-1"
                      >
                        Abandon Changes
                      </button>
                      <button
                        disabled={isSubmitting}
                        onClick={handleUpdateProfile}
                        className="w-full sm:w-auto px-12 py-5 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 order-1 sm:order-2"
                      >
                        {isSubmitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Commit Updates"}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* My Orders Content */}
              {activeTab === "My Orders" && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {orders.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6">
                      {orders.map((order) => (
                        <div
                          key={order._id}
                          className="group bg-slate-50/30 hover:bg-white border border-slate-100 hover:border-indigo-200 rounded-[40px] p-6 lg:p-8 transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-500/5"
                        >
                          <div className="flex flex-wrap justify-between items-center gap-6 mb-8">
                            <div className="flex gap-4 items-center">
                              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                                <Package size={24} />
                              </div>
                              <div>
                                <h4 className="text-lg font-black text-slate-900 tracking-tighter uppercase">
                                  Order <span className="text-indigo-600">#{order._id.slice(-6).toUpperCase()}</span>
                                </h4>
                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                  <Clock size={12} />
                                  {new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-black text-slate-900 tracking-tighter">₹{order.totalAmount.toFixed(2)}</p>
                              <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                                order.status === "delivered" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                order.status === "cancelled" ? "bg-rose-50 text-rose-600 border-rose-100" :
                                "bg-indigo-50 text-indigo-600 border-indigo-100"
                              }`}>
                                {order.status}
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-col lg:flex-row justify-between items-end gap-8">
                            <div className="flex flex-wrap gap-2">
                              {order.products.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-3 bg-white p-2 pr-4 rounded-xl border border-slate-100 shadow-sm">
                                  <div className="w-10 h-10 rounded-lg bg-slate-50 overflow-hidden flex-shrink-0">
                                    <img 
                                      src={`${import.meta.env.VITE_BASE_URL}${item.product?.image?.[0]}`} 
                                      className="w-full h-full object-contain"
                                      alt="Product"
                                    />
                                  </div>
                                  <span className="text-[9px] font-black text-slate-900 uppercase max-w-[100px] truncate">{item.product?.name}</span>
                                </div>
                              ))}
                            </div>
                            <div className="flex items-center gap-4">
                              {(order.status === "pending" || order.status === "confirmed") && (
                                <button
                                  onClick={() => handleCancelOrder(order._id)}
                                  className="px-4 py-2 bg-rose-50 text-rose-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                                >
                                Cancel Order
                                </button>
                              )}
                              
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-20 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[48px]">
                      <ShoppingBag size={48} className="text-slate-200 mx-auto mb-6" strokeWidth={1.5} />
                      <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase mb-2">Order Vault Empty</h3>
                      <button onClick={() => navigate("/shop")} className="text-[10px] font-black uppercase tracking-widest text-indigo-600 underline">Start Shopping</button>
                    </div>
                  )}
                </div>
              )}

              {/* Address Content */}
              {activeTab === "Address" && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {!isAddingAddress ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {["Home", "Office"].map((type) => {
                        const addr = userData?.address?.[type.toLowerCase()];
                        const exists = addr && addr.street;
                        return (
                          <div key={type} className={`p-8 rounded-[40px] border-2 transition-all duration-500 ${exists ? "bg-white border-slate-100 shadow-xl shadow-slate-200/20" : "bg-slate-50 border-dashed border-slate-200"}`}>
                            <div className="flex justify-between items-start mb-6">
                              <div className={`p-4 rounded-2xl ${exists ? "bg-indigo-600 text-white" : "bg-white text-slate-300 border border-slate-100"}`}>
                                {type === "Home" ? <MapPin size={24} /> : <Package size={24} />}
                              </div>
                              {exists && (
                                <button onClick={() => handleDeleteAddress(type)} className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all">
                                  <Trash2 size={18} />
                                </button>
                              )}
                            </div>
                            <h4 className="text-xl font-black text-slate-900 tracking-tighter uppercase mb-4">{type} Identity</h4>
                            {exists ? (
                              <div className="space-y-1">
                                <p className="text-slate-600 font-bold text-sm tracking-tight">{addr.street}</p>
                                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">{addr.city}, {addr.state} - {addr.zipcode}</p>
                                <button onClick={() => { setSelectedAddressType(type.toLowerCase()); setIsAddingAddress(true); }} className="mt-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:gap-3 transition-all">
                                  Refine Address <ChevronRight size={14} />
                                </button>
                              </div>
                            ) : (
                              <button onClick={() => { setSelectedAddressType(type.toLowerCase()); setIsAddingAddress(true); }} className="mt-2 flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors">
                                <Plus size={16} /> Setup Coordinates
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <form onSubmit={handleAddressSubmit} className="max-w-3xl mx-auto space-y-8 animate-in slide-in-from-right-8 duration-500">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3 md:col-span-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Location Details (Street / House)</label>
                          <input name="street" required type="text" defaultValue={userData?.address?.[selectedAddressType]?.street || ""} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold text-sm" />
                        </div>
                        <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">City Hub</label>
                          <input name="city" required type="text" defaultValue={userData?.address?.[selectedAddressType]?.city || ""} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold text-sm" />
                        </div>
                        <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">State / Province</label>
                          <input name="state" required type="text" defaultValue={userData?.address?.[selectedAddressType]?.state || ""} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold text-sm" />
                        </div>
                        <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Postal Integrity Code</label>
                          <input name="zipcode" required type="text" defaultValue={userData?.address?.[selectedAddressType]?.zipcode || ""} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-black tracking-widest text-sm" />
                        </div>
                        <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Type Designation</label>
                          <select name="type" defaultValue={selectedAddressType} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none appearance-none font-black uppercase tracking-widest text-[10px] text-indigo-600">
                            <option value="home">Home Base</option>
                            <option value="office">Work Station</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex gap-4 pt-8 border-t border-slate-50">
                        <button type="submit" disabled={isSubmitting} className="flex-1 bg-indigo-600 text-white py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-500/10 hover:scale-[1.02] active:scale-95 transition-all">
                          {isSubmitting ? "Processing..." : "Secure Save"}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* Security Content */}
              {activeTab === "Security" && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto">
                  <div className="bg-indigo-50/50 rounded-3xl p-8 border border-indigo-100 mb-10 flex items-start gap-4">
                    <div className="p-3 bg-white rounded-xl text-indigo-600 shadow-sm">
                      <ShieldCheck size={24} />
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-slate-900 tracking-tighter uppercase mb-1">Security Protocol</h4>
                      <p className="text-xs font-bold text-slate-500 leading-relaxed uppercase tracking-widest opacity-60">Maintain your digital integrity. Regularly updating your core authentication is recommended.</p>
                    </div>
                  </div>

                  <form onSubmit={handlePasswordChange} className="space-y-8">
                    <div className="space-y-6">
                      {/* Old Password */}
                      <div className="space-y-3 relative">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Operational Password</label>
                        <div className="relative">
                          <input
                            type={showPasswords.old ? "text" : "password"}
                            required
                            placeholder="Current code"
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold text-sm tracking-widest"
                            value={passwordData.oldPassword}
                            onChange={(e) => setPasswordData({...passwordData, oldPassword: e.target.value})}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswords({...showPasswords, old: !showPasswords.old})}
                            className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
                          >
                            {showPasswords.old ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </div>

                      {/* New Password */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                        <div className="space-y-3 relative">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Fresh Credentials</label>
                          <div className="relative">
                            <input
                              type={showPasswords.new ? "text" : "password"}
                              required
                              placeholder="New code"
                              className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold text-sm tracking-widest"
                              value={passwordData.newPassword}
                              onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPasswords({...showPasswords, new: !showPasswords.new})}
                              className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
                            >
                              {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                          </div>
                        </div>

                        <div className="space-y-3 relative">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Confirm Identity</label>
                          <div className="relative">
                            <input
                              type={showPasswords.confirm ? "text" : "password"}
                              required
                              placeholder="Repeat code"
                              className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold text-sm tracking-widest"
                              value={passwordData.confirmPassword}
                              onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})}
                              className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
                            >
                              {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic text-center">Protocol: Min 6 characters. Use alphanumeric sequences for maximum security.</p>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-slate-900/10 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Authorize Change"}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
