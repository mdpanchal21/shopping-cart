import React, { useState, useEffect ,useRef} from 'react';
import { User as UserIcon, Mail, Shield, Search, RefreshCw, ChevronRight, ChevronLeft,ChevronDown,  LayoutGrid, List as ListIcon, Eye } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../../../utils/api';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from "react-redux";
import { setGlobalLoading } from '../../store/slices/loadingSlice';
import GlobalLoader from './components/GlobalLoader';



const Users = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.loading);
  const [users, setUsers] = useState(null);
  const [loadedMeta, setLoadedMeta] = useState({ page: 1, limit: 10, total: 0 });


  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [viewMode, setViewMode] = useState('list');

  const [page, setPage] = useState(parseInt(searchParams.get("page"), 10) || 1);
  const [limit, setLimit] = useState(parseInt(searchParams.get("limit"), 10) || 10);
  const [totalPages, setTotalPages] = useState(1);
  const [isLimitOpen, setIsLimitOpen] = useState(false);
  const limitDropdownRef = useRef(null);
  const [totalUsers, setTotalUsers] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams();
    if (page && page !== 1) params.set("page", page);
    if (limit && limit !== 10) params.set("limit", limit);
    if (searchTerm) params.set("search", searchTerm);

    setSearchParams(params, { replace: true });
  }, [page, limit, searchTerm, setSearchParams]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (limitDropdownRef.current && !limitDropdownRef.current.contains(event.target)) {
        setIsLimitOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchUsers = async (currentPage = page, search = searchTerm, currentLimit = limit) => {
    try {
      dispatch(setGlobalLoading(true));

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
      setLoadedMeta({
        page: res.data.currentPage || 1,
        limit: currentLimit,
        total: res.data.totalUsers || 0
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      toast.error("Failed to fetch users");
    } finally {
      dispatch(setGlobalLoading(false));
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
          <h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight uppercase">User Management</h1>
          <p className="text-slate-500 mt-1 font-medium text-sm lg:text-base">Manage customer accounts, roles, and status.</p>
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
        </div>
      </div>

      <div className="admin-card overflow-hidden">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4 w-full lg:flex-1 lg:max-w-md">
            <div className="relative group flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-12 pr-4 text-sm text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none font-medium"
              />
            </div>

            <button
              onClick={fetchUsers}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:text-indigo-600 font-bold text-sm transition-all shadow-sm active:scale-95 lg:hidden"
              title="Refresh data"
            >
              <RefreshCw size={16} />
            </button>
          </div>

          <button
            onClick={fetchUsers}
            className="hidden lg:flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-indigo-600 font-bold text-sm transition-colors"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        <div className="relative min-h-[600px] flex flex-col">
          <GlobalLoader forceShow={users === null} />
          {users && !isLoading && users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 h-[600px] bg-white rounded-3xl border border-slate-100">
              <UserIcon size={48} className="text-slate-200 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-1 uppercase tracking-tight">No users found</h3>
              <p className="text-slate-500 font-medium">Customer accounts will appear here.</p>
            </div>
          ) : users && users.length > 0 ? (
            <>
              <div className="flex-1">
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
                                    <img src={`${import.meta.env.VITE_BASE_URL}/${user.avatar}`} alt={user.firstname} className="w-full h-full object-cover" />
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
                            <td className="px-4 py-4 text-right border-l border-transparent group-hover:border-slate-100 transition-all">
                              <div className="flex items-center justify-end gap-1">
                                <Link
                                  to={`/admin/users/${user._id}`}
                                  className="p-2 text-slate-400 hover:text-indigo-600 transition-all active:scale-95"
                                  title="View Profile"
                                >
                                  <Eye size={18} />
                                </Link>
                              </div>
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
                            <img src={`${import.meta.env.VITE_BASE_URL}/${user.avatar}`} alt={user.firstname} className="w-full h-full object-cover" />
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
              </div>
              {totalPages > 0 && (
                  <div className="flex flex-col lg:grid lg:grid-cols-3 items-center gap-4 mt-8 px-2 pt-6 border-t border-slate-100 pb-4">
                  <div className="flex flex-row items-center justify-center lg:justify-start gap-4 w-full lg:w-auto">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 whitespace-nowrap">Per Page:</span>
                      <div className="relative" ref={limitDropdownRef}>
                        <button
                          onClick={() => setIsLimitOpen(!isLimitOpen)}
                          className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 flex items-center gap-2 text-xs text-slate-700 font-bold focus:outline-none focus:border-indigo-500 hover:border-indigo-500 transition-all shadow-sm group min-w-[60px]"
                        >
                          {limit}
                          <ChevronDown size={14} className={`text-slate-400 group-hover:text-indigo-600 transition-transform duration-200 ${isLimitOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isLimitOpen && (
                          <div className="absolute bottom-full mb-2 left-0 z-50 min-w-[80px] bg-white border border-slate-100 rounded-xl shadow-2xl p-1 animate-in fade-in zoom-in-95 duration-200 origin-bottom">
                            {[10, 20, 30, 40, 50].map((val) => (
                              <button
                                key={val}
                                onClick={() => {
                                  setLimit(val);
                                  setPage(1);
                                  setIsLimitOpen(false);
                                }}
                                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                                  limit === val
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                                    : 'text-slate-600 hover:bg-indigo-50 hover:text-indigo-600'
                                }`}
                              >
                                {val}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="h-4 w-[1px] bg-slate-200 flex-shrink-0 lg:hidden" />
                    
                    <div className="flex-shrink-0 lg:hidden">
                      <p className="text-[10px] sm:text-xs text-slate-500 font-medium tracking-tight whitespace-nowrap">
                        Showing <span className="text-slate-900 font-bold">{(loadedMeta.page - 1) * loadedMeta.limit + 1}-{Math.min(loadedMeta.page * loadedMeta.limit, loadedMeta.total)}</span> of <span className="text-slate-900 font-bold">{loadedMeta.total}</span> <span className="text-slate-900 font-bold">users</span>
                      </p>
                    </div>
                  </div>
                  
                  <div className="hidden lg:flex items-center justify-center">
                    <p className="text-sm text-slate-500 font-medium tracking-tight text-center">
                      Showing <span className="text-slate-900 font-bold">{(loadedMeta.page - 1) * loadedMeta.limit + 1}-{Math.min(loadedMeta.page * loadedMeta.limit, loadedMeta.total)}</span> of <span className="text-slate-900 font-bold">{loadedMeta.total}</span> users
                    </p>
                  </div>

                  <div className="flex items-center justify-center lg:justify-end gap-3 w-full lg:w-auto">
                    <button
                      disabled={page === 1}
                      onClick={() => { setPage(p => Math.max(1, p - 1)); }}
                      className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-600 disabled:opacity-30 disabled:hover:border-slate-200 disabled:hover:text-slate-600 transition-all font-bold group shadow-sm"
                    >
                      <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    </button>

                    <div className="flex items-center gap-2 bg-white px-5 py-2 rounded-xl border border-slate-200 shadow-sm">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Page</span>
                      <span className="text-sm font-black text-indigo-600">{page}</span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">of {totalPages}</span>
                    </div>

                    <button
                      disabled={page === totalPages}
                      onClick={() => { setPage(p => Math.min(totalPages, p + 1)); }}
                      className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-600 disabled:opacity-30 disabled:hover:border-slate-200 disabled:hover:text-slate-600 transition-all font-bold group shadow-sm"
                    >
                      <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default Users;
