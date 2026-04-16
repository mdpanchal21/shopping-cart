import React, { useState, useEffect, useCallback , useRef} from "react";
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  RefreshCw,
  Eye,
  Package,
  ChevronLeft,
  ChevronRight,
  ChevronDown
} from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import api from '../../../utils/api';
import { toast } from "react-toastify";
import { fetchCategories } from "../../store/slices/categorySlice";
import { setGlobalLoading } from "../../store/slices/loadingSlice";
import GlobalLoader from "./components/GlobalLoader";


const Products = () => {
  const dispatch = useDispatch();
  const { items: categories, loading: categoriesLoading } = useSelector((state) => state.category);
  const { isLoading } = useSelector((state) => state.loading);

  const [products, setProducts] = useState(null);
  const [loadedMeta, setLoadedMeta] = useState({ page: 1, limit: 10, total: 0 });



  const [searchParams, setSearchParams] = useSearchParams();

  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "All");

  const [page, setPage] = useState(parseInt(searchParams.get("page"), 10) || 1);
  const [limit, setLimit] = useState(parseInt(searchParams.get("limit"), 10) || 10);

  useEffect(() => {
    const params = new URLSearchParams();
    if (page && page !== 1) params.set("page", page);
    if (limit && limit !== 10) params.set("limit", limit);
    if (searchTerm) params.set("search", searchTerm);
    if (selectedCategory !== "All") params.set("category", selectedCategory);

    setSearchParams(params, { replace: true });
  }, [page, limit, searchTerm, selectedCategory, setSearchParams]);
  const [totalPages, setTotalPages] = useState(1);
  const [isLimitOpen, setIsLimitOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const limitDropdownRef = useRef(null);
  const categoryDropdownRef = useRef(null);
  const [totalProducts, setTotalProducts] = useState(0);

  const navigate = useNavigate();

  const fetchProducts = useCallback(async (currentPage = page, search = searchTerm, cat = selectedCategory, currentLimit = limit) => {
    try {
      dispatch(setGlobalLoading(true));

      const response = await api.get("/product", {
        params: {
          page: currentPage,
          limit: currentLimit,
          category: cat !== "All" ? cat : undefined,
          search: search || undefined
        },
      });

      const data = response.data;

      const formattedProducts = data.productList.map((p) => ({
        id: String(p._id),
        name: p.name,
        category: p.category?.name || "Uncategorized",
        price: `$${p.price}`,
        image: p.image?.[0]
          ? `${import.meta.env.VITE_BASE_URL}${p.image[0]}`
          : null,
      }));

      setProducts(formattedProducts);
      setTotalPages(data.totalPages || 1);
      setTotalProducts(data.totalProducts || 0);
      setPage(data.currentPage || 1);
      setLoadedMeta({
        page: data.currentPage || 1,
        limit: currentLimit,
        total: data.totalProducts || 0
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to fetch products");
    } finally {
      dispatch(setGlobalLoading(false));
    }

  }, [page, limit, searchTerm, selectedCategory]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;

    try {
      await api.delete(`/product/${id}`);
      toast.success("Product deleted successfully");
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete product");
    }
  };

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (limitDropdownRef.current && !limitDropdownRef.current.contains(event.target)) {
        setIsLimitOpen(false);
      }
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target)) {
        setIsCategoryOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts(page, searchTerm, selectedCategory, limit);
    }, 300);

    return () => clearTimeout(timer);
  }, [page, limit, searchTerm, selectedCategory, fetchProducts]);

  const handleFilterChange = (newCat) => {
    setSelectedCategory(newCat);
    setPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">
            Products Catalog
          </h1>
          <p className="text-slate-500 mt-1 font-medium text-sm lg:text-base">
            Manage your store's inventory and details.
          </p>
        </div>
        <Link
          to="/admin/products/add"
          className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
        >
          <Plus size={18} />
          Add New Product
        </Link>
      </div>

      <div className="admin-card">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 mb-8">
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:flex-1 lg:max-w-4xl">
            <div className="relative group w-full lg:max-w-md">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors"
                size={18}
              />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-12 pr-4 text-sm text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none font-medium"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64" ref={categoryDropdownRef}>
                <button
                  onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                  disabled={categoriesLoading}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-10 pr-4 text-sm text-slate-900 focus:outline-none focus:border-indigo-500 flex items-center justify-between cursor-pointer font-medium disabled:opacity-50 transition-all group"
                >
                  <div className="flex items-center gap-2">
                    <Filter
                      className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${isCategoryOpen ? 'text-indigo-600' : 'text-slate-400'}`}
                      size={16}
                    />
                    <span className="truncate">
                      {selectedCategory === "All" ? "All Categories" : (categories.find(c => c.slug === selectedCategory)?.name || selectedCategory)}
                    </span>
                  </div>
                  <ChevronDown size={16} className={`text-slate-400 transition-transform duration-200 ${isCategoryOpen ? 'rotate-180' : ''}`} />
                </button>

                {isCategoryOpen && (
                  <div className="absolute top-full mt-2 left-0 z-50 w-full min-w-[200px] bg-white border border-slate-100 rounded-2xl shadow-2xl p-2 animate-in fade-in zoom-in-95 duration-200 origin-top">
                    <button
                      onClick={() => {
                        handleFilterChange("All");
                        setIsCategoryOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                        selectedCategory === "All"
                          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                          : "text-slate-600 hover:bg-indigo-50 hover:text-indigo-600"
                      }`}
                    >
                      All Categories
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat._id}
                        onClick={() => {
                          handleFilterChange(cat.slug);
                          setIsCategoryOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                          selectedCategory === cat.slug
                            ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                            : "text-slate-600 hover:bg-indigo-50 hover:text-indigo-600"
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={() => fetchProducts(page)}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:text-indigo-600 font-bold text-sm transition-all shadow-sm active:scale-95 sm:hidden"
                title="Refresh data"
              >
                <RefreshCw size={16} />
              </button>
            </div>
          </div>

          <button
            onClick={() => fetchProducts(page)}
            className="hidden sm:flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-indigo-600 font-bold text-sm transition-colors"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        <div className="relative min-h-[600px] flex flex-col">
          <GlobalLoader forceShow={products === null} />
          {products && products.length > 0 && (

            <>
              <div className="flex-1 overflow-x-auto transition-opacity duration-300">


                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 text-xs font-black uppercase tracking-widest">
                      <th className="px-4 py-4">Product Info</th>
                      <th className="px-4 py-4">Category</th>
                      <th className="px-4 py-4">Price</th>
                      <th className="px-4 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {products.map((product) => (
                      <tr
                        key={product.id}
                        className="group hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="px-4 py-4">
                          <Link
                            to={`/admin/products/info/${product.id}`}
                            className="flex items-center gap-4 group/link"
                          >
                            <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden flex items-center justify-center border border-slate-200 shadow-sm group-hover/link:border-indigo-300 transition-colors">
                              {product.image ? (
                                <img
                                  src={product.image}
                                  alt={product.name}
                                  className="w-full h-full object-contain"
                                />
                              ) : (
                                <Package className="text-slate-300 group-hover/link:text-indigo-400 transition-colors" size={20} />
                              )}
                            </div>
                            <span className="font-bold text-slate-900 group-hover/link:text-indigo-600 line-clamp-1 transition-colors">
                              {product.name}
                            </span>
                          </Link>
                        </td>
                        <td className="px-4 py-4">
                          <span className="px-3 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-tight">
                            {product.category}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm font-black text-slate-900">
                          {product.price}
                        </td>

                        <td className="px-4 py-4 text-right">
                          <div className="flex items-center justify-end gap-1 transition-opacity">
                            <Link
                              to={`/admin/products/info/${product.id}`}
                              className="p-2 text-slate-400 hover:text-indigo-600 transition-all active:scale-95"
                              title="View Details"
                            >
                              <Eye size={18} />
                            </Link>
                            <Link
                              to={`/admin/products/edit/${product.id}`}
                              className="p-2 text-slate-400 hover:text-indigo-600 transition-all active:scale-95"
                            >
                              <Edit2 size={18} />
                            </Link>
                            <button
                              onClick={() => handleDelete(product.id)}
                              className="p-2 text-slate-400 hover:text-rose-600 transition-all active:scale-95"
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
                        Showing <span className="text-slate-900 font-bold">{(loadedMeta.page - 1) * loadedMeta.limit + 1}-{Math.min(loadedMeta.page * loadedMeta.limit, loadedMeta.total)}</span> of <span className="text-slate-900 font-bold">{loadedMeta.total}</span> <span className="text-slate-900 font-bold">products</span>
                      </p>
                    </div>
                  </div>
                  
                  <div className="hidden lg:flex items-center justify-center">
                    <p className="text-sm text-slate-500 font-medium tracking-tight text-center">
                      Showing <span className="text-slate-900 font-bold">{(loadedMeta.page - 1) * loadedMeta.limit + 1}-{Math.min(loadedMeta.page * loadedMeta.limit, loadedMeta.total)}</span> of <span className="text-slate-900 font-bold">{loadedMeta.total}</span> products
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
          )}
          {products && !isLoading && products.length === 0 ? (

            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-100">
              <Package size={48} className="text-slate-200 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-1">No products found</h3>
              <p className="text-slate-500 font-medium">Your catalog will appear here once products are added.</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default Products;
