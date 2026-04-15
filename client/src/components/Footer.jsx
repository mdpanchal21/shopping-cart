import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Github, Mail, MapPin, Phone, ArrowRight, ShoppingBag } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-100 py-6 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
        {/* Brand & Links */}
        <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 group-hover:rotate-6 transition-transform duration-500">
              <ShoppingBag size={16} strokeWidth={2.5} />
            </div>
            <span className="text-lg font-black text-slate-900 tracking-tighter uppercase">
              Shop<span className="text-indigo-600">Pro</span>
            </span>
          </Link>

          <nav className="flex items-center gap-6">
             {[
               { name: "Shop", path: "/shop" },
               { name: "Cart", path: "/mycart" },
               { name: "Profile", path: "/profile" }
             ].map((link) => (
               <Link 
                 key={link.name} 
                 to={link.path} 
                 className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors"
               >
                 {link.name}
               </Link>
             ))}
          </nav>
        </div>

        {/* Socials & Copyright */}
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-4">
            {[Facebook, Instagram, Twitter].map((Icon, i) => (
              <a key={i} href="#" className="text-slate-300 hover:text-indigo-600 transition-colors">
                <Icon size={14} />
              </a>
            ))}
          </div>
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 border-l border-slate-100 pl-8">
            © 2025 ShopPro.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
