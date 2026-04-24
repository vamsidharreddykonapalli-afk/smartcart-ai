import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import API from "../api";
import Navbar from "../components/Navbar";
import { 
  FaPlus, 
  FaTrashAlt, 
  FaShoppingCart, 
  FaArrowRight, 
  FaShoppingBasket,
  FaTag,
  FaArrowCircleRight,
  FaArrowLeft
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";

const Cart = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [productName, setProductName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchCart = async () => {
    try {
      const res = await API.get("/cart");
      setItems(res.data.items);
    } catch (err) {
      console.error("Error fetching cart", err);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const addItem = async (e) => {
    e.preventDefault();
    if (!productName) return;
    setLoading(true);
    try {
      await API.post("/cart/add", { productName, quantity });
      setProductName("");
      setQuantity(1);
      fetchCart();
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        alert(err.response.data.message);
      } else {
        console.error("Error adding item", err);
      }
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async (name) => {
    try {
      await API.delete("/cart/delete", {
        data: { productName: name },
      });
      fetchCart();
    } catch (err) {
      console.error("Error deleting item", err);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-slate-50 font-sans pb-20 overflow-x-hidden">
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border-b border-gray-100 py-12 mb-10 shadow-sm"
        >
          <div className="max-w-7xl mx-auto px-6 mb-4">
            {/* Page-level Back Button */}
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors group"
            >
              <FaArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to previous page
            </button>
          </div>
          <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                 <div className="bg-indigo-600 p-1 rounded-md text-white">
                    <FaShoppingCart className="h-4 w-4" />
                 </div>
                 <span className="text-indigo-600 font-black text-xs uppercase tracking-widest">Cart Management</span>
              </div>
              <h1 className="text-5xl font-black text-gray-900 tracking-tighter flex items-center">
                My Shopping <span className="text-indigo-600 ml-3">List</span>
              </h1>
              <p className="mt-3 text-gray-500 font-medium text-lg italic">You currently have {items?.length || 0} optimized items.</p>
            </div>
            {items?.length > 0 && (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link to="/results" className="flex items-center space-x-3 bg-indigo-600 text-white px-8 py-4 rounded-[2rem] font-black transition-all hover:bg-indigo-700 shadow-2xl shadow-indigo-100 uppercase tracking-widest text-sm">
                  <span>Optimize Now</span>
                  <FaArrowCircleRight className="h-5 w-5" />
                </Link>
              </motion.div>
            )}
          </div>
        </motion.header>

        <main className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Add Item Form Section */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="bg-slate-900 p-10 rounded-[3rem] shadow-2xl text-white sticky top-28">
              <h2 className="text-3xl font-black mb-8 tracking-tighter flex items-center">
                 Quick Add <FaPlus className="ml-3 h-5 w-5 text-indigo-400" />
              </h2>
              <form onSubmit={addItem} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3">Product Name</label>
                  <div className="relative">
                    <FaTag className="absolute left-4 top-4.5 h-4 w-4 text-slate-500" />
                    <input
                      placeholder="e.g. Greek Yogurt"
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-bold"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-2xl py-4 px-6 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-bold"
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 text-white py-5 rounded-[2rem] font-black text-xl shadow-xl hover:bg-indigo-500 transition-all disabled:opacity-50 mt-4"
                >
                  {loading ? "Adding..." : "Add to List"}
                </motion.button>
              </form>
            </div>
          </motion.div>

          {/* Cart List Section */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-[3.5rem] shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden font-medium min-h-[500px]">
              <div className="p-10 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                <h3 className="text-xl font-black text-gray-900 tracking-tight flex items-center">
                   Items to Compare <span className="ml-3 px-3 py-1 bg-indigo-100 text-indigo-600 text-[10px] font-black uppercase rounded-full">{items?.length || 0}</span>
                </h3>
              </div>
              
              <AnimatePresence mode="popLayout">
                {!items || items.length === 0 ? (
                  <motion.div 
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-20 flex flex-col items-center justify-center text-center h-full"
                  >
                    <div className="h-28 w-28 bg-slate-50 rounded-[2rem] flex items-center justify-center text-gray-200 mb-8 border border-gray-100 transition-transform hover:rotate-12">
                       <FaShoppingBasket className="h-14 w-14" />
                    </div>
                    <h3 className="text-3xl font-black text-gray-900 mb-3 tracking-tighter">List Is Empty</h3>
                    <p className="text-gray-400 font-bold max-w-sm leading-relaxed">Add high-quality products to start seeing store comparison data and massive savings.</p>
                  </motion.div>
                ) : (
                  <ul className="divide-y divide-gray-50">
                    {items.map((item, i) => (
                      <motion.li 
                        key={item.productName}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, x: -100 }}
                        whileHover={{ backgroundColor: "rgba(249, 250, 251, 0.5)" }}
                        className="flex justify-between items-center p-8 transition-colors group"
                      >
                        <div className="flex items-center space-x-6">
                          <div className="h-16 w-16 bg-indigo-50 rounded-3xl flex items-center justify-center text-indigo-600 font-black text-2xl shadow-inner group-hover:scale-110 transition-transform">
                             {i + 1}
                          </div>
                          <div>
                            <p className="text-2xl font-black text-gray-900 tracking-tighter group-hover:text-indigo-600 transition-colors uppercase leading-none mb-2">{item.productName}</p>
                            <div className="flex items-center text-gray-400 text-sm font-bold uppercase tracking-widest">
                               <span className="mr-2">Quantity</span>
                               <span className="px-2 py-0.5 bg-gray-100 rounded text-gray-800 font-black">{item.quantity}</span>
                            </div>
                          </div>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.1, rotate: 10 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => deleteItem(item.productName)}
                          className="p-4 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-sm border border-red-100"
                        >
                          <FaTrashAlt className="h-5 w-5" />
                        </motion.button>
                      </motion.li>
                    ))}
                  </ul>
                )}
              </AnimatePresence>
            </div>
            
            {items?.length > 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-12 sm:hidden px-4"
              >
                <Link to="/results" className="flex items-center justify-center space-x-4 bg-indigo-600 text-white px-6 py-6 rounded-[2.5rem] font-black transition-all hover:bg-indigo-700 shadow-2xl shadow-indigo-100 uppercase tracking-widest">
                  <span>Start Optimization</span>
                  <FaArrowCircleRight className="h-6 w-6" />
                </Link>
              </motion.div>
            )}
          </motion.div>
        </main>
      </div>
    </>
  );
};

export default Cart;
