import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { ShoppingCart, LayoutGrid, Truck, CircleUserRound, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";

const Home = () => {
  const token = useSelector((state) => state.auth.isAuthenticated);

  return (
    <div className="min-h-screen bg-slate-50 overflow-x-hidden">
      <section className="relative pt-15 pb-10 md:pt-10 md:pb-10 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-indigo-50/30 to-transparent -z-10"></div>
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-500/[0.03] rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-[10%] left-[-10%] w-[500px] h-[500px] bg-rose-500/[0.03] rounded-full blur-3xl -z-10"></div>

        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white border border-indigo-100 text-indigo-600 text-[10px] font-black uppercase tracking-[0.2em] mb-10 animate-in fade-in slide-in-from-bottom-4 duration-1000 shadow-xl shadow-indigo-500/5">
            <Sparkles size={12} strokeWidth={3} />
            The New Standard in Commerce
          </div>
          
          <h1 className="text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-black text-slate-900 mb-8 leading-[0.85] tracking-tighter animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-100">
            ELITE <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 bg-[length:200%_auto] animate-gradient">ACQUISITIONS.</span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-base md:text-lg text-slate-500 mb-12 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200 uppercase font-black tracking-widest">
            A meticulously curated matrix of premium products designed for the modern architect of lifestyle.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300">
            <Link to="/shop" className="btn-primary h-16 px-10 flex items-center gap-3 group text-[10px] tracking-[0.2em]">
              Initialize Shopping
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" strokeWidth={3} />
            </Link>
            {!token && (
              <Link to="/register" className="btn-secondary h-16 px-10 flex items-center text-[10px] tracking-[0.2em]">
                Create Elite ID
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className="py-10 bg-white border-y border-slate-50 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-slate-50 opacity-[0.3] pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-20">
            {[
              { title: "Curated Protocol", desc: "Every unit is hand-verified for quality excellence and architectural integrity.", icon: LayoutGrid },
              { title: "Elite Logistics", desc: "Priority global shipping lanes ensure your assets arrive in record time.", icon: Truck },
              { title: "Member Support", desc: "Dedicated 24/7 technical assistance for the ShopPro elite community.", icon: ShieldCheck }
            ].map((f, i) => (
              <div key={i} className="group p-10 rounded-[40px] hover:bg-white transition-all duration-700 border border-transparent hover:border-slate-100 hover:shadow-2xl hover:shadow-indigo-500/5">
                <div className="w-16 h-16 bg-slate-50 text-indigo-600 rounded-3xl flex items-center justify-center mb-10 group-hover:bg-indigo-600 group-hover:text-white group-hover:rotate-12 transition-all duration-500 shadow-sm">
                  <f.icon size={28} strokeWidth={2} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-6 tracking-tight uppercase leading-none">{f.title}</h3>
                <p className="text-slate-400 leading-relaxed font-bold uppercase text-[10px] tracking-widest">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-10 relative overflow-hidden bg-slate-50">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-indigo-600/[0.02] blur-3xl pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-6">
          <div className="glass-card rounded-[60px] p-16 md:p-24 overflow-hidden relative border-white/40 shadow-2xl shadow-indigo-500/10">
            <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-white/40 via-transparent to-indigo-600/[0.03] -z-10"></div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 text-center relative z-10">
              {[
                { val: "250k+", label: "Elite Members" },
                { val: "1.2k+", label: "Luxury Brands" },
                { val: "100%", label: "Satisfaction" },
                { val: "90m", label: "Avg Response" }
              ].map((s, i) => (
                <div key={i} className="space-y-4">
                  <p className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none">{s.val}</p>
                  <p className="text-indigo-600 font-black uppercase tracking-[0.2em] text-[10px]">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;