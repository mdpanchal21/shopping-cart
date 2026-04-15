import React, { useState, useEffect } from 'react';
import { ChevronLeft, Save, X, Plus, RefreshCw } from 'lucide-react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import api from '../../../utils/api';
import { toast } from 'react-toastify';
import { fetchCategories } from '../../store/slices/categorySlice';

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items: categories, loading: categoriesLoading } = useSelector((state) => state.category);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
  });

  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);

  useEffect(() => {
    dispatch(fetchCategories());

    const fetchData = async () => {
      try {
        const res = await api.get(`/product/${id}`);

        if (res.data.success && res.data.data) {
          const product = res.data.data;
          setFormData({
            name: product.name || '',
            description: product.description || '',
            price: product.price || '',
            category: product.category?._id || product.category || '',
          });
          setExistingImages(product.image || []);
        } else {
          toast.error("Product details not found");
          navigate("/admin/products");
        }
      } catch (err) {
        toast.error("Failed to load product details");
        navigate("/admin/products");
      } finally {
        setFetching(false);
      }
    };
    fetchData();
  }, [id, navigate, dispatch]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNewImageChange = (e) => {
    const files = Array.from(e.target.files);
    setNewImages(prev => [...prev, ...files]);
  };

  const removeNewImage = (index) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (img) => {
    setExistingImages(prev => prev.filter(i => i !== img));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    data.append('name', formData.name);
    data.append('description', formData.description);
    data.append('price', formData.price);
    data.append('category', formData.category);

    data.append('productImage', JSON.stringify(existingImages));

    newImages.forEach(image => {
      data.append('productImage', image);
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
      setLoading(false);
    }
  };

  if (fetching) return (
    <div className="flex flex-col items-center justify-center h-96">
      <RefreshCw className="animate-spin text-indigo-600 mb-4" size={40} />
      <p className="text-slate-500 font-bold">Fetching product data...</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/admin/products" className="p-2 hover:bg-white rounded-xl text-slate-500 transition-all border border-transparent hover:border-slate-200">
            <ChevronLeft size={24} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Edit Product</h1>
            <p className="text-slate-500 font-medium leading-none mt-1">Modify existing product details.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="admin-card space-y-4">
              <h3 className="text-lg font-bold text-slate-800 mb-4 tracking-tight">General Information</h3>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Product Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-indigo-500 transition-all font-medium"
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
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-indigo-500 resize-none transition-all font-medium"
                />
              </div>
            </div>

            <div className="admin-card">
              <h3 className="text-lg font-bold text-slate-800 mb-4 tracking-tight">Pricing</h3>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Base Price ($)</label>
                <input type="number" name="price" required value={formData.price} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-indigo-500 transition-all font-sans font-bold text-indigo-600" />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="admin-card">
              <h3 className="text-lg font-bold text-slate-800 mb-4 tracking-tight">Organization</h3>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Category</label>
                <select
                  name="category"
                  required
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-indigo-500 appearance-none font-bold text-slate-700 disabled:opacity-50"
                  disabled={categoriesLoading}
                >
                  <option value="">{categoriesLoading ? 'Loading Categories...' : 'Select Category'}</option>
                  {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                </select>
              </div>
            </div>

            <div className="admin-card">
              <h3 className="text-lg font-bold text-slate-800 mb-4 tracking-tight">Media</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  {existingImages.map((img, i) => (
                    <div key={`ex-${i}`} className="relative group aspect-square rounded-xl overflow-hidden border border-slate-200">
                      <img src={`${import.meta.env.VITE_BASE_URL}${img}`} alt="" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => removeExistingImage(img)} className="absolute top-1 right-1 p-1 bg-white/90 rounded-lg text-rose-600 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"><X size={12} /></button>
                    </div>
                  ))}
                  {newImages.map((image, i) => (
                    <div key={`new-${i}`} className="relative group aspect-square rounded-xl overflow-hidden border border-indigo-200">
                      <img src={URL.createObjectURL(image)} alt="" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => removeNewImage(i)} className="absolute top-1 right-1 p-1 bg-white/90 rounded-lg text-rose-600 shadow-sm"><X size={12} /></button>
                    </div>
                  ))}
                  <label className="aspect-square rounded-xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:border-indigo-500 hover:text-indigo-500 transition-all cursor-pointer">
                    <Plus size={20} />
                    <input type="file" multiple className="hidden" onChange={handleNewImageChange} accept="image/*" />
                  </label>
                </div>
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/20 active:scale-95 disabled:opacity-50">
              {loading ? <RefreshCw className="animate-spin" size={20} /> : <Save size={20} />}
              {loading ? "Updating..." : "Update Product"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditProduct;
