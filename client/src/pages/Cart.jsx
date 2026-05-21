import { useEffect } from "react";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import api from "../../utils/api";
import { useSelector, useDispatch } from "react-redux";
import { addToCart, removeFromCart, fetchCart } from "../store/slices/cartSlice";
import { Trash2, ShoppingBag, ArrowRight, Minus, Plus } from "lucide-react";

const Cart = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items: cartData, loading } = useSelector((state) => state.cart);
  const { isAuthenticated: isLoggedIn } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  const removeItem = async (id) => {
    try {
      if (isLoggedIn) {
        await api.delete(`/users/cart/${id}`, { quantity: 1 });
      }
      dispatch(removeFromCart(id));
      toast.warn("Item removed");
    } catch (err) {
      toast.error("Failed to remove item");
    }
  };

  const plusItem = async (item) => {
    try {
      if (isLoggedIn) {
        await api.post(`/users/cart/${item.id}`, { quantity: 1 });
      }
      dispatch(addToCart(item));
      toast.success("Item added");
    } catch (err) {
      toast.error("Failed to add item");
    }
  };

  const totalAmount = cartData.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const handleCheckoutClick = () => {
    if (!isLoggedIn) {
      navigate("/login?redirect=/checkout");
    } else {
      navigate("/checkout");
    }
  };

  if (loading && cartData.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-4 pb-10 px-4 md:px-8">
      <div className="max-w-10xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tighter">
            YOUR <span className="text-indigo-600">BAG</span>
          </h1>
          <span className="text-sm font-black uppercase tracking-widest text-slate-400">
            {cartData.length} {cartData.length === 1 ? "Item" : "Items"}
          </span>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 items-start">
          <div className="w-full lg:w-2/3 space-y-6">
            {cartData.length > 0 ? (
              cartData.map((item) => (
                <div
                  key={item.id}
                  className="group bg-white p-6 rounded-[32px] border border-slate-100 hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-500 flex flex-col sm:flex-row items-center gap-8"
                >
                  <div className="w-full sm:w-32 h-64 sm:h-32 bg-slate-50 rounded-2xl p-6 flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <div className="flex-1 text-center sm:text-left w-full sm:w-auto">
                    <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500 mb-1">
                      {item.category}
                    </p>
                    <h3 className="text-xl font-bold text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors line-clamp-1">
                      {item.title}
                    </h3>
                    <p className="text-slate-400 font-bold text-sm tracking-tight">
                      Unit Price: <span className="text-slate-900">₹{item.price}</span>
                    </p>
                  </div>

                  <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center w-full sm:w-auto gap-4 min-w-[140px] pt-4 sm:pt-0 border-t sm:border-t-0 border-slate-50">
                    <div className="flex items-center bg-slate-50 rounded-2xl p-1 border border-slate-100">
                      <button
                        onClick={() => removeItem(item.id)}
                        className="w-10 h-10 flex items-center justify-center bg-white text-slate-600 rounded-xl hover:text-rose-600 transition-all shadow-sm active:scale-90"
                      >
                        {item.quantity === 1 ? <Trash2 size={16} /> : <Minus size={16} />}
                      </button>
                      <span className="w-10 text-center font-black text-slate-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => plusItem(item)}
                        className="w-10 h-10 flex items-center justify-center bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition-all active:scale-90"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    <p className="font-black text-xl sm:text-2xl text-slate-900 tracking-tighter">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-[40px] p-12 text-center border border-dashed border-slate-200 h-[50vh] flex flex-col justify-center items-center animate-in fade-in zoom-in duration-700">
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-8">
                  <ShoppingBag size={48} className="text-slate-200" strokeWidth={1.5} />
                </div>
                <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Empty Bag</h2>
                <p className="text-slate-500 font-medium mb-8">Looks like you haven't added anything yet.</p>
                <Link
                  to="/shop"
                  className="btn-primary flex items-center gap-2 group"
                >
                  Start Shopping
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            )}
          </div>

          {cartData.length > 0 && (
            <div className="w-full lg:w-1/3">
              <div className="glass-card rounded-[40px] p-8 md:p-10 lg:sticky lg:top-32 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-full h-full bg-indigo-600/[0.03] -z-10"></div>

                <h2 className="text-2xl font-black text-slate-900 mb-8 tracking-tight">
                  SUMMARY
                </h2>

                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Subtotal</span>
                    <span className="text-lg font-black text-slate-900">₹{totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Shipping</span>
                    <span className="text-sm font-black text-emerald-600 uppercase tracking-widest px-3 py-1 bg-emerald-50 rounded-full border border-emerald-50">Free</span>
                  </div>

                  <div className="pt-6 border-t border-slate-100 flex justify-between items-center">
                    <span className="text-lg font-black text-slate-900 tracking-tight uppercase">Total</span>
                    <span className="text-3xl font-black text-indigo-600 tracking-tighter">₹{totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  className="w-full mt-10 btn-primary py-4 text-lg flex items-center justify-center gap-3 group"
                  onClick={handleCheckoutClick}
                >
                  Checkout Now
                  <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cart;
