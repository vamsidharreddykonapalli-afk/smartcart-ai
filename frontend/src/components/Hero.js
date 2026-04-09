import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FaRocket, FaChevronRight, FaRobot } from "react-icons/fa";

const Hero = () => {
  return (
    <section className="relative bg-white pt-24 pb-32 overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-50 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-50 rounded-full blur-3xl opacity-50" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center space-x-2 bg-indigo-50 px-4 py-1.5 rounded-full mb-8 border border-indigo-100"
          >
            <FaRobot className="text-indigo-600 h-4 w-4" />
            <span className="text-indigo-600 font-black text-[10px] uppercase tracking-widest leading-none">
              AI-Powered Shopping Assistant
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-8xl font-black text-slate-900 tracking-tighter leading-[0.9] mb-8"
          >
            Shop Smarter. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
              Save Harder.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl text-xl text-slate-500 font-medium leading-relaxed mb-12"
          >
            SmartCart AI monitors real-time prices across major grocery stores to find you the cheapest route for your entire shopping list. 
            Stop overpaying and start saving today.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6"
          >
            <Link
              to="/register"
              className="group flex items-center space-x-3 bg-indigo-600 text-white px-10 py-5 rounded-[2rem] font-black text-lg transition-all hover:bg-indigo-700 shadow-2xl shadow-indigo-200 hover:-translate-y-1 active:scale-95"
            >
              <span>Get Started Free</span>
              <FaRocket className="group-hover:rotate-12 transition-transform" />
            </Link>
            
            <a
              href="#features"
              className="flex items-center space-x-2 text-slate-900 font-black text-lg hover:text-indigo-600 transition-colors"
            >
              <span>How it works</span>
              <FaChevronRight className="h-3 w-3" />
            </a>
          </motion.div>

          {/* Social Proof / Trust Badge */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-20 pt-10 border-t border-slate-100 w-full"
          >
            <p className="text-[10px] uppercase tracking-[0.3em] font-black text-slate-400 mb-6">
              Supported Platforms
            </p>
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-40 grayscale hover:grayscale-0 transition-all pointer-events-none">
                <span className="text-2xl font-black tracking-tight">BigBasket</span>
                <span className="text-2xl font-black tracking-tight">Zepto</span>
                <span className="text-2xl font-black tracking-tight">Blinkit</span>
                <span className="text-2xl font-black tracking-tight">Amazon Fresh</span>
                <span className="text-2xl font-black tracking-tight">Swiggy Instamart</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
