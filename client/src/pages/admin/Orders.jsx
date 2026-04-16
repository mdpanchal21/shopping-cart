import React, { useState, useEffect, useRef } from "react";
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  Search,
  Filter,
  RefreshCw,
  Eye,
  ChevronLeft,
  ChevronRight,
  ChevronDown
} from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api from "../../../utils/api";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { setGlobalLoading } from "../../store/slices/loadingSlice";
import GlobalLoader from "./components/GlobalLoader";


const Orders = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.loading);
  const [orders, setOrders] = useState(null);
  const [loadedMeta, setLoadedMeta] = useState({ page: 1, limit: 10, total: 0 });



  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [page, setPage] = useState(parseInt(searchParams.get("page"), 10) || 1);
  const [limit, setLimit] = useState(parseInt(searchParams.get("limit"), 10) || 10);
  const [totalPages, setTotalPages] = useState(1);
  const [isLimitOpen, setIsLimitOpen] = useState(false);
  const limitDropdownRef = useRef(null);
  const [totalOrders, setTotalOrders] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams();
    if (page && page !== 1) params.set("page", page);
    if (limit && limit !== 10) params.set("limit", limit);
    if (searchTerm) params.set("search", searchTerm);

    setSearchParams(params, { replace: true });
  }, [page, limit, searchTerm, setSearchParams]);

  const fetchOrders = async (currentPage = page, search = searchTerm, currentLimit = limit) => {
    try {
      dispatch(setGlobalLoading(true));

      const res = await api.get("/orderstatus", {
        params: {
          page: currentPage,
          limit: currentLimit,
          search: search || undefined
        }
      });
      setOrders(res.data.data || []);
      setTotalPages(res.data.totalPages || 1);
      setTotalOrders(res.data.totalOrders || 0);
      setPage(res.data.currentPage || 1);
      setLoadedMeta({
        page: res.data.currentPage || 1,
        limit: currentLimit,
        total: res.data.totalOrders || 0
      });
      // Force scroll to top on data load
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      toast.error("Failed to fetch orders");
    } finally {
      dispatch(setGlobalLoading(false));
    }

  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchOrders(page, searchTerm, limit);
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

  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return "bg-emerald-100 text-emerald-700";
      case "processing":
        return "bg-blue-100 text-blue-700";
      case "shipped":
        return "bg-indigo-100 text-indigo-700";
      case "cancelled":
        return "bg-rose-100 text-rose-700";
      default:
        return "bg-orange-100 text-orange-700";
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">
            Order Management
          </h1>
          <p className="text-slate-500 mt-1 font-medium text-sm lg:text-base">
            Track customer orders across your store.
          </p>
        </div>
      </div>

      <div className="admin-card">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4 w-full lg:flex-1 lg:max-w-md">
            <div className="relative group flex-1">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors"
                size={18}
              />
              <input
                type="text"
                placeholder="Search by Order ID or Customer..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-12 pr-4 text-sm text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none font-medium"
              />
            </div>

            <button
              onClick={() => fetchOrders(page)}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:text-indigo-600 font-bold text-sm transition-all shadow-sm active:scale-95 lg:hidden"
              title="Refresh data"
            >
              <RefreshCw size={16} />
            </button>
          </div>

          <button
            onClick={() => fetchOrders(page)}
            className="hidden lg:flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-indigo-600 font-bold text-sm transition-colors"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        <div className="relative min-h-[600px] flex flex-col">
          <GlobalLoader forceShow={orders === null} />
          {orders && !isLoading && orders.length === 0 ? (

            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-100">
              <Package size={48} className="text-slate-200 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-1">
                No orders found
              </h3>
              <p className="text-slate-500 font-medium">
                Customer orders will appear here once placed.
              </p>
            </div>
          ) : orders && orders.length > 0 ? (
            <>
              <div className="flex-1 overflow-x-auto transition-opacity duration-300">

                <table className="w-full text-left font-sans">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 text-xs font-black uppercase tracking-widest">
                      <th className="px-4 py-4">Order Id</th>
                      <th className="px-4 py-4">Customer</th>
                      <th className="px-4 py-4">Date</th>
                      <th className="px-4 py-4">Total Amount</th>
                      <th className="px-4 py-4">Status</th>
                      <th className="px-4 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {orders.map((order) => (
                      <tr
                        key={order._id}
                        className="group hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="px-4 py-4">
                          <Link
                            to={`/admin/orders/${order._id}`}
                            className="font-bold text-slate-900 text-sm hover:text-indigo-600 transition-colors"
                          >
                            #{order._id?.slice(-8).toUpperCase()}
                          </Link>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-800 text-sm">
                              {order.createdBy?.firstname &&
                                order.createdBy?.lastname
                                ? `${order.createdBy?.firstname} ${order.createdBy?.lastname}`
                                : "Guest User"}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium mt-0.5">
                              {order.createdBy?.email || "No Email"}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-sm font-bold text-slate-600">
                            {new Date(order.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-sm font-black text-indigo-600">
                            ${order.totalAmount}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusStyle(order.status)}`}
                          >
                            {order.status || "Pending"}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right border-l border-transparent group-hover:border-slate-100 transition-all">
                          <div className="flex items-center justify-end gap-1">
                            <Link
                              to={`/admin/orders/${order._id}`}
                              className="p-2 text-slate-400 hover:text-indigo-600 transition-all active:scale-95"
                              title="View Order Details"
                            >
                              <Eye size={18} />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>              {totalPages > 0 && (
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
                    
                    <div className="h-4 w-[1px] bg-slate-300 flex-shrink-0 lg:hidden" />
                    
                    <div className="flex-shrink-0 lg:hidden">
                      <p className="text-[10px] sm:text-xs text-slate-500 font-medium tracking-tight whitespace-nowrap">
                        Showing <span className="text-slate-900 font-bold">{(loadedMeta.page - 1) * loadedMeta.limit + 1}-{Math.min(loadedMeta.page * loadedMeta.limit, loadedMeta.total)}</span> of <span className="text-slate-900 font-bold">{loadedMeta.total}</span> <span className="text-slate-900 font-bold">orders</span>
                      </p>
                    </div>
                  </div>
                  
                  <div className="hidden lg:flex items-center justify-center">
                    <p className="text-sm text-slate-500 font-medium tracking-tight text-center">
                      Showing <span className="text-slate-900 font-bold">{(loadedMeta.page - 1) * loadedMeta.limit + 1}-{Math.min(loadedMeta.page * loadedMeta.limit, loadedMeta.total)}</span> of <span className="text-slate-900 font-bold">{loadedMeta.total}</span> orders
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

export default Orders;
