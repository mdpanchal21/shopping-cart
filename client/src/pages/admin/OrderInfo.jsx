import React, { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Package,
  User,
  MapPin,
  CreditCard,
  Clock,
  RefreshCw,
  Banknote,
  Tag,
  Eye,
  ChevronDown
} from "lucide-react";
import api from "../../../utils/api";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { setGlobalLoading } from "../../store/slices/loadingSlice";


const OrderInfo = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.loading);
  const [order, setOrder] = useState(null);

  const statusDropdownRef = useRef(null);
  const [productPage, setProductPage] = useState(1);
  const productsPerPage = 5;

  const fetchOrderDetails = async () => {
    try {
      dispatch(setGlobalLoading(true));


      const res = await api.get(`/orderstatus/${id}`);
      setOrder(res.data.data);
    } catch (err) {
      toast.error("Failed to load order details");
    } finally {
      dispatch(setGlobalLoading(false));
    }
  };









  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target)) {
        setIsStatusOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return "bg-emerald-100 text-emerald-700";
      case "processing":
      case "confirmed":
        return "bg-blue-100 text-blue-700";
      case "shipped":
        return "bg-indigo-100 text-indigo-700";
      case "cancelled":
        return "bg-rose-100 text-rose-700";
      default:
        return "bg-orange-100 text-orange-700";
    }
  };


  if (isLoading && !order) return <div className="min-h-[600px]"></div>;

  if (!order)
    return (
      <div className="text-center py-20 font-bold text-slate-500">
        Order not found.
      </div>
    );

  const customerName =
    [order.createdBy?.firstname, order.createdBy?.lastname]
      .filter(Boolean)
      .join(" ") || "Guest Customer";
  const customerInitial =
    order.createdBy?.firstname?.charAt(0)?.toUpperCase() || "U";

  return (
    <div className="max-w-screen  space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-white rounded-xl text-slate-500 transition-all border border-transparent hover:border-slate-200"
          >
            <ChevronLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">
              Order  #{order._id?.slice(-8).toUpperCase()}
            </h1>
            <p className="text-slate-500 text-sm font-medium">
              Placed on {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
        <div className="flex items-center bg-white p-2 rounded-2xl border border-slate-200">
          <span
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest ${getStatusStyle(order.status)}`}
          >
            {order.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="admin-card overflow-hidden">
            <h3 className="text-lg font-black text-slate-900 mb-6 uppercase tracking-tight flex items-center gap-2">
              <Package size={20} className="text-indigo-600" /> Order Items (
              {order.products?.length || 0})
            </h3>
            <div className="overflow-x-auto" style={{ minHeight: `${productsPerPage * 73 + 40}px` }}>
              <table className="w-full text-left">
                <thead className="border-b border-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <tr>
                    <th className="pb-4">Product</th>
                    <th className="pb-4 text-center">Category</th>
                    <th className="pb-4 text-center">Qty</th>
                    <th className="pb-4 text-right">Price</th>
                    <th className="pb-4 text-right">Total</th>
                    <th className="pb-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {order.products
                    ?.slice((productPage - 1) * productsPerPage, productPage * productsPerPage)
                    .map((item, i) => (
                      <tr key={item._id || i} className="group text-sm hover:bg-slate-50/50 transition-colors">
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100 p-1 overflow-hidden">
                              {item.product?.image?.[0] ? (
                                <img
                                  src={`${import.meta.env.VITE_BASE_URL}${item.product.image[0]}`}
                                  className="max-h-full object-contain"
                                />
                              ) : (
                                <Package size={16} className="text-slate-300" />
                              )}
                            </div>
                            <div>
                              <span className="font-bold text-slate-800 block">
                                {item.product?.name || "Deleted Product"}
                              </span>
                              {item.product?.description && (
                                <span className="text-[10px] text-slate-400 font-medium line-clamp-1 max-w-xs block">
                                  {item.product.description}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 text-center">
                          {item.product?.category?.name && (
                            <span className="px-2 py-1 rounded-lg bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-tight">
                              {item.product.category.name}
                            </span>
                          )}
                        </td>
                        <td className="py-4 text-center font-bold text-slate-600">
                          {item.quantity}
                        </td>
                        <td className="py-4 text-right font-bold text-slate-600">
                          ${item.price}
                        </td>
                        <td className="py-4 text-right font-black text-slate-900">
                          ${(item.price * item.quantity).toFixed(2)}
                        </td>
                        <td className="py-4 text-right pr-2">
                          {item.product?._id && (
                            <Link
                              to={`/admin/products/info/${item.product._id}`}
                              className="p-2 text-slate-400 hover:text-indigo-600 transition-all inline-flex items-center justify-center"
                              title="View Product Details"
                            >
                              <Eye size={18} />
                            </Link>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {order.products?.length > productsPerPage && (
              <div className="flex items-center justify-between  pt-4 border-t border-slate-100">
                <p className="text-xs text-slate-500 font-medium">
                  Showing <span className="font-bold text-slate-900">{(productPage - 1) * productsPerPage + 1}-{Math.min(productPage * productsPerPage, order.products.length)}</span> of <span className="font-bold text-slate-900">{order.products.length}</span> items
                </p>
                <div className="flex items-center gap-2">
                  <button
                    disabled={productPage === 1}
                    onClick={() => setProductPage(p => p - 1)}
                    className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-600 disabled:opacity-30 transition-all"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="text-xs font-black text-slate-500 px-2">
                    {productPage} / {Math.ceil(order.products.length / productsPerPage)}
                  </span>
                  <button
                    disabled={productPage >= Math.ceil(order.products.length / productsPerPage)}
                    onClick={() => setProductPage(p => p + 1)}
                    className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-600 disabled:opacity-30 transition-all"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-8">
          <div className="admin-card space-y-6">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">
              Customer Details
            </h3>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center font-bold text-lg shrink-0 overflow-hidden">
                {order.createdBy?.avatar ? (
                  <img src={`${import.meta.env.VITE_BASE_URL}${order.createdBy.avatar}`} alt={customerName} className="w-full h-full object-cover" />
                ) : (
                  customerInitial
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-900 capitalize truncate">
                  {customerName}
                </p>
                <p className="text-xs text-slate-500 font-medium truncate">
                  {order.createdBy?.email || "No email"}
                </p>
              </div>
              {order.createdBy?._id && (
                <Link
                  to={`/admin/users/${order.createdBy._id}`}
                  className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all shrink-0"
                  title="View Full Profile"
                >
                  <Eye size={18} />
                </Link>
              )}
            </div>
          </div>

          <div className="admin-card space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">
                Delivery Address
              </h3>
              <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-[10px] font-black uppercase tracking-widest text-indigo-600">
                {order.address?.addressType || "Home"}
              </span>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-white text-indigo-600 rounded-xl border border-slate-100 shrink-0 mt-0.5">
                  <MapPin size={16} />
                </div>
                <div className="text-sm space-y-0.5">
                  {order.address?.fullAddress && (
                    <p className="font-bold text-slate-800">
                      {order.address.fullAddress}
                    </p>
                  )}
                  <p className="text-slate-600 font-medium">
                    {[order.address?.city, order.address?.state].filter(Boolean).join(", ")}
                    {order.address?.zipcode && ` - ${order.address.zipcode}`}
                  </p>
                  {order.address?.country && (
                    <p className="text-slate-500 font-medium">
                      {order.address.country}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="admin-card space-y-6">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center justify-between">
              <span>Payment Summary</span>
              <Banknote size={16} className="text-emerald-500" />
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-slate-500">Subtotal</span>
                <span className="font-bold text-slate-800">${order.totalAmount?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-medium text-slate-500">Shipping</span>
                <span className="font-bold text-emerald-600">Free</span>
              </div>
              <div className="flex justify-between border-t border-slate-100 pt-3 mt-1">
                <span className="font-black text-slate-900">Amount Paid</span>
                <span className="font-black text-indigo-600 text-base">${order.totalAmount?.toFixed(2)}</span>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Via</span>
                <span className="text-xs font-bold text-slate-700 uppercase">{order.paymentMode || "N/A"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderInfo;
