import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  ChevronLeft,
  ShoppingCart,
  Plus,
  Minus,
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  RefreshCw
} from "lucide-react";
import api from "../../utils/api";
import { toast } from "react-toastify";
import { addToCart, removeFromCart } from "../store/slices/cartSlice";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const { items: cart } = useSelector((state) => state.cart);
  const { isAuthenticated: isLoggedIn } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/product/${id}`);
        // Transform backend data to frontend format
        const p = res.data.data;
        setProduct({
          id: p._id,
          title: p.name,
          price: p.price,
          allImages: p.image?.map(img => `${import.meta.env.VITE_BASE_URL}${img}`) || [],
          description: p.description,
          category: p.category?.name,
        });
      } catch (err) {
        toast.error("Product not found");
        navigate("/shop");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
    window.scrollTo(0, 0);
  }, [id, navigate]);

  const getProductQty = (pid) => {
    const item = cart.find((i) => i.id === pid);
    return item ? item.quantity : 0;
  };

  const increaseQty = async () => {
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

  const decreaseQty = async () => {
    try {
      if (isLoggedIn) {
        await api.delete(`/users/cart/${product.id}`, { quantity: 1 });
      }
      dispatch(removeFromCart(product.id));
      toast.warn("Removed from cart");
    } catch (err) {
      toast.error("Failed to update cart");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4 bg-slate-50">
        <RefreshCw size={40} className="animate-spin text-indigo-600" />
        <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Loading Product Experience...</p>
      </div>
    );
  }

  const mainImage = product.allImages[activeImageIndex];

  return (
    <div className="min-h-screen bg-white">
      {/* Header/Navigation */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <button
          onClick={() => navigate("/shop")}
          className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-colors group mb-8"
        >
          <div className="p-2 bg-slate-50 group-hover:bg-indigo-50 rounded-xl transition-colors">
            <ChevronLeft size={20} />
          </div>
          <span className="text-sm font-black uppercase tracking-widest">Back to Shop</span>
        </button>

        <div className="flex flex-col lg:flex-row gap-16">
          {/* Left: Image Gallery */}
          <div className="w-full lg:w-1/2 space-y-6">
            <div className="aspect-square bg-slate-50 rounded-[48px] overflow-hidden flex items-center justify-center p-12 relative group border border-slate-100">
              <img
                src={mainImage}
                alt={product.title}
                className="max-w-full max-h-full object-contain drop-shadow-2xl transition-transform duration-700 group-hover:scale-105"
              />

              <div className="absolute top-8 left-8">
                <span className="px-4 py-1.5 bg-white shadow-xl shadow-indigo-500/10 border border-indigo-50 rounded-full text-[10px] font-black uppercase tracking-widest text-indigo-600">
                  {product.category}
                </span>
              </div>
            </div>

            {/* Thumbnails */}
            {product.allImages.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                {product.allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-24 h-24 flex-shrink-0 rounded-3xl border-2 overflow-hidden transition-all duration-300 ${activeImageIndex === idx ? "border-indigo-600 scale-105 shadow-xl shadow-indigo-500/10" : "border-slate-100 opacity-60 hover:opacity-100"
                      }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-contain p-2" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Details */}
          <div className="w-full lg:w-1/2 flex flex-col pt-4">
            <div className="mb-8">
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter leading-tight mb-6">
                {product.title}
              </h1>

              <div className="flex items-center gap-6 mb-8">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Our Price</span>
                  <span className="text-5xl font-black text-indigo-600 tracking-tighter flex items-center gap-1">
                    <span className="text-xl font-bold mt-2">₹</span>
                    {product.price}
                  </span>
                </div>
                <div className="h-12 w-px bg-slate-200"></div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Stock Status</span>
                  <span className="text-xs font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    Express Shipping Available
                  </span>
                </div>
              </div>

              <div className="space-y-6">
                <p className="text-slate-500 text-lg font-medium leading-relaxed">
                  {product.description}
                </p>

                {/* Product Meta Icons */}
                <div className="grid grid-cols-2 gap-4 py-8 border-y border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                      <ShieldCheck size={20} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">2 Year Warranty</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                      <Truck size={20} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Free Next Day Delivery</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                      <RotateCcw size={20} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">30 Day Easy Returns</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                      <Star size={20} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">4.9 / 5 Guest Rating</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-auto pt-8">
              {getProductQty(product.id) === 0 ? (
                <button
                  onClick={increaseQty}
                  className="w-full bg-slate-900 text-white font-black py-6 rounded-[2rem] hover:bg-indigo-600 active:scale-95 transition-all shadow-2xl hover:shadow-indigo-500/20 flex items-center justify-center gap-4 uppercase tracking-widest text-sm"
                >
                  <ShoppingCart size={20} />
                  Add to Cart
                </button>
              ) : (
                <div className="flex items-center justify-between bg-indigo-50 rounded-[2.5rem] p-3 border border-indigo-100">
                  <button
                    onClick={decreaseQty}
                    className="w-16 h-16 flex items-center justify-center bg-white text-indigo-600 rounded-[2rem] hover:text-rose-600 transition-colors shadow-sm active:scale-90"
                  >
                    <Minus size={24} strokeWidth={3} />
                  </button>
                  <div className="flex flex-col items-center">
                    <span className="text-xs font-black text-indigo-400 uppercase tracking-widest">Items in Cart</span>
                    <span className="font-black text-4xl text-indigo-600">
                      {getProductQty(product.id)}
                    </span>
                  </div>
                  <button
                    onClick={increaseQty}
                    className="w-16 h-16 flex items-center justify-center bg-indigo-600 text-white rounded-[2rem] shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition-colors active:scale-90"
                  >
                    <Plus size={24} strokeWidth={3} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
