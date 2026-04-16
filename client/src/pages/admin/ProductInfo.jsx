import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  Package,
  Tag,
  User,
  Calendar,
  RefreshCw,
  Clock,
  ShieldCheck,
  ShieldAlert,
  Edit2,
  ChevronDown,
  Image as ImageIcon
} from 'lucide-react';
import api from '../../../utils/api';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import { setGlobalLoading } from '../../store/slices/loadingSlice';



const ProductInfo = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.loading);
  const [product, setProduct] = useState(null);




  const fetchProductDetails = async () => {
    try {
      dispatch(setGlobalLoading(true));


      const res = await api.get(`/product/${id}`);
      if (res.data.success) {
        setProduct(res.data.data);
      }
    } catch (err) {
      toast.error("Failed to load product details");
    } finally {
      dispatch(setGlobalLoading(false));
    }
  };

  useEffect(() => {
    fetchProductDetails();
  }, [id]);

  if (isLoading && !product) return <div className="min-h-[600px]"></div>;

  if (!product) return (
    <div className="text-center py-20 font-bold text-slate-500">

      <p>Product not found.</p>
      <Link to="/admin/products" className="text-indigo-600 hover:underline mt-4 inline-block">Back to Catalog</Link>
    </div>
  );

  return (
    <div className="max-w-screen space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-white rounded-xl text-slate-500 transition-all border border-transparent hover:border-slate-200">
            <ChevronLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">{product.name}</h1>
            <p className="text-slate-500 text-sm font-medium">ID: {product._id?.slice(-8).toUpperCase()}</p>
          </div>
        </div>
        <Link
          to={`/admin/products/edit/${product._id}`}
          className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-900 rounded-2xl text-sm font-bold hover:bg-slate-50 transition-all shadow-sm active:scale-95"
        >
          <Edit2 size={18} />
          Edit Product
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="admin-card overflow-hidden group">
            <div className="aspect-video relative bg-slate-50 flex items-center justify-center rounded-2xl overflow-hidden border border-slate-100">
              {product.image?.[0] ? (
                <img
                  src={`${import.meta.env.VITE_BASE_URL}${product.image[0]}`}
                  alt={product.name}
                  className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-slate-300">
                  <ImageIcon size={48} />
                  <span className="text-sm font-bold">No Image Available</span>
                </div>
              )}
              {product.isActive && (
                <div className="absolute top-4 right-4 px-4 py-2 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-emerald-500/20">
                  <ShieldCheck size={14} /> Active
                </div>
              )}
            </div>

            <div className="mt-8 space-y-4">
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                <Package size={20} className="text-indigo-600" /> Product Overview
              </h3>
              <p className="text-slate-600 leading-relaxed font-medium bg-slate-50 p-6 rounded-2xl border border-slate-100">
                {product.description || "No description provided for this product."}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="admin-card space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Pricing Strategy</h3>
              <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6">
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Standard Market Price</p>
                <p className="text-4xl font-black text-indigo-600">${product.price}</p>
              </div>
            </div>
            {/* <div className="admin-card space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Inventory Status</h3>
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Stock Availability</p>
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${product.isActive ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                  <span className="text-2xl font-black text-slate-800">{product.isActive ? 'Available' : 'Out of Stock'}</span>
                </div>
              </div>
            </div> */}
          </div>
        </div>

        <div className="space-y-8">
          <div className="admin-card space-y-6">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Classification</h3>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                <Tag size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1">Category</p>
                <p className="font-black text-slate-900 uppercase tracking-tight">{product.category?.name || 'Uncategorized'}</p>
              </div>
            </div>
          </div>

          <div className="admin-card space-y-6 text-slate-900">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Administrative Data</h3>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
                  <User size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1">Created By</p>
                  <p className="text-sm font-bold text-slate-800">{product.createdBy?.firstname} {product.createdBy?.lastname}</p>
                  <p className="text-xs text-slate-500 font-medium">{product.createdBy?.email}</p>
                  <span className="mt-1 inline-block px-2 py-0.5 bg-slate-400 rounded text-[10px] font-black uppercase tracking-widest text-slate-500">
                    {product.createdBy?.role}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
                  <Calendar size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1">Date Created</p>
                  <p className="text-sm font-bold text-slate-800">{new Date(product.createdAt).toLocaleDateString()}</p>

                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
                  <Clock size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1">Last Updated</p>
                  <p className="text-sm font-bold text-slate-800">{new Date(product.updatedAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>

          <div className={`admin-card border-l-4 ${product.isActive ? 'border-emerald-500' : 'border-rose-500'} bg-slate-50/50`}>
            <div className="flex items-center gap-3">
              {product.isActive ? (
                <ShieldCheck size={20} className="text-emerald-500" />
              ) : (
                <ShieldAlert size={20} className="text-rose-500" />
              )}
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-slate-900">Visibility Status</p>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  {product.isActive
                    ? "This product is live and visible to all customers."
                    : "This product is hidden from the shop front."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductInfo;
