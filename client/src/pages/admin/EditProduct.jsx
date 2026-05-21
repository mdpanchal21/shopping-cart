import React, { useState, useEffect } from 'react';
import { ChevronLeft, Save, X, Plus, RefreshCw, Package, Tag, ChevronDown, ArrowLeft, ArrowRight, Image as ImageIcon } from 'lucide-react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import api from '../../../utils/api';
import { toast } from 'react-toastify';
import { fetchCategories } from '../../store/slices/categorySlice';
import { setGlobalLoading } from '../../store/slices/loadingSlice';


const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items: categories, loading: categoriesLoading } = useSelector((state) => state.category);



  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
  });

  const [imageGallery, setImageGallery] = useState([]); // Array of { type: 'existing'|'new', data: url|File, id: string }
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    dispatch(fetchCategories());

    const fetchData = async () => {
      try {
        dispatch(setGlobalLoading(true));
        const res = await api.get(`/product/${id}`);

        if (res.data.success && res.data.data) {
          const product = res.data.data;
          setFormData({
            name: product.name || '',
            description: product.description || '',
            price: product.price || '',
            category: product.category?._id || product.category || '',
          });
          
          setImageGallery((product.image || []).map(img => ({
            type: 'existing',
            data: img,
            id: Math.random().toString(36).substr(2, 9)
          })));
        } else {
          toast.error("Product details not found");
          navigate("/admin/products");
        }
      } catch (err) {
        toast.error("Failed to load product details");
        navigate("/admin/products");
      } finally {
        dispatch(setGlobalLoading(false));
      }
    };
    fetchData();
  }, [id, navigate, dispatch]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      addImages(files);
    }
  };

  const addImages = (files) => {
    const newItems = Array.from(files).map(file => ({
      type: 'new',
      data: file,
      id: Math.random().toString(36).substr(2, 9)
    }));
    setImageGallery(prev => [...prev, ...newItems]);
  };

  const removeImage = (id) => {
    setImageGallery(prev => prev.filter(img => img.id !== id));
  };

  const moveImage = (index, direction) => {
    const toIndex = direction === 'left' ? index - 1 : index + 1;
    setImageGallery(prev => {
      const updatedGallery = [...prev];
      const itemToMove = updatedGallery[index];
      updatedGallery.splice(index, 1);
      updatedGallery.splice(toIndex, 0, itemToMove);
      return updatedGallery;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(setGlobalLoading(true));

    const data = new FormData();
    data.append('name', formData.name);
    data.append('description', formData.description);
    data.append('price', formData.price);
    data.append('category', formData.category);

    const existingPaths = imageGallery
      .filter(img => img.type === 'existing')
      .map(img => img.data);
    
    // Send existing paths as a stringified array (Backend will parse it)
    data.append('existingImages', JSON.stringify(existingPaths));

    imageGallery.filter(img => img.type === 'new').forEach(img => {
      data.append('productImage', img.data);
    });

    try {
      await api.put(`/product/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success("Product updated successfully!");
      navigate("/admin/products");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update product");
    } finally {
      dispatch(setGlobalLoading(false));
    }
  };



  return (
    <div className="max-w-screen space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2.5 bg-white hover:bg-slate-50 rounded-2xl text-slate-500 shadow-sm border border-slate-200 transition-all active:scale-95"
          >
            <ChevronLeft size={24} />
          </button>
          <div className="space-y-1">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase leading-none">
              Edit Product
            </h1>
            <p className="text-slate-500 text-sm font-bold flex items-center gap-2">
              <Plus size={14} className="text-indigo-600" />
              Modify existing product listing and parameters
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Info Columns */}
          <div className="lg:col-span-8 space-y-8">
            <div className="admin-card space-y-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 blur-3xl opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-indigo-600 mb-6 flex items-center gap-2">
                  <Package size={14} /> General Specifications
                </h3>
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Product Name</label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Narrative Description</label>
                    <textarea
                      name="description"
                      required
                      rows="6"
                      value={formData.description}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="admin-card space-y-8">
               <h3 className="text-xs font-black uppercase tracking-widest text-indigo-600 flex items-center gap-2">
                 <Tag size={14} /> Pricing & Market Position
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Current Base Price ($)</label>
                    <div className="relative">
                       <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 font-black text-lg">$</span>
                       <input
                         type="number"
                         name="price"
                         required
                         value={formData.price}
                         onChange={handleInputChange}
                         className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-6 text-xl font-black text-indigo-600 placeholder:text-slate-200 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all font-sans"
                       />
                    </div>
                 </div>
                 <div className="p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200 flex flex-col justify-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">Strategy Adjustment</p>
                    <p className="text-xs font-bold text-slate-500 leading-relaxed italic">Adjust the retail price to account for seasonality or inventory optimization.</p>
                 </div>
               </div>
            </div>
          </div>

          {/* Sidebar Columns */}
          <div className="lg:col-span-4 space-y-8">
            <div className="admin-card space-y-6">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Inventory Classification</h3>
              <div className="space-y-2 relative">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Select Category</label>
                <div className="relative group">
                  <select
                    name="category"
                    required
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 text-sm font-black text-slate-900 appearance-none cursor-pointer focus:outline-none focus:border-indigo-500 transition-all disabled:opacity-50"
                    disabled={categoriesLoading}
                  >
                    <option value="">{categoriesLoading ? 'Syncing Categories...' : 'Choose Category'}</option>
                    {categories.map(cat => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300 group-hover:text-indigo-500 transition-colors">
                    {categoriesLoading ? <RefreshCw size={16} className="animate-spin text-indigo-500" /> : <ChevronDown size={18} />}
                  </div>
                </div>
              </div>
            </div>

            <div className="admin-card space-y-6">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Media Assets</h3>
              <div className="grid grid-cols-2 gap-4">
                {imageGallery.map((img, i) => (
                  <div key={img.id} className="relative group aspect-square rounded-2xl bg-white border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-all">
                    <img 
                      src={img.type === 'existing' ? `${import.meta.env.VITE_BASE_URL}${img.data}` : URL.createObjectURL(img.data)} 
                      alt="" 
                      className="w-full h-full object-contain p-2 rounded-2xl" 
                    />
                    
                    {i === 0 && (
                      <div className="absolute top-2 left-2 px-2 py-0.5 bg-indigo-600 text-white text-[8px] font-black uppercase rounded-md shadow-lg z-10">
                        Main
                      </div>
                    )}

                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                       {i > 0 && (
                         <button
                           type="button"
                           onClick={() => moveImage(i, 'left')}
                           className="p-2 bg-white rounded-xl text-slate-900 hover:text-indigo-600 active:scale-90 transition-all shadow-sm"
                         >
                           <ArrowLeft size={14} strokeWidth={3} />
                         </button>
                       )}
                       {i < imageGallery.length - 1 && (
                         <button
                           type="button"
                           onClick={() => moveImage(i, 'right')}
                           className="p-2 bg-white rounded-xl text-slate-900 hover:text-indigo-600 active:scale-90 transition-all shadow-sm"
                         >
                           <ArrowRight size={14} strokeWidth={3} />
                         </button>
                       )}
                    </div>

                    <button
                      type="button"
                      onClick={() => removeImage(img.id)}
                      className="absolute top-2 right-2 p-1.5 bg-white/90 backdrop-blur rounded-lg text-rose-600 shadow-xl active:scale-90 z-20"
                    >
                      <X size={14} strokeWidth={3} />
                    </button>

                    <div className={`absolute inset-x-0 bottom-0 py-1 px-3 backdrop-blur-sm transition-opacity ${img.type === 'existing' ? 'bg-slate-900/60' : 'bg-indigo-600/80'}`}>
                       <p className="text-[6px] font-black uppercase text-white tracking-widest text-center">{img.type}</p>
                    </div>
                  </div>
                ))}

                {imageGallery.length < 5 && (
                  <label 
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`aspect-square rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all cursor-pointer group ${
                      isDragging 
                        ? "border-indigo-500 bg-indigo-50 text-indigo-500 scale-105" 
                        : "border-slate-200 bg-slate-50 text-slate-300 hover:border-indigo-500 hover:text-indigo-500 hover:bg-indigo-50/30"
                    }`}
                  >
                    <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                      <ImageIcon size={24} className="group-hover:text-indigo-600 transition-colors" />
                    </div>
                    <span className="text-[8px] font-black mt-3 uppercase tracking-widest text-slate-400 group-hover:text-indigo-600 transition-colors">
                      {isDragging ? "Drop Now" : "Add Media"}
                    </span>
                    <input type="file" multiple className="hidden" onChange={(e) => addImages(e.target.files)} accept="image/*" />
                  </label>
                )}
              </div>
              <p className="text-[10px] text-slate-400 font-bold italic text-center uppercase tracking-tighter">Images are saved in the order shown above</p>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-3 px-8 py-5 bg-indigo-600 text-white rounded-[2rem] text-sm font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-600/30 hover:shadow-indigo-600/40 active:scale-95 group overflow-hidden relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <Save size={20} className="relative z-10" />
              <span className="relative z-10">Sync Product Details</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditProduct;
