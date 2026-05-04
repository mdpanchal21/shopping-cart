import  { useState, useEffect, useCallback, useRef } from 'react';
import { Layers, Edit2, Trash2, Plus, Search, RefreshCw, ChevronLeft, ChevronRight, ChevronDown, Package, X } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import api from '../../../utils/api';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import { setGlobalLoading } from '../../store/slices/loadingSlice';
import GlobalLoader from './components/GlobalLoader';


const Categories = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.loading);
  const [categories, setCategories] = useState(null);
  const [loadedMeta, setLoadedMeta] = useState({ page: 1, limit: 10, total: 0 });

  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [page, setPage] = useState(parseInt(searchParams.get("page"), 10) || 1);
  const [limit, setLimit] = useState(parseInt(searchParams.get("limit"), 10) || 10);
  const [totalPages, setTotalPages] = useState(1);
  const [isLimitOpen, setIsLimitOpen] = useState(false);
  const limitDropdownRef = useRef(null);
  const [totalCategories, setTotalCategories] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { schemas } = useSelector((state) => state.formSchema);
  const categorySchema = schemas?.category;
  const fields = categorySchema?.fields || [];

  useEffect(() => {
    const params = new URLSearchParams();
    if (page && page !== 1) params.set("page", page);
    if (limit && limit !== 10) params.set("limit", limit);
    if (searchTerm) params.set("search", searchTerm);

    setSearchParams(params, { replace: true });
  }, [page, limit, searchTerm, setSearchParams]);

  const fetchCategories = useCallback(async (currentPage = page, search = searchTerm, currentLimit = limit) => {
    try {
      dispatch(setGlobalLoading(true));

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
      setLoadedMeta({
        page: res.data.currentPage || 1,
        limit: currentLimit,
        total: res.data.totalCategories || 0
      });
      // Force scroll to top on data load
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to fetch categories");
    } finally {
      dispatch(setGlobalLoading(false));
    }

  }, [page, limit, searchTerm]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (limitDropdownRef.current && !limitDropdownRef.current.contains(event.target)) {
        setIsLimitOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
    const initialData = { id: null };
    fields.forEach(field => {
      initialData[field.name] = field.defaultValue || '';
    });
    setFormData(initialData);
    setErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (cat) => {
    setModalMode('edit');
    const editData = { id: cat._id };
    fields.forEach(field => {
      editData[field.name] = cat[field.name] || '';
    });
    setFormData(editData);
    setErrors({});
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({ id: null });
    setErrors({});
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;
    try {
      dispatch(setGlobalLoading(true));
      await api.delete("/category", { data: { categoryId: id } });

      toast.success("Category deleted successfully");
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete category");
    } finally {
      dispatch(setGlobalLoading(false));
    }
  };


  const validateForm = () => {
    const newErrors = {};
    fields.forEach(field => {
      const value = formData[field.name];
      const validation = field.validation || {};
      if (validation.required && (!value || value === '')) {
        newErrors[field.name] = validation.errorMessage || `${field.label} is required`;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    dispatch(setGlobalLoading(true));
    try {
      const submissionData = { ...formData };
      delete submissionData.id;

      if (modalMode === 'add') {
        await api.post("/category", submissionData);
        toast.success("Category added successfully");
      } else {
        await api.put("/category", { categoryId: formData.id, ...submissionData });
        toast.success("Category updated successfully");
      }
      closeModal();
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to ${modalMode} category`);
    } finally {
      dispatch(setGlobalLoading(false));
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    let newValue;

    if (type === 'file') {
      newValue = files[0];
    } else if (type === 'checkbox') {
      newValue = checked;
    } else {
      newValue = value;
    }

    setFormData(prev => {
      const updated = { ...prev, [name]: newValue };

      // Auto-slug logic specifically for name field in add mode
      if (name === 'name' && modalMode === 'add' && fields.find(f => f.name === 'slug')) {
        updated.slug = newValue.toString().toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '');
      }
      return updated;
    });

    if (errors[name]) {
      setErrors(prev => {
        const newErrs = { ...prev };
        delete newErrs[name];
        return newErrs;
      });
    }
  };

  const renderInput = (field) => {
    const commonProps = {
      name: field.name,
      value: (field.type !== 'file' && field.type !== 'checkbox') ? formData[field.name] || '' : undefined,
      onChange: handleInputChange,
      placeholder: field.placeholder,
      className: `w-full px-4 py-3 bg-slate-50 border ${errors[field.name] ? 'border-rose-400 focus:border-rose-500 ring-rose-50' : 'border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10'} rounded-xl focus:outline-none transition-all font-medium text-slate-900`
    };

    if (field.type === 'textarea') {
      return (
        <textarea {...commonProps} rows="4" className={commonProps.className + " resize-none"} />
      );
    }

    if (field.type === 'select') {
      const options = field.options || [];
      return (
        <div className="relative">
          <select {...commonProps} className={commonProps.className + " appearance-none cursor-pointer"}>
            <option value="">{field.placeholder || "Select Option"}</option>
            {options.map(opt => (
              <option key={opt.value || opt} value={opt.value || opt}>{opt.label || opt}</option>
            ))}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
            <ChevronDown size={18} />
          </div>
        </div>
      );
    }

    if (field.type === 'radio') {
      const options = field.options || [];
      return (
        <div className="flex flex-wrap gap-4 p-3 bg-slate-50/50 rounded-xl border border-slate-100">
          {options.map(opt => (
            <label key={opt.value || opt} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name={field.name}
                value={opt.value || opt}
                checked={formData[field.name] == (opt.value || opt)}
                onChange={handleInputChange}
                className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-slate-300"
              />
              <span className="text-sm font-medium text-slate-600 group-hover:text-indigo-600 transition-colors">{opt.label || opt}</span>
            </label>
          ))}
        </div>
      );
    }

    if (field.type === 'checkbox') {
      return (
        <label className="flex items-center gap-3 p-3 bg-slate-50/50 rounded-xl border border-slate-200 hover:bg-white hover:border-indigo-200 transition-all cursor-pointer group">
          <input
            type="checkbox"
            name={field.name}
            checked={!!formData[field.name]}
            onChange={handleInputChange}
            className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
          <span className="text-sm font-bold text-slate-600 group-hover:text-indigo-600 transition-colors">{field.placeholder || field.label}</span>
        </label>
      );
    }

    return (
      <input
        {...commonProps}
        type={field.type}
      />
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">Categories</h1>
          <p className="text-slate-500 mt-1 font-medium text-sm lg:text-base">Organize your products into groups.</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
        >
          <Plus size={18} />
          New Category
        </button>
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
                placeholder="Search categories..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-12 pr-4 text-sm text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none font-medium"
              />
            </div>

            <button
              onClick={() => fetchCategories(page)}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:text-indigo-600 font-bold text-sm transition-all shadow-sm active:scale-95 lg:hidden"
              title="Refresh data"
            >
              <RefreshCw size={16} />
            </button>
          </div>

          <button
            onClick={() => fetchCategories(page)}
            className="hidden lg:flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-indigo-600 font-bold text-sm transition-colors"
          >
            <RefreshCw size={16} />
            Refresh
          </button>

        </div>

        <div className="relative min-h-[600px] flex flex-col">
          <GlobalLoader forceShow={categories === null} />
          {categories && !isLoading && categories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-100">
              <Package size={48} className="text-slate-200 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-1">No categories found</h3>
              <p className="text-slate-500 font-medium">Your categories will appear here once added.</p>
            </div>
          ) : categories && categories.length > 0 ? (
            <>
              <div className="flex-1 overflow-x-auto transition-opacity duration-300">


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
                            {cat.slug}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <div className="flex items-center justify-end gap-1 transition-opacity">
                            <button
                              onClick={() => openEditModal(cat)}
                              className="p-2 text-slate-400 hover:text-indigo-600 transition-all active:scale-95"
                              title="Edit Category"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(cat._id)}
                              className="p-2 text-slate-400 hover:text-rose-600 transition-all active:scale-95"
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
                                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-all ${limit === val
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
                        Showing <span className="text-slate-900 font-bold">{(loadedMeta.page - 1) * loadedMeta.limit + 1}-{Math.min(loadedMeta.page * loadedMeta.limit, loadedMeta.total)}</span> of <span className="text-slate-900 font-bold">{loadedMeta.total}</span> <span className="text-slate-900 font-bold">categories</span>
                      </p>
                    </div>
                  </div>

                  <div className="hidden lg:flex items-center justify-center">
                    <p className="text-sm text-slate-500 font-medium tracking-tight text-center">
                      Showing <span className="text-slate-900 font-bold">{(loadedMeta.page - 1) * loadedMeta.limit + 1}-{Math.min(loadedMeta.page * loadedMeta.limit, loadedMeta.total)}</span> of <span className="text-slate-900 font-bold">{loadedMeta.total}</span> categories
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
              {fields.map(field => (
                <div key={field.name}>
                  {field.type !== 'checkbox' && (
                    <label className="flex justify-between items-center text-sm font-bold text-slate-700 mb-2">
                      {field.label}
                      {errors[field.name] && <span className="text-[10px] text-rose-500 font-black uppercase tracking-tight italic">{errors[field.name]}</span>}
                    </label>
                  )}
                  {renderInput(field)}
                  {field.name === 'slug' && <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-tight">The URL friendly name for this category.</p>}
                  {field.type === 'checkbox' && errors[field.name] && <p className="text-[10px] text-rose-500 font-black uppercase tracking-tight italic mt-1">{errors[field.name]}</p>}
                </div>
              ))}

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
                  Save Changes
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
