import { Search, Filter, ShoppingCart, Minus, Plus, RefreshCw, ChevronRight, ChevronDown } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import api from "../../utils/api";
import { toast } from "react-toastify";
import { addToCart, removeFromCart } from "../store/slices/cartSlice";

const Shop = () => {
  const [products, setProduct] = useState([]);
  const [categories, setCategories] = useState(["All"]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const dispatch = useDispatch();
  const { items: cart, loading: cartLoading } = useSelector((state) => state.cart);
  const { isAuthenticated: isLoggedIn } = useSelector((state) => state.auth);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const dropdownRef = useRef(null);

  const selectedCategory = searchParams.get("category") || "All";

  const fetchCategories = async () => {
    try {
      const res = await api.get("/category");
      const cats = res.data.data.map((c) => c.slug);
      setCategories(["All", ...cats]);
    } catch (err) {
      toast.error("Failed to fetch categories");
    }
  };

  const fetchProducts = async (page = 1) => {
    try {
      setLoading(true);
      const response = await api.get("/users/products", {
        params: {
          page: page,
          limit: 18,
          category: selectedCategory !== "All" ? selectedCategory : undefined,
          search: debouncedSearch || undefined,
        },
      });

      const data = response.data;
      const formattedProducts = data.fetchProduct.map((p) => ({
        id: String(p._id),
        title: p.name,
        price: p.price,
        image: p.image?.[0]
          ? `${import.meta.env.VITE_BASE_URL}${p.image[0]}`
          : null,
        description: p.description,
        category: p.category?.slug,
      }));

      setProduct(formattedProducts);
      setTotalPages(data.totalPages);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (!cartLoading) {
      fetchProducts(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [page, selectedCategory, debouncedSearch, cartLoading]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, selectedCategory]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsCategoryOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getProductQty = (id) => {
    const item = cart.find((i) => i.id === id);
    return item ? item.quantity : 0;
  };

  const increaseQty = async (product) => {
    try {
      if (isLoggedIn) {
        await api.post(`users/cart/${product.id}`, { quantity: 1 });
      }
      dispatch(addToCart(product));
      toast.success("Added to cart");
    } catch (err) {
      toast.error("Failed to add to cart");
    }
  };

  const decreaseQty = async (product) => {
    try {
      if (isLoggedIn) {
        await api.delete(`/users/cart/${product.id}`, { quantity: 1 });
      }
      dispatch(removeFromCart(product.id));
      toast.warn("Removed from cart");
    } catch (err) {
      toast.error("Failed to remove from cart");
    }
  };

  const handleReset = () => {
    setSearch("");
    setSearchParams({});
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-4 pb-6 px-4 md:px-8">
      <div className="max-w-10xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <nav className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
              <Link to="/" className="hover:text-indigo-600 transition-colors">Home</Link>
              <ChevronRight size={12} strokeWidth={3} />
              <span className="text-indigo-600">Shop</span>
            </nav>
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tighter uppercase">
              Explore Our <span className="text-indigo-600">Collection</span>
            </h1>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="relative group flex-grow md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 h-12 rounded-2xl bg-white border border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-medium"
              />
            </div>

            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                className="flex items-center justify-between w-full sm:w-48 h-12 bg-white border border-slate-200 px-5 rounded-2xl text-left capitalize text-sm font-bold text-slate-700 hover:border-indigo-500 transition-colors group"
              >
                <span className="flex items-center gap-2">
                  <Filter size={16} className="text-slate-400 group-hover:text-indigo-600" />
                  {selectedCategory === "All" ? "Categories" : selectedCategory}
                </span>
                <ChevronDown size={16} className={`text-slate-400 transition-transform duration-200 ${isCategoryOpen ? "rotate-180" : ""}`} />
              </button>

              {isCategoryOpen && (
                <div className="absolute right-0 z-50 mt-2 w-full sm:w-64 glass-card rounded-2xl p-2 animate-in fade-in zoom-in-95 duration-200 origin-top-right shadow-2xl bg-white border border-slate-100">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => {
                        setPage(1);
                        if (category === "All") {
                          setSearchParams({});
                        } else {
                          setSearchParams({ category });
                        }
                        setIsCategoryOpen(false);
                      }}
                      className={`block w-full text-left px-4 py-3 rounded-xl capitalize text-sm font-bold transition-all ${selectedCategory === category
                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                        : "text-slate-600 hover:bg-indigo-50 hover:text-indigo-600"
                        }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-[32px] p-4 border border-slate-100 h-[420px] animate-pulse">
                <div className="h-48 bg-slate-100 rounded-2xl mb-6"></div>
                <div className="h-4 bg-slate-100 rounded w-1/3 mb-4"></div>
                <div className="h-6 bg-slate-100 rounded w-3/4 mb-4"></div>
                <div className="h-10 bg-slate-100 rounded-xl mt-auto"></div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6 md:gap-8">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="group bg-white rounded-[32px] p-5 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 border border-slate-100 hover:border-indigo-100 flex flex-col"
                >
                  <div className="relative h-56 w-full rounded-2xl overflow-hidden mb-6 bg-slate-50 flex items-center justify-center p-6">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.title}
                        className="max-h-full object-contain group-hover:scale-110 transition-transform duration-700"
                      />
                    ) : (
                      <ShoppingCart size={48} className="text-slate-200" />
                    )}
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-indigo-600 shadow-sm border border-indigo-50">
                      {product.category || "General"}
                    </div>
                  </div>

                  <h3 className="font-bold text-slate-800 text-lg leading-tight md:leading-snug line-clamp-2 h-11 md:h-14 mb-0.5 md:mb-4 group-hover:text-indigo-600 transition-colors">
                    {product.title}
                  </h3>

                  <p className="text-slate-400 text-xs line-clamp-2 h-8 mb-4">
                    {product.description}
                  </p>

                  <p className="text-xl font-black text-slate-900 mb-6 flex items-center gap-1">
                    <span className="text-sm font-bold text-indigo-500">$</span>
                    {product.price}
                  </p>

                  <div className="mt-auto">
                    {getProductQty(product.id) === 0 ? (
                      <button
                        onClick={() => increaseQty(product)}
                        className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-2xl hover:bg-indigo-600 active:scale-95 transition-all shadow-lg hover:shadow-indigo-500/20 flex items-center justify-center gap-2"
                      >
                        <Plus size={18} />
                        Add to Cart
                      </button>
                    ) : (
                      <div className="flex items-center justify-between bg-indigo-50 rounded-2xl p-1 border border-indigo-100">
                        <button
                          onClick={() => decreaseQty(product)}
                          className="w-10 h-10 flex items-center justify-center bg-white text-indigo-600 rounded-xl hover:text-rose-600 transition-colors shadow-sm active:scale-90"
                        >
                          <Minus size={18} />
                        </button>
                        <span className="font-black text-indigo-600 px-4">
                          {getProductQty(product.id)}
                        </span>
                        <button
                          onClick={() => increaseQty(product)}
                          className="w-10 h-10 flex items-center justify-center bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition-colors active:scale-90"
                        >
                          <Plus size={18} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-3 mt-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((prev) => prev - 1)}
                  className="p-3 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-600 disabled:opacity-30 disabled:hover:border-slate-200 disabled:hover:text-slate-600 transition-all font-bold group"
                >
                  <ChevronRight size={20} className="rotate-180 group-hover:-translate-x-1 transition-transform" />
                </button>

                <div className="flex items-center gap-2 bg-white px-5 py-2.5 rounded-xl border border-slate-200">
                  <span className="text-xs font-black uppercase tracking-widest text-slate-400">Page</span>
                  <span className="text-sm font-black text-indigo-600">{page}</span>
                  <span className="text-xs font-black uppercase tracking-widest text-slate-400">of {totalPages}</span>
                </div>

                <button
                  disabled={page === totalPages}
                  onClick={() => setPage((prev) => prev + 1)}
                  className="p-3 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-600 disabled:opacity-30 disabled:hover:border-slate-200 disabled:hover:text-slate-600 transition-all font-bold group"
                >
                  <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[40px] border border-dashed border-slate-200">
            <div className="w-20 h-20 bg-slate-50 flex items-center justify-center rounded-3xl text-slate-300 mb-8">
              <RefreshCw size={40} className="animate-spin-slow" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">No results found</h2>
            <p className="text-slate-500 font-medium mb-8">Try adjusting your filters or search terms.</p>
            <button
              onClick={handleReset}
              className="btn-secondary"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Shop;
