import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api from "../../../utils/api";
import { toast } from "react-toastify";

const Orders = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [page, setPage] = useState(parseInt(searchParams.get("page"), 10) || 1);
  const [limit, setLimit] = useState(parseInt(searchParams.get("limit"), 10) || 10);
  const [totalPages, setTotalPages] = useState(1);
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
      setLoading(true);
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
    } catch (err) {
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
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
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Order Management
          </h1>
          <p className="text-slate-500 mt-1 font-medium">
            Track and update customer orders across your store.
          </p>
        </div>
        <button
          onClick={() => fetchOrders(page)}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-900 rounded-2xl text-sm font-bold hover:bg-slate-50 transition-all shadow-sm active:scale-95"
        >
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          Refresh Orders
        </button>
      </div>

      <div className="admin-card overflow-hidden">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          <div className="relative group w-full md:w-96">
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
        </div>

        {loading && orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <RefreshCw
              size={40}
              className="text-indigo-600 animate-spin mb-4"
            />
            <p className="text-slate-500 font-bold">Loading orders...</p>
          </div>
        ) : orders.length > 0 ? (
          <>
            <div className={`overflow-x-auto transition-opacity duration-300 ${loading ? 'opacity-50' : 'opacity-100'}`}>
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
                          ₹{order.totalAmount}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusStyle(order.status)}`}
                        >
                          {order.status || "Pending"}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <Link
                          to={`/admin/orders/${order._id}`}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-indigo-600 hover:text-white transition-all shadow-sm active:scale-95"
                        >
                          <Eye size={14} />
                          Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {totalPages > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 px-2">
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
                    Showing <span className="text-slate-900 font-bold">{(page - 1) * limit + 1}-{Math.min(page * limit, totalOrders)}</span> of <span className="text-slate-900 font-bold">{totalOrders}</span> orders
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
            <Package size={48} className="text-slate-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-1">
              No orders found
            </h3>
            <p className="text-slate-500 font-medium">
              Customer orders will appear here once placed.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
