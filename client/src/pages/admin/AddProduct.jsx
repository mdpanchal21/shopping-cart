import React, { useState, useEffect } from 'react';
import { ChevronLeft, Save, X, Image as ImageIcon, Plus, RefreshCw } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import api from '../../../utils/api';
import { toast } from 'react-toastify';
import { fetchCategories } from '../../store/slices/categorySlice'

const AddProduct = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items: categories, loading: categoriesLoading } = useSelector((state) => state.category);
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
  });
  
  const [selectedImages, setSelectedImages] = useState([]);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedImages(prev => [...prev, ...files]);
  };

  const removeImage = (index) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.category) return toast.error("Please select a category");
    
    setLoading(true);
    const data = new FormData();
    data.append('name', formData.name);
    data.append('description', formData.description);
    data.append('price', formData.price);
    data.append('category', formData.category);
    
    selectedImages.forEach(image => {
      data.append('productImage', image);
    });

    try {
      await api.post("/product", data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success("Product created successfully!");
      navigate("/admin/products");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/admin/products" className="p-2 hover:bg-white rounded-xl text-slate-500 transition-all border border-transparent hover:border-slate-200">
            <ChevronLeft size={24} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Add New Product</h1>
            <p className="text-slate-500 font-medium">Create a new listing for your store.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="admin-card space-y-4">
              <h3 className="text-lg font-bold text-slate-800 mb-4">General Information</h3>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Product Name</label>
                <input 
                  type="text" 
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Premium Cotton T-Shirt"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Description</label>
                <textarea 
                  name="description"
                  required
                  rows="5"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Tell customers about this product..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all resize-none"
                />
              </div>
            </div>

            <div className="admin-card">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Pricing</h3>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Base Price ($)</label>
                <input 
                  type="number" 
                  name="price"
                  required
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-indigo-500 transition-all font-sans"
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="admin-card">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Organization</h3>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Category</label>
                <select 
                  name="category"
                  required
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-indigo-500 appearance-none cursor-pointer disabled:opacity-50"
                  disabled={categoriesLoading}
                >
                  <option value="">{categoriesLoading ? 'Loading Categories...' : 'Select Category'}</option>
                  {categories.map(cat => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
                {categoriesLoading && <RefreshCw className="animate-spin text-indigo-500 mt-2 mx-auto" size={16} />}
              </div>
            </div>

            <div className="admin-card">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Product Media</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  {selectedImages.map((image, i) => (
                    <div key={i} className="relative group aspect-square rounded-xl bg-slate-50 border border-slate-200 overflow-hidden">
                      <img src={URL.createObjectURL(image)} alt="" className="w-full h-full object-cover" />
                      <button 
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute top-1 right-1 p-1 bg-white/90 backdrop-blur rounded-lg text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  <label className="aspect-square rounded-xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:border-indigo-500 hover:text-indigo-500 transition-all cursor-pointer">
                    <Plus size={24} />
                    <span className="text-[10px] font-bold mt-1 uppercase leading-none">Upload</span>
                    <input type="file" multiple className="hidden" onChange={handleImageChange} accept="image/*" />
                  </label>
                </div>
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/20 active:scale-95 disabled:opacity-50"
            >
              {loading ? <RefreshCw className="animate-spin" size={20} /> : <Save size={20} />}
              {loading ? "Saving..." : "Create Product"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;
