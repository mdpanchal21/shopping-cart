import React, { useState, useEffect, useCallback } from "react";
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
} from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import api from '../../../utils/api';
import { toast } from "react-toastify";
import { fetchCategories } from "../../store/slices/categorySlice";

const Products = () => {
  const dispatch = useDispatch();
  const { items: categories, loading: categoriesLoading } = useSelector((state) => state.category);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
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
  const [totalProducts, setTotalProducts] = useState(0);

  const navigate = useNavigate();

  const fetchProducts = useCallback(async (currentPage = page, search = searchTerm, cat = selectedCategory, currentLimit = limit) => {
    try {
      setLoading(true);
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
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to fetch products");
    } finally {
      setLoading(false);
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

  const handleLimitChange = (e) => {
    setLimit(parseInt(e.target.value, 10));
    setPage(1);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Products Catalog
          </h1>
          <p className="text-slate-500 mt-1 font-medium">
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
                placeholder="Search products..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-12 pr-4 text-sm text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none font-medium"
              />
            </div>

            <div className="relative w-full sm:w-64">
              <Filter
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={16}
              />
              <select
                value={selectedCategory}
                onChange={(e) => handleFilterChange(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-12 pr-4 text-sm text-slate-900 focus:outline-none focus:border-indigo-500 appearance-none cursor-pointer font-medium disabled:opacity-50"
                disabled={categoriesLoading}
              >
                <option value="All">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat.slug}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={() => fetchProducts(page)}
            className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-indigo-600 font-bold text-sm transition-colors"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {loading && products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <RefreshCw
              size={40}
              className="text-indigo-600 animate-spin mb-4"
            />
            <p className="text-slate-500 font-bold">Loading products...</p>
          </div>
        ) : products.length > 0 ? (
          <>
            <div className={`overflow-x-auto transition-opacity duration-300 ${loading ? 'opacity-50' : 'opacity-100'}`}>
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
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link
                            to={`/admin/products/info/${product.id}`}
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                            title="View Details"
                          >
                            <Eye size={18} />
                          </Link>
                          <Link
                            to={`/admin/products/edit/${product.id}`}
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                            title="Edit Product"
                          >
                            <Edit2 size={18} />
                          </Link>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
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
                    Showing <span className="text-slate-900 font-bold">{(page - 1) * limit + 1}-{Math.min(page * limit, totalProducts)}</span> of <span className="text-slate-900 font-bold">{totalProducts}</span> products
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
              No products found
            </h3>
            <p className="text-slate-500 font-medium">
              Try adjusting your search or filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
