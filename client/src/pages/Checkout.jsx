import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { X, MapPin, Plus, CreditCard, QrCode, Truck, ChevronLeft, CheckCircle2, ShieldCheck, ArrowRight } from "lucide-react";
import api from "../../utils/api";
import { useSelector, useDispatch } from "react-redux";
import { fetchCart, clearCart } from "../store/slices/cartSlice";

const Checkout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items: cartData } = useSelector((state) => state.cart);

  const [userProfile, setUserProfile] = useState(null);
  const [addressType, setAddressType] = useState("home");
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

  const [checkoutStep, setCheckoutStep] = useState("address");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [cardNumber, setCardNumber] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchUserProfile();
    if (cartData.length === 0) {
      dispatch(fetchCart());
    }
  }, [dispatch, cartData.length]);

  const fetchUserProfile = async () => {
    try {
      const res = await api.get("/users/profile");
      setUserProfile(res.data.data);
    } catch (err) {
      console.error("Error fetching profile", err);
    }
  };

  const totalAmount = cartData.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const typeToSave = addressType;

    const addressPayload = {
      address: {
        [typeToSave]: {
          street: formData.get("street"),
          city: formData.get("city"),
          state: formData.get("state"),
          zipcode: formData.get("zipcode"),
          country: "India",
        },
      },
    };

    try {
      const response = await api.put("/users/profile", addressPayload);
      setUserProfile(response.data.data);
      setIsAddressModalOpen(false);
      toast.success(`${typeToSave} address saved!`);
    } catch (err) {
      toast.error("Failed to save address");
    }
  };

  const paymentOptions = [
    { label: "Credit/Debit Card", value: "CARD", icon: CreditCard, desc: "Secure encrypted transaction" },
    { label: "UPI Payment", value: "UPI", icon: QrCode, desc: "Scan and pay using any app" },
    { label: "Cash On Delivery", value: "COD", icon: Truck, desc: "Pay when you receive" },
  ];

  const completeOrder = async () => {
    try {
      await api.post("/order", {
        addressType,
        paymentMode: selectedPaymentMethod,
      });

      toast.success("Order placed successfully!");
      dispatch(clearCart());
      setTimeout(() => navigate("/shop"), 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to place order");
    }
  };

  const handleConfirmPayment = () => {
    if (!selectedPaymentMethod) {
      toast.info("Please select a payment method");
      return;
    }

    if (selectedPaymentMethod === "CARD") {
      setCheckoutStep("card");
    } else if (selectedPaymentMethod === "UPI") {
      setCheckoutStep("upi");
    } else {
      completeOrder();
    }
  };

  const handleCardNumberChange = (e) => {
    let value = e.target.value.replace(/\D/g, "").slice(0, 16);
    value = value.replace(/(.{4})/g, "$1 ").trim();
    setCardNumber(value);
  };

  if (cartData.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-8 shadow-xl shadow-indigo-500/10">
          <Truck size={40} className="text-slate-300" />
        </div>
        <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Your cart is empty</h2>
        <p className="text-slate-500 font-medium mb-8">Add components to your cart before checking out.</p>
        <Link to="/shop" className="btn-primary flex items-center gap-2 group">
          Start Exploring
          <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-10 pb-10 px-4 md:px-8">
      <div className="max-w-10xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
          <div>
            <nav className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
              <Link to="/shop" className="hover:text-indigo-600 transition-colors">Shop</Link>
              <ArrowRight size={10} strokeWidth={3} />
              <span className="text-indigo-600">Checkout</span>
            </nav>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter uppercase">
              Secure <span className="text-indigo-600">Checkout</span>
            </h1>
          </div>

          {/* Progress Indicators */}
          <div className="flex items-center justify-center md:justify-start gap-4">
            {["address", "payment", "confirm"].map((step, i) => (
              <React.Fragment key={step}>
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                    (checkoutStep === step || (step === "confirm" && (checkoutStep === "card" || checkoutStep === "upi"))) 
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" 
                    : "bg-white border border-slate-200 text-slate-400"
                  }`}>
                    {i + 1}
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-widest hidden sm:block ${
                    (checkoutStep === step || (step === "confirm" && (checkoutStep === "card" || checkoutStep === "upi"))) 
                    ? "text-slate-900" 
                    : "text-slate-400"
                  }`}>
                    {step}
                  </span>
                </div>
                {i < 2 && <div className="w-8 h-[2px] bg-slate-200"></div>}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8 space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* ADDRESS STEP */}
            {checkoutStep === "address" && (
              <div className="bg-white p-6 sm:p-8 md:p-10 rounded-[40px] border border-slate-100 shadow-2xl shadow-indigo-500/5">
                <div className="flex items-center gap-3 mb-10">
                  <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                    <MapPin size={20} />
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Shipping Destination</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {["home", "office"].map((type) => (
                    <div key={type} className="relative group">
                      {userProfile?.address?.[type]?.street ? (
                        <label
                          className={`flex flex-col p-6 rounded-3xl border-2 cursor-pointer transition-all duration-300 relative overflow-hidden h-full ${
                            addressType === type 
                            ? "border-indigo-600 bg-indigo-50/50 shadow-lg shadow-indigo-500/10" 
                            : "border-slate-100 bg-slate-50/50 hover:border-indigo-200"
                          }`}
                        >
                          <input
                            type="radio"
                            name="addr"
                            checked={addressType === type}
                            onChange={() => setAddressType(type)}
                            className="absolute top-4 right-4 w-5 h-5 accent-indigo-600"
                          />
                          <div className="flex items-center gap-3 mb-4">
                            <div className={`p-2 rounded-lg transition-colors ${addressType === type ? "bg-indigo-600 text-white" : "bg-white text-slate-400 border border-slate-100"}`}>
                              {type === "home" ? <MapPin size={16} /> : <Truck size={16} />}
                            </div>
                            <span className="font-black text-slate-900 uppercase tracking-widest text-[10px]">
                              {type} Address
                            </span>
                          </div>
                          <p className="text-sm font-bold text-slate-600 leading-relaxed truncate">
                            {userProfile.address[type].street}
                          </p>
                          <p className="text-xs font-medium text-slate-400 mt-1 uppercase tracking-wider">
                            {userProfile.address[type].city}, {userProfile.address[type].state}
                          </p>
                          {addressType === type && (
                            <div className="absolute -bottom-2 -right-2 text-indigo-600/5">
                              <CheckCircle2 size={100} strokeWidth={1} />
                            </div>
                          )}
                        </label>
                      ) : (
                        <button
                          onClick={() => {
                            setAddressType(type);
                            setIsAddressModalOpen(true);
                          }}
                          className="w-full flex flex-col items-center justify-center gap-4 p-8 border-2 border-dashed border-slate-200 rounded-3xl text-slate-400 hover:border-indigo-400 hover:text-indigo-600 hover:bg-slate-50 transition-all group h-full"
                        >
                          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                            <Plus size={24} />
                          </div>
                          <span className="font-black uppercase tracking-widest text-[10px]">Add {type} Address</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                
                <button
                  disabled={!userProfile?.address?.[addressType]?.street}
                  onClick={() => setCheckoutStep("payment")}
                  className="w-full btn-primary py-5 rounded-3xl mt-10 flex items-center justify-center gap-3 group h-16"
                >
                  Confirm & Payment
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            )}

            {/* PAYMENT STEP */}
            {checkoutStep === "payment" && (
              <div className="bg-white p-6 sm:p-8 md:p-10 rounded-[40px] border border-slate-100 shadow-2xl shadow-indigo-500/5 animate-in fade-in slide-in-from-right-4 duration-500">
                <button
                  onClick={() => setCheckoutStep("address")}
                  className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 flex items-center gap-2 mb-8 transition-colors group"
                >
                  <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" strokeWidth={3} />
                  Back to shipping
                </button>
                
                <div className="flex items-center gap-3 mb-10">
                  <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                    <CreditCard size={20} />
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Payment Framework</h2>
                </div>

                <div className="space-y-4">
                  {paymentOptions.map((method) => (
                    <label
                      key={method.value}
                      className={`flex items-center justify-between p-6 border-2 rounded-[32px] cursor-pointer transition-all duration-300 ${
                        selectedPaymentMethod === method.value 
                        ? "border-indigo-600 bg-indigo-50/50" 
                        : "border-slate-100 bg-slate-50 hover:border-indigo-200"
                      }`}
                    >
                      <div className="flex items-center gap-5">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
                          selectedPaymentMethod === method.value ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" : "bg-white text-slate-400 border border-slate-100"
                        }`}>
                          <method.icon size={24} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-lg">{method.label}</p>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{method.desc}</p>
                        </div>
                      </div>
                      <input
                        type="radio"
                        name="pay"
                        value={method.value}
                        checked={selectedPaymentMethod === method.value}
                        onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                        className="w-6 h-6 accent-indigo-600"
                      />
                    </label>
                  ))}
                </div>

                <button
                  onClick={handleConfirmPayment}
                  className="w-full btn-primary py-5 rounded-3xl mt-10 flex items-center justify-center gap-3 group h-16"
                >
                  {selectedPaymentMethod === "COD" ? "Finalize Order" : "Proceed Securely"}
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            )}

            {/* CARD DETAILS */}
            {checkoutStep === "card" && (
              <div className="bg-white p-6 sm:p-8 md:p-10 rounded-[40px] border border-slate-100 shadow-2xl shadow-indigo-500/5 animate-in fade-in slide-in-from-right-4 duration-500">
                <button
                  onClick={() => setCheckoutStep("payment")}
                  className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 flex items-center gap-2 mb-8 transition-colors group"
                >
                  <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" strokeWidth={3} />
                  Change method
                </button>
                
                <h2 className="text-2xl font-black mb-10 text-slate-900 tracking-tight uppercase text-center">Encrypted Card Entry</h2>
                
                <form
                  className="space-y-6 max-w-md mx-auto"
                  onSubmit={(e) => {
                    e.preventDefault();
                    completeOrder();
                  }}
                >
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Cardholder Name</label>
                    <input
                      type="text"
                      className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium text-sm"
                      placeholder="JOHN DOE"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Card Number</label>
                    <div className="relative">
                      <CreditCard className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                      <input
                        type="text"
                        placeholder="0000 0000 0000 0000"
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-black text-sm tracking-widest"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Expiry Date</label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-sm"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">CVC Code</label>
                      <input
                        type="text"
                        placeholder="000"
                        maxLength={3}
                        className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-sm"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-indigo-50 rounded-2xl border border-indigo-100 mb-4">
                    <ShieldCheck className="text-indigo-600" size={20} />
                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest leading-none">
                      PCI-DSS Compliant Encryption Activity active
                    </p>
                  </div>

                  <button className="w-full btn-primary py-5 rounded-3xl mt-4 flex items-center justify-center gap-3 h-16 group">
                    Complete Payment Activity
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </form>
              </div>
            )}

            {/* UPI DETAILS */}
            {checkoutStep === "upi" && (
              <div className="bg-white p-6 sm:p-8 md:p-10 rounded-[40px] border border-slate-100 shadow-2xl shadow-indigo-500/5 animate-in fade-in slide-in-from-right-4 duration-500 text-center">
                <button
                  onClick={() => setCheckoutStep("payment")}
                  className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 flex items-center gap-2 mb-8 transition-colors group"
                >
                  <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" strokeWidth={3} />
                  Change method
                </button>
                
                <h2 className="text-2xl font-black mb-4 text-slate-900 tracking-tight uppercase">Unified Payments Interface</h2>
                <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-10">Scan the secure matrix to proceed</p>
                
                <div className="relative inline-block mb-10 group">
                  <div className="absolute inset-0 bg-indigo-600 blur-2xl opacity-10 group-hover:opacity-20 transition-opacity"></div>
                  <img
                    src="https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=upi://pay&color=312e81"
                    alt="Secure QR Matrix"
                    className="relative z-10 p-6 bg-white rounded-[40px] border border-slate-100 shadow-2xl mx-auto"
                  />
                </div>
                
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-10">
                  Ready to verify payment completion
                </p>
                
                <button
                  onClick={completeOrder}
                  className="w-full btn-primary py-5 rounded-3xl flex items-center justify-center gap-3 h-16"
                >
                  I've Completed the Payment
                  <CheckCircle2 size={20} />
                </button>
              </div>
            )}
          </div>

          <div className="lg:col-span-4">
            <div className="glass-card rounded-[40px] p-6 sm:p-8 md:p-10 lg:sticky lg:top-32 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-full h-full bg-indigo-600/[0.03] -z-10"></div>
              
              <h3 className="text-2xl font-black text-slate-900 mb-8 tracking-tight uppercase">Order Summary</h3>
              
              <div className="space-y-6 mb-10">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Selected Items</span>
                  <span className="text-sm font-black text-slate-900">{cartData.length}</span>
                </div>
                {/* Detailed item list */}
                <div className="space-y-3 max-h-[260px] overflow-y-auto pr-2 custom-scrollbar">
                  {cartData.map((item, i) => (
                    <div key={i} className="flex items-center gap-4 bg-white/50 p-2 rounded-2xl border border-slate-100/50 group/item">
                      <div className="w-12 h-12 bg-white rounded-xl overflow-hidden flex-shrink-0 shadow-sm border border-slate-50">
                        <img src={item.image} alt={item.title} className="w-full h-full object-contain p-1 group-hover/item:scale-110 transition-transform duration-500" />
                      </div>
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="text-[10px] font-black text-slate-900 uppercase truncate">
                          {item.title}
                        </span>
                        <div className="flex justify-between items-center mt-0.5">
                          <span className="text-[10px] font-bold text-indigo-600">
                            QTY: {item.quantity}
                          </span>
                          <span className="text-[10px] font-black text-slate-900">
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="pt-6 border-t border-slate-100 flex justify-between items-center">
                  <span className="text-lg font-black text-slate-900 tracking-tight uppercase">Final Total</span>
                  <span className="text-3xl font-black text-indigo-600 tracking-tighter">${totalAmount.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                  <Truck className="text-emerald-600" size={18} />
                  <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest leading-none">
                    Elite Priority Shipping Included
                  </p>
                </div>
                <p className="text-[10px] font-bold text-slate-400 text-center uppercase tracking-widest px-4">
                  By confirming, you agree to our premium terms of service and priority delivery protocols.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Address Modal */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg p-6 sm:p-10 md:p-12 rounded-[48px] relative shadow-2xl animate-in zoom-in-95 duration-300">
            <button
              onClick={() => setIsAddressModalOpen(false)}
              className="absolute top-8 right-8 w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all hover:rotate-90"
            >
              <X size={24} />
            </button>
            <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight uppercase flex items-center gap-3">
              <Plus className="text-indigo-600" /> New <span className="text-indigo-600">{addressType}</span>
            </h2>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-10">Configure your shipping destination coordinates</p>
            
            <form onSubmit={handleAddressSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Street Landmark</label>
                <input
                  name="street"
                  required
                  className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium text-sm"
                  placeholder="Enter your address here"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">City </label>
                  <input
                    name="city"
                    required
                    className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium text-sm"
                    placeholder="Enter City Here"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">State </label>
                  <input
                    name="state"
                    required
                    className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium text-sm"
                    placeholder="Enter State Here"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Pin Code</label>
                <input
                  name="zipcode"
                  required
                  className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-black tracking-widest text-sm"
                  placeholder="Enter Pin Code Here"
                />
              </div>
              
              <button
                type="submit"
                className="w-full btn-primary py-5 rounded-3xl mt-4 flex items-center justify-center gap-3 h-16 group"
              >
                Integrate Address
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;
