import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import socket from "../socket";
import Navbar from "../components/Navbar";
import { 
  FaBell, 
  FaShoppingCart, 
  FaChartBar, 
  FaWallet, 
  FaMagic, 
  FaPiggyBank, 
  FaBoxOpen, 
  FaFireAlt 
} from "react-icons/fa";

const Dashboard = () => {
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    // Listen for real-time price updates
    socket.on("priceUpdate", (data) => {
      setNotification(data);
      // Auto-dismiss notification after 6 seconds
      setTimeout(() => setNotification(null), 6000);
    });

    return () => {
      socket.off("priceUpdate");
    };
  }, []);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { staggerChildren: 0.1, duration: 0.6, ease: "easeOut" }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-slate-50 p-6 sm:p-12 font-sans overflow-x-hidden">
        {/* Real-time Notification Banner */}
        <AnimatePresence>
          {notification && (
            <motion.div 
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
              className="fixed top-24 right-5 z-50"
            >
              <div className="bg-white border-l-4 border-indigo-600 shadow-2xl p-5 rounded-2xl flex items-center space-x-4 max-w-sm border border-gray-100">
                <div className="h-12 w-12 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 shadow-inner overflow-hidden">
                  <motion.div animate={{ rotate: [0, 15, -15, 0] }} transition={{ repeat: Infinity, duration: 0.5 }}>
                    <FaBell className="h-6 w-6" />
                  </motion.div>
                </div>
                <div className="flex-1">
                  <h4 className="font-black text-gray-900 text-sm tracking-tight capitalize">Live Deal Detected! 🔥</h4>
                  <p className="text-gray-600 text-xs font-semibold">
                    {notification.store}: ₹{notification.oldPrice} → 
                    <span className="font-black text-green-600"> ₹{notification.newPrice}</span>
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.header 
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="max-w-7xl mx-auto mb-16"
        >
          <motion.div variants={itemVariants} className="flex items-center space-x-3 mb-4">
             <div className="h-10 w-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 shadow-sm shadow-indigo-100">
                <FaFireAlt className="h-5 w-5" />
             </div>
             <span className="text-indigo-600 font-black text-sm uppercase tracking-widest italic">Precision Optimization</span>
          </motion.div>
          <motion.h1 
            variants={itemVariants}
            className="text-6xl font-black text-gray-900 tracking-tighter leading-[1.1]"
          >
            Smarter Shopping. <br />
            <span className="text-indigo-600">Higher Savings.</span>
          </motion.h1>
          <motion.p 
            variants={itemVariants}
            className="mt-6 text-xl text-gray-500 font-medium max-w-2xl leading-relaxed"
          >
            Welcome to the future of grocery shopping. SmartCart AI aggregates data from 5+ stores in real-time to save you the most money.
          </motion.p>
        </motion.header>

        {/* Statistical Summary Cards */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
          className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mb-20"
        >
          <motion.div 
             variants={itemVariants} 
             whileHover={{ scale: 1.03, rotate: -1 }}
             className="bg-indigo-600 p-8 rounded-[2.5rem] shadow-2xl text-white relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-6 opacity-10">
               <FaPiggyBank className="h-28 w-28" />
            </div>
            <h3 className="text-xl font-black mb-1 opacity-80 uppercase tracking-widest text-indigo-100">Total Savings</h3>
            <p className="text-5xl font-black tracking-tighter">₹150 <span className="text-2xl font-light opacity-60">+</span></p>
            <div className="mt-8 flex items-center text-sm font-black bg-white/10 w-max px-4 py-1.5 rounded-full border border-white/20">
               Real-time value
            </div>
          </motion.div>

          <motion.div 
             variants={itemVariants} 
             whileHover={{ scale: 1.03, rotate: 1 }}
             className="bg-emerald-500 p-8 rounded-[2.5rem] shadow-2xl text-white relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-6 opacity-10">
               <FaBoxOpen className="h-28 w-28" />
            </div>
            <h3 className="text-xl font-black mb-1 opacity-80 uppercase tracking-widest text-emerald-100">Orders Optimized</h3>
            <p className="text-5xl font-black tracking-tighter">12 <span className="text-2xl font-light opacity-60">Trips</span></p>
            <div className="mt-8 flex items-center text-sm font-black bg-white/10 w-max px-4 py-1.5 rounded-full border border-white/20">
               Total successful shops
            </div>
          </motion.div>

          <motion.div 
             variants={itemVariants} 
             whileHover={{ scale: 1.03, rotate: -1 }}
             className="bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl text-white relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-6 opacity-10">
               <FaWallet className="h-28 w-28" />
            </div>
            <h3 className="text-xl font-black mb-1 opacity-80 uppercase tracking-widest text-slate-400">Monthly Budget</h3>
            <p className="text-5xl font-black tracking-tighter">₹5,000</p>
            <div className="mt-8 flex items-center text-sm font-black bg-white/10 w-max px-4 py-1.5 rounded-full border border-white/20">
               Limit tracker
            </div>
          </motion.div>
        </motion.div>

        {/* Navigation Action Map */}
        <motion.main 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
          className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10"
        >
          <motion.div variants={itemVariants}>
            <Link to="/cart" className="group block bg-white p-10 rounded-[3rem] shadow-xl shadow-gray-200/50 border border-gray-100 hover:border-indigo-300 transition-all text-left h-full relative overflow-hidden">
              <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:scale-125 transition-transform duration-1000">
                 <FaShoppingCart className="h-40 w-40 text-indigo-900" />
              </div>
              <div className="h-16 w-16 bg-indigo-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-indigo-100 mb-8 transform group-hover:scale-110 group-hover:rotate-12 transition-all">
                <FaShoppingCart className="h-8 w-8" />
              </div>
              <h3 className="text-3xl font-black text-gray-900 mb-4 tracking-tighter capitalize">Manage Shopping List</h3>
              <p className="text-gray-500 font-medium text-lg leading-relaxed mb-8">Add staples and let the AI find the absolute cheapest combination across stores.</p>
              <div className="flex items-center text-indigo-600 font-black text-lg">
                 Go to Cart <span className="ml-3 group-hover:translate-x-3 transition-transform text-2xl font-light">→</span>
              </div>
            </Link>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Link to="/results" className="group block bg-white p-10 rounded-[3rem] shadow-xl shadow-gray-200/50 border border-gray-100 hover:border-emerald-300 transition-all text-left h-full relative overflow-hidden">
              <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:scale-125 transition-transform duration-1000">
                 <FaChartBar className="h-40 w-40 text-emerald-900" />
              </div>
              <div className="h-16 w-16 bg-emerald-500 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-emerald-100 mb-8 transform group-hover:scale-110 group-hover:rotate-12 transition-all">
                <FaChartBar className="h-8 w-8" />
              </div>
              <h3 className="text-3xl font-black text-gray-900 mb-4 tracking-tighter capitalize">Compare & Save</h3>
              <p className="text-gray-500 font-medium text-lg leading-relaxed mb-8">View the optimized results of your current cart with AI-driven grocery wisdom.</p>
              <div className="flex items-center text-emerald-600 font-black text-lg">
                 Analyze Results <span className="ml-3 group-hover:translate-x-3 transition-transform text-2xl font-light">→</span>
              </div>
            </Link>
          </motion.div>
        </motion.main>

        <motion.section 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="max-w-7xl mx-auto mt-20"
        >
           <div className="bg-white rounded-[3rem] p-12 shadow-inner border shadow-gray-100/50 text-center flex flex-col items-center group">
              <motion.div 
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 3 }}
                className="h-16 w-16 bg-white shadow-xl rounded-2xl flex items-center justify-center text-indigo-600 mb-6 group-hover:rotate-180 transition-transform duration-1000"
              >
                 <FaMagic className="h-8 w-8" />
              </motion.div>
              <p className="text-gray-400 font-black italic text-xl tracking-tight leading-relaxed max-w-sm">SmartCart AI is scanning the market for your groceries...</p>
           </div>
        </motion.section>
      </div>
    </>
  );
};

export default Dashboard;
