import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import API from "../api";
import Navbar from "../components/Navbar";
import { 
  FaStore, 
  FaMagic, 
  FaChartLine, 
  FaArrowLeft, 
  FaRobot, 
  FaTag, 
  FaPiggyBank, 
  FaCheckCircle,
  FaExclamationCircle 
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Results = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [ai, setAI] = useState("");
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);

  const fetchResults = async () => {
    try {
      const res = await API.get("/optimize");
      setData(res.data);
      
      const aiRes = await API.get("/ai");
      setAI(aiRes.data.suggestions);
    } catch (err) {
      console.error("Error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  const handleCheckout = async () => {
    setCheckingOut(true);
    try {
      const allItems = data.stores.flatMap(store => 
        store.items.map(item => ({
          ...item,
          store: store.store
        }))
      );

      await API.post("/orders/checkout", {
        items: allItems,
        totalCost: data.totalCost,
        savings: data.savings
      });

      alert("Trip finalized! Check your Analytics Dashboard.");
      navigate("/analytics");
    } catch (err) {
      console.error("Checkout failed", err);
      alert("Error saving your trip history.");
    } finally {
      setCheckingOut(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.15 } 
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: "easeOut" } }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-50 space-y-6">
        <motion.div 
          animate={{ rotate: 360, scale: [1, 1.2, 1] }} 
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-indigo-600"
        >
          <FaMagic className="h-16 w-16" />
        </motion.div>
        <p className="text-xl font-black text-gray-900 tracking-tighter animate-pulse">Running AI Price Comparison Engine...</p>
      </div>
    );
  }

  if (!data) return <p className="text-center mt-20">No data found.</p>;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-slate-50 pb-20 font-sans transition-all overflow-x-hidden">
        {/* Header Summary Section */}
        <motion.header 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-indigo-600 text-white pt-20 pb-40 px-6 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 opacity-10">
             <FaChartLine className="h-[600px] w-full" />
          </div>
          <div className="relative z-10 max-w-4xl mx-auto">
            <motion.h1 
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-6xl font-black tracking-tighter sm:text-7xl leading-tight"
            >
              Savings <span className="text-indigo-300">Optimized.</span>
            </motion.h1>
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-6 text-xl text-indigo-100 font-medium max-w-2xl mx-auto border-t border-white/20 pt-6"
            >
              We've scanned the market and found the cheapest store for every item in your cart.
            </motion.p>
          </div>
        </motion.header>

        {/* Impact Cards */}
        <div className="max-w-6xl mx-auto -mt-24 px-6 grid grid-cols-1 md:grid-cols-2 gap-8 relative z-20">
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white p-10 rounded-[3rem] shadow-2xl border border-indigo-50 flex items-center justify-between group"
          >
            <div>
              <p className="text-sm font-black text-indigo-600 uppercase tracking-widest mb-1 flex items-center">
                <FaMagic className="mr-2" /> Optimized Total
              </p>
              <h2 className="text-5xl font-black text-gray-900 tracking-tighter">₹{data.totalCost}</h2>
            </div>
            <div className="h-16 w-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shadow-inner group-hover:scale-110 transition-transform">
               <FaTag className="h-8 w-8" />
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-emerald-500 p-10 rounded-[3rem] shadow-2xl text-white flex items-center justify-between group overflow-hidden"
          >
            <div className="absolute right-0 bottom-0 opacity-10 group-hover:scale-150 transition-transform duration-1000">
               <FaPiggyBank className="h-40 w-40" />
            </div>
            <div className="relative z-10">
              <p className="text-sm font-black text-emerald-100 uppercase tracking-widest mb-1 flex items-center">
                <FaMagic className="mr-2" /> Market Savings
              </p>
              <h2 className="text-5xl font-black tracking-tighter">₹{data.savings}</h2>
            </div>
            <div className="h-16 w-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white shadow-xl relative z-10 group-hover:scale-110 transition-transform">
               <FaPiggyBank className="h-8 w-8" />
            </div>
          </motion.div>
        </div>

        {/* Store Breakdown Section */}
        <main className="max-w-6xl mx-auto mt-16 px-6">
          <h3 className="text-3xl font-black text-gray-900 mb-10 tracking-tighter flex items-center">
            Storewise <span className="text-indigo-600 ml-3">Breakdown</span>
          </h3>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20"
          >
            {data.stores.map((store, i) => (
              <motion.div
                key={store.store}
                variants={cardVariants}
                whileHover={{ scale: 1.02 }}
                className="bg-white p-10 rounded-[3rem] shadow-xl border border-gray-100 relative group overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-125 transition-transform duration-700">
                   <FaStore className="h-32 w-32" />
                </div>
                <div className="flex items-center space-x-4 mb-8">
                  <div className="h-14 w-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shadow-inner group-hover:rotate-12 transition-transform">
                    <FaStore className="h-7 w-7" />
                  </div>
                  <div>
                    <h4 className="text-2xl font-black text-gray-900 tracking-tight uppercase">{store.store}</h4>
                    <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">Store Recommendation</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {store.items.map((item, j) => (
                    <motion.div 
                      key={j} 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + j * 0.1 }}
                      className="flex justify-between items-center p-5 bg-gray-50/50 rounded-2xl border border-gray-100 group/item hover:bg-white transition-colors"
                    >
                      <span className="font-extrabold text-gray-800 text-lg group-hover/item:text-indigo-600 transition-colors uppercase tracking-tight">{item.productName}</span>
                      <div className="text-right">
                        <span className="block text-xl font-black text-gray-900">₹{item.price}</span>
                        <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Qty: {item.quantity}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Smart AI Suggestions */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-12 rounded-[4rem] shadow-[0_30px_60px_-15px_rgba(30,41,59,0.3)] relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-12 opacity-5 animate-pulse">
               <FaMagic className="h-64 w-64" />
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center space-x-4 mb-8">
                <div className="h-16 w-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-white border border-white/20 shadow-2xl animate-bounce">
                  <FaRobot className="h-9 w-9" />
                </div>
                <div>
                  <h3 className="text-3xl font-black tracking-tighter">Smart AI Insights</h3>
                  <p className="text-indigo-300 font-bold uppercase text-[10px] tracking-[0.3em]">Neural Recommendation Engine</p>
                </div>
              </div>

              <div className="prose prose-invert max-w-none">
                <blockquote className="border-l-4 border-indigo-400 pl-8 py-2">
                  <p className="text-2xl font-black leading-relaxed italic text-indigo-50">
                    "{ai}"
                  </p>
                </blockquote>
              </div>
            </div>
          </motion.div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 mt-20">
            <Link to="/cart" className="flex items-center space-x-3 px-10 py-5 bg-white border border-gray-200 rounded-[2rem] font-black text-gray-900 hover:bg-gray-50 transition-all hover:-translate-y-1 shadow-lg">
              <FaArrowLeft />
              <span>Modify Cart</span>
            </Link>
            
            <button 
              onClick={handleCheckout}
              disabled={checkingOut}
              className="flex items-center space-x-3 px-12 py-5 bg-indigo-600 text-white rounded-[2rem] font-black hover:bg-indigo-700 transition-all hover:-translate-y-1 shadow-2xl shadow-indigo-100 group disabled:opacity-50"
            >
              <FaCheckCircle className={checkingOut ? "animate-spin" : "group-hover:scale-110"} />
              <span>{checkingOut ? "Finalizing..." : "Complete Shop"}</span>
            </button>
          </div>
        </main>
      </div>
    </>
  );
};

export default Results;
