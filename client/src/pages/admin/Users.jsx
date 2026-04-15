import React, { useState, useEffect } from 'react';
import { User as UserIcon, Mail, Shield, Search, RefreshCw, ChevronRight, ChevronLeft, LayoutGrid, List as ListIcon } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../../../utils/api';
import { toast } from 'react-toastify';

const Users = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [viewMode, setViewMode] = useState('list');

  const [page, setPage] = useState(parseInt(searchParams.get("page"), 10) || 1);
  const [limit, setLimit] = useState(parseInt(searchParams.get("limit"), 10) || 10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams();
    if (page && page !== 1) params.set("page", page);
    if (limit && limit !== 10) params.set("limit", limit);
    if (searchTerm) params.set("search", searchTerm);
    
    setSearchParams(params, { replace: true });
  }, [page, limit, searchTerm, setSearchParams]);

  const fetchUsers = async (currentPage = page, search = searchTerm, currentLimit = limit) => {
    try {
      setLoading(true);
      const res = await api.get("/admin/user", {
        params: {
          page: currentPage,
          limit: currentLimit,
          search: search || undefined
        }
      });
      setUsers(res.data.data || []);
      setTotalPages(res.data.totalPages || 1);
      setTotalUsers(res.data.totalUsers || 0);
      setPage(res.data.currentPage || 1);
      // console.log(res)
    } catch (err) {
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers(page, searchTerm, limit);
    }, 300);

    return () => clearTimeout(timer);
  }, [page, limit, searchTerm]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  const handleLimitChange = (e) => {
    setLimit(parseInt(e.target.value, 10));
    setPage(1);
  };



  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">User Management</h1>
          <p className="text-slate-500 mt-1 font-medium">Manage customer accounts, roles, and status.</p>
        </div>
        <div className="flex items-center gap-2">
            <div className="bg-white border border-slate-200 rounded-xl p-1 flex">
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    <ListIcon size={18} />
                </button>
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    <LayoutGrid size={18} />
                </button>
            </div>
          <button 
            onClick={fetchUsers}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-900 rounded-2xl text-sm font-bold hover:bg-slate-50 transition-all shadow-sm active:scale-95"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <div className="admin-card overflow-hidden">
        <div className="flex items-center gap-4 mb-8">
          <div className="relative group flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-12 pr-4 text-sm text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none font-medium"
            />
          </div>
        </div>

        {loading && users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <RefreshCw size={40} className="text-indigo-600 animate-spin mb-4" />
            <p className="text-slate-500 font-bold">Loading users...</p>
          </div>
        ) : users.length > 0 ? (
          <>
          {viewMode === 'list' ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left font-sans">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest leading-non">
                    <th className="px-4 py-4">User Details</th>
                    <th className="px-4 py-4">Role / Access</th>
                    <th className="px-4 py-4">Status</th>
                    <th className="px-4 py-4">Joined At</th>
                    <th className="px-4 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {users.map((user) => (
                    <tr key={user._id} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-4">
                        <Link
                          to={`/admin/users/${user._id}`}
                          className="flex items-center gap-4 group/link"
                        >
                          <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-black border border-indigo-100 group-hover/link:border-indigo-300 transition-colors overflow-hidden">
                            {user.avatar ? (
                              <img src={`${import.meta.env.VITE_BASE_URL}${user.avatar}`} alt={user.firstname} className="w-full h-full object-cover" />
                            ) : (
                              user.firstname?.charAt(0) || 'U'
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900 group-hover/link:text-indigo-600 transition-colors">{[user.firstname, user.lastname].filter(Boolean).join(" ") || "Guest User"}</p>
                            <p className="text-[10px] text-slate-400 font-bold flex items-center gap-1 uppercase tracking-tighter">
                              <Mail size={10} /> {user.email}
                            </p>
                          </div>
                        </Link>
                      </td>
                      <td className="px-4 py-4">
                        <span className="flex items-center gap-2 text-xs font-bold text-slate-600">
                          <Shield size={14} className={user.role === 'admin' ? 'text-indigo-600' : 'text-slate-300'} />
                          <span className="capitalize">{user.role || 'customer'}</span>
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm">
                        <div className="flex items-center gap-2">
                           <div className={`w-2 h-2 rounded-full ${user.isActive !== false ? 'bg-emerald-500 shadow-lg shadow-emerald-500/20' : 'bg-slate-300'}`}></div>
                           <span className={`text-[10px] font-black uppercase tracking-widest ${user.isActive !== false ? 'text-emerald-700' : 'text-slate-400'}`}>
                             {user.isActive !== false ? 'Active' : 'Inactive'}
                           </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-xs font-bold text-slate-500 uppercase">
                        {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <Link 
                          to={`/admin/users/${user._id}`}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-sm active:scale-95"
                        >
                          View Profile
                          <ChevronRight size={14} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {users.map((user) => (
                    <Link 
                      key={user._id} 
                      to={`/admin/users/${user._id}`}
                      className="admin-card group hover:border-indigo-500/30 transition-all flex items-center gap-4"
                    >
                        <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 text-2xl font-black border border-indigo-100 overflow-hidden">
                            {user.avatar ? (
                              <img src={`${import.meta.env.VITE_BASE_URL}${user.avatar}`} alt={user.firstname} className="w-full h-full object-cover" />
                            ) : (
                              user.firstname?.charAt(0) || 'U'
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-slate-900 truncate group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{[user.firstname, user.lastname].filter(Boolean).join(' ') || 'Guest User'}</h3>
                            <p className="text-xs text-slate-500 font-medium truncate mb-2">{user.email}</p>
                            <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                {user.role || 'Customer'}
                            </span>
                        </div>
                    </Link>
                ))}
            </div>
          )}
          {totalPages > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 px-2 pt-6 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-tight">Per Page:</span>
                <select
                  value={limit}
                  onChange={handleLimitChange}
                  className="bg-white border border-slate-200 rounded-xl px-2 py-1.5 text-xs text-slate-700 font-bold focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer shadow-sm"
                >
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="30">30</option>
                  <option value="40">40</option>
                  <option value="50">50</option>
                </select>
              </div>
              <div className="flex items-center gap-4">
                <p className="text-sm text-slate-500 font-medium tracking-tight">
                  Showing <span className="text-slate-900 font-bold">{(page - 1) * limit + 1}-{Math.min(page * limit, totalUsers)}</span> of <span className="text-slate-900 font-bold">{totalUsers}</span> users
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-600 disabled:opacity-30 disabled:hover:border-slate-200 disabled:hover:text-slate-600 transition-all font-bold group shadow-sm"
                >
                  <ChevronLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
                </button>

                <div className="flex items-center gap-2 bg-white px-5 py-2 rounded-xl border border-slate-200 shadow-sm">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Page</span>
                  <span className="text-sm font-black text-indigo-600">{page}</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">of {totalPages}</span>
                </div>

                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-600 disabled:opacity-30 disabled:hover:border-slate-200 disabled:hover:text-slate-600 transition-all font-bold group shadow-sm"
                >
                  <ChevronRight size={20} className="group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          )}
          </>
        ) : (
          <div className="text-center py-20">
            <UserIcon size={48} className="text-slate-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-1 uppercase tracking-tight">No users found</h3>
            <p className="text-slate-500 font-medium">Customer accounts will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Users;
