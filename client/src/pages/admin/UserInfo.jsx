import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, User, Mail, Shield, Calendar, RefreshCw, Save, Hash, MapPin, Package, Eye, AlertCircle, ChevronDown, Trash2, AlertTriangle } from 'lucide-react';
import api from '../../../utils/api';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import { setGlobalLoading } from '../../store/slices/loadingSlice';
import { X, Image as ImageIcon, Plus } from 'lucide-react';



const UserInfo = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.loading);
  const [user, setUser] = useState(null);


  const [isEditing, setIsEditing] = useState(false);
  const [orderPage, setOrderPage] = useState(1);
  const ordersPerPage = 5;
  const [isRoleOpen, setIsRoleOpen] = useState(false);
  const roleDropdownRef = useRef(null);

  const { schemas, loading: schemaLoading } = useSelector((state) => state.formSchema);
  const profileSchema = schemas?.profile;
  const fields = profileSchema?.fields || [];

  const [formData, setFormData] = useState({});
  const [filePreviews, setFilePreviews] = useState({});
  const [errors, setErrors] = useState({});

  // Helper to get nested value by path
  const getValueByPath = (obj, path) => {
    if (!path || !obj) return undefined;
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
  };

  // Helper to set nested value by path
  const setValueByPath = (obj, path, value) => {
    const parts = path.split('.');
    const newObj = { ...obj };
    let current = newObj;
    for (let i = 0; i < parts.length - 1; i++) {
      current[parts[i]] = { ...current[parts[i]] };
      current = current[parts[i]];
    }
    current[parts[parts.length - 1]] = value;
    return newObj;
  };

  const fetchUserDetails = async () => {
    try {
      dispatch(setGlobalLoading(true));

      const res = await api.get(`/admin/user/${id}`);
      const userData = res.data.data;
      setUser(userData);
      
      // Initialize form data from user data using schema fields
      const initialData = {};
      fields.forEach(field => {
        let value = getValueByPath(userData, field.name);
        
        // Intelligent fallback for address fields if specifically pathing to a 'fullAddress' string
        if (field.name.includes('address') && !value) {
            const baseDir = field.name.split('.').slice(0, 2).join('.'); // e.g., 'address.home'
            const baseObj = getValueByPath(userData, baseDir);
            if (baseObj && typeof baseObj === 'object') {
                const parts = [baseObj.street, baseObj.city, baseObj.state, baseObj.zipcode, baseObj.country].filter(Boolean);
                if (parts.length > 0) value = parts.join(', ');
            }
        }

        initialData[field.name] = value !== undefined ? value : (field.defaultValue !== undefined ? field.defaultValue : '');
      });
      setFormData(initialData);
    } catch (err) {
      toast.error("Failed to load user details");
      navigate("/admin/users");
    } finally {
      dispatch(setGlobalLoading(false));
    }

  };

  useEffect(() => {
    fetchUserDetails();
  }, [id]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(event.target)) {
        setIsRoleOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (type === 'file') {
      const file = files[0];
      if (file) {
        setFormData(prev => ({ ...prev, [name]: file }));
        setFilePreviews(prev => ({ ...prev, [name]: URL.createObjectURL(file) }));
      }
    } else if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const removeFile = (fieldName) => {
    setFormData(prev => ({ ...prev, [fieldName]: null }));
    setFilePreviews(prev => {
      const newPreviews = { ...prev };
      delete newPreviews[fieldName];
      return newPreviews;
    });
  };

  const validateForm = () => {
    const newErrors = {};
    fields.forEach(field => {
      const value = formData[field.name];
      const validation = field.validation || {};

      if (validation.required && (value === undefined || value === null || value === '' || value === false)) {
        newErrors[field.name] = validation.errorMessage || `${field.label} is required`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!validateForm()) return toast.error("Please fix the errors in the form");

    try {
      dispatch(setGlobalLoading(true));

      const submissionData = new FormData();
      fields.forEach(field => {
        const value = formData[field.name];
        if (value !== null && value !== undefined) {
          submissionData.append(field.name, value);
        }
      });

      await api.patch(`/admin/user/${id}`, submissionData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success("User updated successfully!");
      setIsEditing(false);
      fetchUserDetails();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update user");
    } finally {
      dispatch(setGlobalLoading(false));
    }
  };

  const handleDeleteUser = async () => {
    if (!window.confirm("Are you sure you want to permanently delete this user? This action cannot be undone and will remove all associated account data.")) {
      return;
    }

    try {
      dispatch(setGlobalLoading(true));
      await api.delete(`/admin/user/${id}`);
      toast.success("User account deleted successfully");
      navigate("/admin/users");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete user");
    } finally {
      dispatch(setGlobalLoading(false));
    }
  };



  const handleCancel = () => {
    setIsEditing(false);
    
    // Restore form data from current user state using schema fields
    const initialData = {};
    fields.forEach(field => {
      const value = getValueByPath(user, field.name);
      initialData[field.name] = value !== undefined ? value : (field.defaultValue !== undefined ? field.defaultValue : '');
    });
    setFormData(initialData);
    setFilePreviews({});
    setErrors({});
  };

  const renderInput = (field) => {
    const commonProps = {
      name: field.name,
      value: (field.type !== 'file' && field.type !== 'checkbox') ? formData[field.name] || '' : undefined,
      onChange: handleInputChange,
      placeholder: field.placeholder,
      className: `w-full bg-slate-50 border ${errors[field.name] ? 'border-rose-400 focus:border-rose-500 ring-rose-50' : 'border-slate-200 focus:border-indigo-500 transition-all font-sans'} rounded-lg py-1.5 px-3 text-xs font-bold text-slate-900 focus:outline-none`
    };

    if (field.type === 'textarea') {
      return <textarea {...commonProps} rows="3" className={commonProps.className + " resize-none"} />;
    }

    if (field.type === 'select') {
      const options = field.options || [];
      return (
        <div className="relative">
          <select {...commonProps} className={commonProps.className + " appearance-none cursor-pointer"}>
            <option value="">{field.placeholder || "Select Option"}</option>
            {options.map(opt => (
              <option key={opt.value || opt} value={opt.value || opt}>{opt.label || opt}</option>
            ))}
            {/* Fallback for role if not in options */}
            {field.name === 'role' && !options.length && (
              <>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </>
            )}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
            <ChevronDown size={14} />
          </div>
        </div>
      );
    }

    if (field.type === 'checkbox') {
      return (
        <div className="flex items-center h-[36px] gap-3 bg-slate-50 border border-slate-200 rounded-lg px-3">
          <input
            type="checkbox"
            name={field.name}
            checked={!!formData[field.name]}
            onChange={handleInputChange}
            className="w-3.5 h-3.5 text-indigo-600 rounded cursor-pointer"
          />
          <span className="text-xs font-bold text-slate-700">{field.placeholder || "Enable"}</span>
        </div>
      );
    }

    if (field.type === 'file') {
      return (
        <div className="space-y-4">
          {filePreviews[field.name] ? (
             <div className="relative group w-32 h-32 rounded-2xl bg-white border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-all">
                <img src={filePreviews[field.name]} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeFile(field.name)}
                  className="absolute top-1 right-1 p-1 bg-white/90 backdrop-blur rounded-lg text-rose-600 shadow-sm active:scale-90"
                >
                  <X size={12} strokeWidth={3} />
                </button>
             </div>
          ) : (
            <label className="w-full h-24 rounded-xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-300 hover:border-indigo-500 hover:text-indigo-500 hover:bg-indigo-50/30 transition-all cursor-pointer group">
              <ImageIcon size={20} className="group-hover:text-indigo-600 transition-colors" />
              <span className="text-[10px] font-black mt-2 uppercase tracking-widest text-slate-400 group-hover:text-indigo-600 transition-colors">{field.placeholder || "Upload Image"}</span>
              <input type="file" className="hidden" name={field.name} onChange={handleInputChange} accept="image/*" />
            </label>
          )}
        </div>
      );
    }

    return <input {...commonProps} type={field.type} />;
  };

  if (schemaLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <RefreshCw size={40} className="animate-spin text-indigo-600" />
        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Hydrating Form Configurations...</p>
      </div>
    );
  }

  if (isLoading && !user) return <div className="min-h-[400px] flex items-center justify-center"></div>;

  const fullName = [user?.firstname, user?.lastname].filter(Boolean).join(' ') || 'Guest User';

  const userInitial = user?.firstname?.charAt(0)?.toUpperCase() || 'U';

  const formatAddress = (addr) => {
    if (!addr) return null;
    const parts = [addr.street, addr.city, addr.state, addr.zipcode, addr.country].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : null;
  };

  return (
    <div className="max-w-screen space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-white rounded-xl text-slate-500 transition-all border border-transparent hover:border-slate-200">
          <ChevronLeft size={24} />
        </button>
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">User Profile</h1>
          <p className="text-slate-500 font-medium font-sans">Manage account details and permissions for {fullName}.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-6">
          <div className="admin-card text-center p-5 overflow-hidden">
            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-2xl font-black border-2 border-indigo-100 mx-auto mb-3 shadow-xl shadow-indigo-500/10 overflow-hidden relative group">
              {isEditing ? (
                <div className="w-full h-full relative group/avatar">
                  {fields.filter(f => f.name === 'avatar').map(field => (
                    <div key={field.name} className="w-full h-full">
                      {filePreviews[field.name] ? (
                        <div className="relative w-full h-full">
                          <img src={filePreviews[field.name]} alt="Preview" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeFile(field.name)}
                            className="absolute top-0.5 right-0.5 p-1 bg-white/90 backdrop-blur rounded-lg text-rose-600 shadow-sm z-10 active:scale-90"
                          >
                            <X size={10} strokeWidth={3} />
                          </button>
                        </div>
                      ) : (
                        <label className="w-full h-full flex flex-col items-center justify-center relative transition-all cursor-pointer overflow-hidden">
                          {user?.avatar ? (
                            <img src={`${import.meta.env.VITE_BASE_URL}/${user.avatar}`} alt={fullName} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-indigo-600">{userInitial}</span>
                          )}
                          <div className="absolute inset-0 bg-indigo-600/60 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity">
                            <ImageIcon size={20} className="text-white" />
                          </div>
                          <input type="file" className="hidden" name={field.name} onChange={handleInputChange} accept="image/*" />
                        </label>
                      )}
                    </div>
                  ))}
                  {/* Fallback display if no avatar field defined in schema */}
                  {!fields.find(f => f.name === 'avatar') && (
                     user?.avatar ? (
                        <img src={`${import.meta.env.VITE_BASE_URL}/${user.avatar}`} alt={fullName} className="w-full h-full object-cover" />
                      ) : (
                        userInitial
                      )
                  )}
                </div>
              ) : (
                user?.avatar ? (
                  <img src={`${import.meta.env.VITE_BASE_URL}/${user.avatar}`} alt={fullName} className="w-full h-full object-cover" />
                ) : (
                  userInitial
                )
              )}
            </div>
            <h2 className="text-lg font-black text-slate-900 truncate uppercase tracking-tight">{fullName}</h2>
            <p className="text-[11px] font-bold text-slate-400 mb-4 truncate px-2">{user?.email}</p>

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


          <div className="admin-card space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Saved Addresses</h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-start gap-3 p-4 bg-white/60 rounded-2xl border border-slate-100 shadow-sm">
                <MapPin size={18} className="text-indigo-600 mt-1 shrink-0" />
                <div className="flex-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 block mb-1">Home Address</span>
                  {isEditing ? (
                    <div className="space-y-1">
                      {fields.filter(f => f.name === 'address.home.fullAddress').map(field => (
                        <div key={field.name}>
                          {renderInput(field)}
                          {errors[field.name] && <p className="text-[9px] text-rose-500 italic mt-1">{errors[field.name]}</p>}
                        </div>
                      ))}
                      {!fields.find(f => f.name === 'address.home.fullAddress') && (
                         <p className="text-xs font-bold text-slate-400 italic">No home address field in schema</p>
                      )}
                    </div>
                  ) : (
                    user?.address?.home && formatAddress(user.address.home) ? (
                      <p className="text-sm font-medium text-slate-700 leading-relaxed">
                        {user.address.home.street && <>{user.address.home.street}<br /></>}
                        {user.address.home.city}{user.address.home.state && `, ${user.address.home.state}`}
                        {user.address.home.zipcode && ` - ${user.address.home.zipcode}`}
                      </p>
                    ) : (
                      <p className="text-sm font-medium text-slate-400 italic">No home address</p>
                    )
                  )}
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-white/60 rounded-2xl border border-slate-100 shadow-sm">
                <MapPin size={18} className="text-indigo-600 mt-1 shrink-0" />
                <div className="flex-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 block mb-1">Office Address</span>
                  {isEditing ? (
                    <div className="space-y-1">
                      {fields.filter(f => f.name === 'address.office.fullAddress').map(field => (
                        <div key={field.name}>
                          {renderInput(field)}
                          {errors[field.name] && <p className="text-[9px] text-rose-500 italic mt-1">{errors[field.name]}</p>}
                        </div>
                      ))}
                      {!fields.find(f => f.name === 'address.office.fullAddress') && (
                         <p className="text-xs font-bold text-slate-400 italic">No office address field in schema</p>
                      )}
                    </div>
                  ) : (
                    user?.address?.office && formatAddress(user.address.office) ? (
                      <p className="text-sm font-medium text-slate-700 leading-relaxed">
                        {user.address.office.street && <>{user.address.office.street}<br /></>}
                        {user.address.office.city}{user.address.office.state && `, ${user.address.office.state}`}
                        {user.address.office.zipcode && ` - ${user.address.office.zipcode}`}
                      </p>
                    ) : (
                      <p className="text-sm font-medium text-slate-400 italic">No office address</p>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="admin-card border-rose-100 bg-rose-50/30 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-rose-500 flex items-center gap-2">
              <AlertTriangle size={14} />
              Danger Zone
            </h3>
            <p className="text-[10px] font-bold text-rose-400 leading-relaxed">
              Permanently delete this user account. This action is irreversible and will remove all their data.
            </p>
            <button
              onClick={handleDeleteUser}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-50 text-rose-600 border border-rose-200 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white hover:border-rose-600 transition-all active:scale-95"
            >
              <Trash2 size={14} />
              Delete Account
            </button>
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
              <form onSubmit={handleUpdate} className="space-y-6 max-w-4xl">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Main Information */}
                  <div className="space-y-6">
                    {fields.filter(f => 
                      !['file', 'select', 'checkbox', 'radio'].includes(f.type) && 
                      !f.name.includes('address')
                    ).map(field => (
                      <div key={field.name} className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1 flex justify-between">
                          {field.label}
                          {errors[field.name] && <span className="text-rose-500 lowercase italic font-bold">{errors[field.name]}</span>}
                        </label>
                        {renderInput(field)}
                      </div>
                    ))}
                  </div>

                  {/* Classification & Digital Assets (Filtered) */}
                  <div className="space-y-6">
                    {/* Classification */}
                    <div className="space-y-6">
                      {fields.filter(f => ['select', 'checkbox', 'radio'].includes(f.type)).map(field => (
                        <div key={field.name} className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1 flex justify-between">
                            {field.label}
                            {errors[field.name] && <span className="text-rose-500 lowercase italic font-bold">{errors[field.name]}</span>}
                          </label>
                          {renderInput(field)}
                        </div>
                      ))}
                    </div>

                    {/* Digital Assets Section (Only for non-avatar files if any) */}
                    {fields.filter(f => f.type === 'file' && f.name !== 'avatar').length > 0 && (
                      <div className="space-y-6">
                        {fields.filter(f => f.type === 'file' && f.name !== 'avatar').map(field => (
                          <div key={field.name} className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1 flex justify-between">
                              {field.label}
                              {errors[field.name] && <span className="text-rose-500 lowercase italic font-bold">{errors[field.name]}</span>}
                            </label>
                            {renderInput(field)}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-6 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all active:scale-95"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center justify-center gap-2 px-8 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 active:scale-95 disabled:opacity-50"
                  >
                    <Save size={18} />
                    Save Changes
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
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${order.status === 'delivered' ? 'bg-emerald-100 text-emerald-700' :
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
