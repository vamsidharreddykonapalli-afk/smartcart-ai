import React from "react";
import { Link } from "react-router-dom";
import { FaBolt, FaTwitter, FaGithub, FaLinkedin } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-slate-900 pt-20 pb-10 text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-20 border-b border-slate-800 pb-16">
        <div className="col-span-1 md:col-span-2">
          <Link to="/" className="flex items-center space-x-3 group mb-8">
            <div className="bg-indigo-600 p-2 rounded-xl text-white transform group-hover:rotate-12 transition-transform shadow-md">
              <FaBolt className="h-6 w-6" />
            </div>
            <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-indigo-600 tracking-tighter capitalize transition-all">
              SmartCart <span className="font-light text-slate-500">AI</span>
            </span>
          </Link>
          <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-sm mb-10">
            Designing the best shopping experience for grocery shoppers who value their time and savings.
          </p>
          <div className="flex space-x-6">
             <a href="#" className="h-12 w-12 bg-slate-800 rounded-full flex items-center justify-center hover:bg-indigo-600 transition-colors">
                <FaTwitter className="h-5 w-5" />
             </a>
             <a href="#" className="h-12 w-12 bg-slate-800 rounded-full flex items-center justify-center hover:bg-indigo-600 transition-colors">
                <FaGithub className="h-5 w-5" />
             </a>
             <a href="#" className="h-12 w-12 bg-slate-800 rounded-full flex items-center justify-center hover:bg-indigo-600 transition-colors">
                <FaLinkedin className="h-5 w-5" />
             </a>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-8">Navigation</h4>
          <ul className="space-y-4 font-bold text-slate-300">
             <li><Link to="/" className="hover:text-indigo-400 transition-colors uppercase text-xs tracking-tight">Main Hub</Link></li>
             <li><a href="#features" className="hover:text-indigo-400 transition-colors uppercase text-xs tracking-tight">Features</a></li>
             <li><Link to="/register" className="hover:text-indigo-400 transition-colors uppercase text-xs tracking-tight">Get Started</Link></li>
             <li><Link to="/login" className="hover:text-indigo-400 transition-colors uppercase text-xs tracking-tight">Login</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-8">Legal</h4>
          <ul className="space-y-4 font-bold text-slate-300">
             <li><a href="#" className="hover:text-indigo-400 transition-colors uppercase text-xs tracking-tight">Privacy Policy</a></li>
             <li><a href="#" className="hover:text-indigo-400 transition-colors uppercase text-xs tracking-tight">Terms of Use</a></li>
             <li><a href="#" className="hover:text-indigo-400 transition-colors uppercase text-xs tracking-tight">Cookie Policy</a></li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 text-center text-slate-500 text-xs font-black uppercase tracking-[0.3em]">
         &copy; 2026 SmartCart AI Platform. Engineered for Efficiency.
      </div>
    </footer>
  );
};

export default Footer;
