import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, User, Mail, Shield, Calendar, RefreshCw, Save, Hash, MapPin, Package, Eye, AlertCircle } from 'lucide-react';
import api from '../../../utils/api';
import { toast } from 'react-toastify';

const UserInfo = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [orderPage, setOrderPage] = useState(1);
  const ordersPerPage = 5;
  
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    role: '',
    isActive: true,
    address: {
      home: { street: '', city: '', state: '', zipcode: '', country: '' },
      office: { street: '', city: '', state: '', zipcode: '', country: '' }
    }
  });

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/user/${id}`);
      const userData = res.data.data;
      setUser(userData);
      setFormData({
        firstname: userData.firstname || '',
        lastname: userData.lastname || '',
        email: userData.email || '',
        role: userData.role || 'user',
        isActive: userData.isActive !== false,
        address: {
          home: userData.address?.home || { street: '', city: '', state: '', zipcode: '', country: '' },
          office: userData.address?.office || { street: '', city: '', state: '', zipcode: '', country: '' }
        }
      });
    } catch (err) {
      toast.error("Failed to load user details");
      navigate("/admin/users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await api.patch(`/admin/user/${id}`, formData);
      toast.success("User updated successfully!");
      setIsEditing(false);
      fetchUserDetails();
    } catch (err) {
      toast.error("Failed to update user");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      firstname: user?.firstname || '',
      lastname: user?.lastname || '',
      email: user?.email || '',
      role: user?.role || 'user',
      isActive: user?.isActive !== false,
      address: {
        home: user?.address?.home || { street: '', city: '', state: '', zipcode: '', country: '' },
        office: user?.address?.office || { street: '', city: '', state: '', zipcode: '', country: '' }
      }
    });
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20">
      <RefreshCw size={40} className="text-indigo-600 animate-spin mb-4" />
      <p className="text-slate-500 font-bold">Fetching user data...</p>
    </div>
  );

  const fullName = [user?.firstname, user?.lastname].filter(Boolean).join(' ') || 'Guest User';
  const userInitial = user?.firstname?.charAt(0)?.toUpperCase() || 'U';

  const formatAddress = (addr) => {
    if (!addr) return null;
    const parts = [addr.street, addr.city, addr.state, addr.zipcode, addr.country].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : null;
  };

  return (
    <div className="max-w-screen mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <Link to="/admin/users" className="p-2 hover:bg-white rounded-xl text-slate-500 transition-all border border-transparent hover:border-slate-200">
          <ChevronLeft size={24} />
        </Link>
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">User Profile</h1>
          <p className="text-slate-500 font-medium font-sans">Manage account details and permissions for {fullName}.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-6">
          <div className="admin-card text-center p-8 overflow-hidden">
            <div className="w-24 h-24 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center text-4xl font-black border-2 border-indigo-100 mx-auto mb-4 shadow-xl shadow-indigo-500/10 overflow-hidden">
              {user?.avatar ? (
                <img src={`${import.meta.env.VITE_BASE_URL}${user.avatar}`} alt={fullName} className="w-full h-full object-cover" />
              ) : (
                userInitial
              )}
            </div>
            <h2 className="text-xl font-black text-slate-900 truncate uppercase tracking-tight">{fullName}</h2>
            <p className="text-sm font-bold text-slate-400 mb-6 truncate px-2">{user?.email}</p>
            
            <div className="flex items-center justify-center gap-2">
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${user?.isActive !== false ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                {user?.isActive !== false ? 'Active' : 'Inactive'}
              </span>
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-indigo-100 text-indigo-700">
                {user?.role || 'user'}
              </span>
            </div>
          </div>

          <div className="admin-card space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Account Stats</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-50 rounded-lg text-slate-400"><Calendar size={16} /></div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter leading-none mb-1">Joined On</p>
                  <p className="text-sm font-bold text-slate-800">{new Date(user?.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-50 rounded-lg text-slate-400"><Hash size={16} /></div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter leading-none mb-1">User ID</p>
                  <p className="text-[10px] font-bold text-slate-500 font-mono tracking-tighter truncate w-40">{user?._id}</p>
                </div>
              </div>
              {user?.orders && (
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-50 rounded-lg text-slate-400"><Package size={16} /></div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter leading-none mb-1">Total Orders</p>
                    <p className="text-sm font-bold text-slate-800">{user.orders.length}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="admin-card space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                <Shield size={20} className="text-indigo-600" /> 
                {isEditing ? 'Edit Permissions' : 'User Information'}
              </h3>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-indigo-600 hover:text-white transition-all"
                >
                  Edit
                </button>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={handleUpdate} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">First Name</label>
                    <input 
                      type="text" 
                      value={formData.firstname}
                      onChange={(e) => setFormData({...formData, firstname: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-bold text-slate-900 focus:outline-none focus:border-indigo-500 transition-all font-sans"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Last Name</label>
                    <input 
                      type="text" 
                      value={formData.lastname}
                      onChange={(e) => setFormData({...formData, lastname: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-bold text-slate-900 focus:outline-none focus:border-indigo-500 transition-all font-sans"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email Address</label>
                    <input 
                      type="email" 
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-bold text-slate-900 focus:outline-none focus:border-indigo-500 transition-all font-sans"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">User Role</label>
                    <select 
                      value={formData.role}
                      onChange={(e) => setFormData({...formData, role: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-bold text-slate-900 focus:outline-none focus:border-indigo-500 appearance-none cursor-pointer"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Account Status</label>
                    <div className="flex items-center h-[46px] gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4">
                      <input 
                        type="checkbox" 
                        checked={formData.isActive}
                        onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                        className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
                      />
                      <span className="text-sm font-bold text-slate-700">Account Active</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-6 pt-4 border-t border-slate-100">
                  <h4 className="text-xs font-black uppercase tracking-widest text-indigo-600">Saved Addresses Editing</h4>
                  
                  {/* Home Address Section */}
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Home Address</label>
                    <div className="grid grid-cols-1 gap-3">
                      <input 
                        type="text" 
                        placeholder="Street"
                        value={formData.address.home?.street}
                        onChange={(e) => setFormData({...formData, address: {...formData.address, home: {...formData.address.home, street: e.target.value}}})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-bold text-slate-800"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <input 
                          type="text" 
                          placeholder="City"
                          value={formData.address.home?.city}
                          onChange={(e) => setFormData({...formData, address: {...formData.address, home: {...formData.address.home, city: e.target.value}}})}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-bold text-slate-800"
                        />
                        <input 
                          type="text" 
                          placeholder="State"
                          value={formData.address.home?.state}
                          onChange={(e) => setFormData({...formData, address: {...formData.address, home: {...formData.address.home, state: e.target.value}}})}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-bold text-slate-800"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <input 
                          type="text" 
                          placeholder="Zipcode"
                          value={formData.address.home?.zipcode}
                          onChange={(e) => setFormData({...formData, address: {...formData.address, home: {...formData.address.home, zipcode: e.target.value}}})}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-bold text-slate-800"
                        />
                        <input 
                          type="text" 
                          placeholder="Country"
                          value={formData.address.home?.country}
                          onChange={(e) => setFormData({...formData, address: {...formData.address, home: {...formData.address.home, country: e.target.value}}})}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-bold text-slate-800"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Office Address Section */}
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Office Address</label>
                    <div className="grid grid-cols-1 gap-3">
                      <input 
                        type="text" 
                        placeholder="Street"
                        value={formData.address.office?.street}
                        onChange={(e) => setFormData({...formData, address: {...formData.address, office: {...formData.address.office, street: e.target.value}}})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-bold text-slate-800"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <input 
                          type="text" 
                          placeholder="City"
                          value={formData.address.office?.city}
                          onChange={(e) => setFormData({...formData, address: {...formData.address, office: {...formData.address.office, city: e.target.value}}})}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-bold text-slate-800"
                        />
                        <input 
                          type="text" 
                          placeholder="State"
                          value={formData.address.office?.state}
                          onChange={(e) => setFormData({...formData, address: {...formData.address, office: {...formData.address.office, state: e.target.value}}})}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-bold text-slate-800"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <input 
                          type="text" 
                          placeholder="Zipcode"
                          value={formData.address.office?.zipcode}
                          onChange={(e) => setFormData({...formData, address: {...formData.address, office: {...formData.address.office, zipcode: e.target.value}}})}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-bold text-slate-800"
                        />
                        <input 
                          type="text" 
                          placeholder="Country"
                          value={formData.address.office?.country}
                          onChange={(e) => setFormData({...formData, address: {...formData.address, office: {...formData.address.office, country: e.target.value}}})}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-bold text-slate-800"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-6">
                  <button 
                    type="submit"
                    disabled={saving}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/20 active:scale-95 disabled:opacity-50"
                  >
                    {saving ? <RefreshCw className="animate-spin" size={20} /> : <Save size={20} />}
                    {saving ? "Updating..." : "Save Changes"}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-6 py-4 bg-slate-100 text-slate-700 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">First Name</p>
                    <p className="text-sm font-bold text-slate-800">{user?.firstname || 'N/A'}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">Last Name</p>
                    <p className="text-sm font-bold text-slate-800">{user?.lastname || 'N/A'}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">Role</p>
                    <p className="text-sm font-bold text-slate-800 capitalize">{user?.role || 'user'}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">Status</p>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${user?.isActive !== false ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                      <p className="text-sm font-bold text-slate-800">{user?.isActive !== false ? 'Active' : 'Inactive'}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="admin-card space-y-4">
             <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Contact Information</h3>
             <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <Mail size={18} className="text-slate-400" />
                    <span className="text-sm font-bold text-slate-800">{user?.email || 'Not provided'}</span>
                </div>
             </div>
          </div>

          <div className="admin-card space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Saved Addresses</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Home Address */}
              <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <MapPin size={18} className="text-indigo-600 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 block mb-1">Home</span>
                  {user?.address?.home && formatAddress(user.address.home) ? (
                    <p className="text-sm font-medium text-slate-700 leading-relaxed">
                      {user.address.home.street && <>{user.address.home.street}<br/></>}
                      {user.address.home.city}{user.address.home.state && `, ${user.address.home.state}`}
                      {user.address.home.zipcode && ` - ${user.address.home.zipcode}`}
                      {user.address.home.country && <><br/>{user.address.home.country}</>}
                    </p>
                  ) : (
                    <div className="flex items-center gap-2 mt-1">
                      <AlertCircle size={14} className="text-slate-400" />
                      <p className="text-sm font-medium text-slate-400 italic">Address not available</p>
                    </div>
                  )}
                </div>
              </div>
              {/* Office Address */}
              <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <MapPin size={18} className="text-indigo-600 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 block mb-1">Office</span>
                  {user?.address?.office && formatAddress(user.address.office) ? (
                    <p className="text-sm font-medium text-slate-700 leading-relaxed">
                      {user.address.office.street && <>{user.address.office.street}<br/></>}
                      {user.address.office.city}{user.address.office.state && `, ${user.address.office.state}`}
                      {user.address.office.zipcode && ` - ${user.address.office.zipcode}`}
                      {user.address.office.country && <><br/>{user.address.office.country}</>}
                    </p>
                  ) : (
                    <div className="flex items-center gap-2 mt-1">
                      <AlertCircle size={14} className="text-slate-400" />
                      <p className="text-sm font-medium text-slate-400 italic">Address not available</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="admin-card space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Order History ({user?.orders?.length || 0})</h3>
            {user?.orders && user.orders.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">
                      <tr>
                        <th className="pb-3">Order ID</th>
                        <th className="pb-3">Date</th>
                        <th className="pb-3">Total</th>
                        <th className="pb-3">Status</th>
                        <th className="pb-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {user.orders
                        .slice((orderPage - 1) * ordersPerPage, orderPage * ordersPerPage)
                        .map((order) => (
                        <tr key={order._id} className="group hover:bg-slate-50/50 transition-colors">
                          <td className="py-3">
                            <Link to={`/admin/orders/${order._id}`} className="text-sm font-bold text-slate-900 hover:text-indigo-600 transition-colors">
                              #{order._id?.slice(-8).toUpperCase()}
                            </Link>
                          </td>
                          <td className="py-3 text-xs font-bold text-slate-500">
                            {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </td>
                          <td className="py-3 text-sm font-black text-indigo-600">₹{order.totalAmount}</td>
                          <td className="py-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                              order.status === 'delivered' ? 'bg-emerald-100 text-emerald-700' :
                              order.status === 'cancelled' ? 'bg-rose-100 text-rose-700' :
                              order.status === 'shipped' ? 'bg-indigo-100 text-indigo-700' :
                              'bg-orange-100 text-orange-700'
                            }`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="py-3 text-right">
                            <Link to={`/admin/orders/${order._id}`} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all inline-flex">
                              <Eye size={16} />
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <p className="text-xs text-slate-500 font-medium">
                    Showing <span className="font-bold text-slate-900">{(orderPage - 1) * ordersPerPage + 1}-{Math.min(orderPage * ordersPerPage, user.orders.length)}</span> of <span className="font-bold text-slate-900">{user.orders.length}</span> orders
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      disabled={orderPage === 1}
                      onClick={() => setOrderPage(p => p - 1)}
                      className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-600 disabled:opacity-30 transition-all font-bold"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <span className="text-xs font-black text-slate-500 px-2">
                      {orderPage} / {Math.ceil(user.orders.length / ordersPerPage)}
                    </span>
                    <button
                      disabled={orderPage >= Math.ceil(user.orders.length / ordersPerPage)}
                      onClick={() => setOrderPage(p => p + 1)}
                      className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-600 disabled:opacity-30 transition-all font-bold"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Package size={32} className="text-slate-300 mb-3" />
                <p className="text-sm font-bold text-slate-400">No orders yet</p>
                <p className="text-xs text-slate-400 font-medium">This user hasn't placed any orders.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserInfo;
