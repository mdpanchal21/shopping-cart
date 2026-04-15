import React, { useState, useEffect, useCallback } from 'react';
import { Layers, Edit, Trash2, Plus, Search, RefreshCw, ChevronLeft, ChevronRight, Package, X } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import api from '../../../utils/api';
import { toast } from 'react-toastify';

const Categories = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [page, setPage] = useState(parseInt(searchParams.get("page"), 10) || 1);
  const [limit, setLimit] = useState(parseInt(searchParams.get("limit"), 10) || 10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCategories, setTotalCategories] = useState(0);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [formData, setFormData] = useState({ id: null, name: '', slug: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams();
    if (page && page !== 1) params.set("page", page);
    if (limit && limit !== 10) params.set("limit", limit);
    if (searchTerm) params.set("search", searchTerm);
    
    setSearchParams(params, { replace: true });
  }, [page, limit, searchTerm, setSearchParams]);

  const fetchCategories = useCallback(async (currentPage = page, search = searchTerm, currentLimit = limit) => {
    try {
      setLoading(true);
      const res = await api.get("/category", {
        params: {
          page: currentPage,
          limit: currentLimit,
          search: search || undefined
        }
      });
      setCategories(res.data.data || []);
      setTotalPages(res.data.totalPages || 1);
      setTotalCategories(res.data.totalCategories || 0);
      setPage(res.data.currentPage || 1);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  }, [page, limit, searchTerm]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCategories(page, searchTerm, limit);
    }, 300);

    return () => clearTimeout(timer);
  }, [page, limit, searchTerm, fetchCategories]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  const handleLimitChange = (e) => {
    setLimit(parseInt(e.target.value, 10));
    setPage(1);
  };

  const openAddModal = () => {
    setModalMode('add');
    setFormData({ id: null, name: '', slug: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (cat) => {
    setModalMode('edit');
    setFormData({ id: cat._id, name: cat.name, slug: cat.slug });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({ id: null, name: '', slug: '' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;
    try {
      await api.delete("/category", { data: { categoryId: id } });
      toast.success("Category deleted successfully");
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete category");
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.slug) {
      toast.error("Please fill in all fields");
      return;
    }
    
    setIsSubmitting(true);
    try {
      if (modalMode === 'add') {
        await api.post("/category", { name: formData.name, slug: formData.slug });
        toast.success("Category added successfully");
      } else {
        await api.put("/category", { categoryId: formData.id, name: formData.name, slug: formData.slug });
        toast.success("Category updated successfully");
      }
      closeModal();
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to ${modalMode} category`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNameChange = (e) => {
    const val = e.target.value;
    setFormData(prev => ({
      ...prev,
      name: val,
      slug: modalMode === 'add' ? val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') : prev.slug
    }));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Categories</h1>
          <p className="text-slate-500 mt-1 font-medium">Organize your products into groups.</p>
        </div>
        <button 
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
        >
          <Plus size={18} />
          New Category
        </button>
      </div>

      <div className="admin-card overflow-hidden">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 mb-8">
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
            <div className="relative group w-full max-w-md">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors"
                size={18}
              />
              <input
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-12 pr-4 text-sm text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none font-medium"
              />
            </div>
          </div>

          <button
            onClick={() => fetchCategories(page)}
            className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-indigo-600 font-bold text-sm transition-colors"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {loading && categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <RefreshCw size={40} className="text-indigo-600 animate-spin mb-4" />
            <p className="text-slate-500 font-bold">Loading categories...</p>
          </div>
        ) : categories.length > 0 ? (
          <>
            <div className={`overflow-x-auto transition-opacity duration-300 ${loading ? 'opacity-50' : 'opacity-100'}`}>
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 text-xs font-black uppercase tracking-widest">
                    <th className="px-4 py-4">Category Info</th>
                    <th className="px-4 py-4">Slug</th>
                    <th className="px-4 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {categories.map((cat) => (
                    <tr
                      key={cat._id}
                      className="group hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100">
                            <Layers size={18} />
                          </div>
                          <span className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                            {cat.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="px-3 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-bold tracking-tight">
                          /{cat.slug}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openEditModal(cat)}
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                            title="Edit Category"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(cat._id)}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                            title="Delete Category"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
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
                    Showing <span className="text-slate-900 font-bold">{(page - 1) * limit + 1}-{Math.min(page * limit, totalCategories)}</span> of <span className="text-slate-900 font-bold">{totalCategories}</span> categories
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
              No categories found
            </h3>
            <p className="text-slate-500 font-medium">
              Create your first category to organize products.
            </p>
          </div>
        )}
      </div>

      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">
                {modalMode === 'add' ? 'Create New Category' : 'Edit Category'}
              </h2>
              <button 
                onClick={closeModal}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleFormSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Category Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleNameChange}
                  placeholder="e.g. Electronics"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  URL Slug
                </label>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData({...formData, slug: e.target.value})}
                  placeholder="e.g. electronics"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-slate-900"
                />
                <p className="text-xs text-slate-500 mt-2 font-medium">The URL friendly name for this category.</p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-indigo-600/20"
                >
                  {isSubmitting && <RefreshCw size={16} className="animate-spin" />}
                  {modalMode === 'add' ? 'Create Category' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;
