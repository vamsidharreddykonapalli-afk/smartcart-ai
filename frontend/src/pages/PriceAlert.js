import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBell, FaArrowLeft, FaPlus, FaTrashAlt, FaTag } from 'react-icons/fa';
import Navbar from '../components/Navbar';

const PriceAlert = () => {
  const navigate = useNavigate();
  const [productName, setProductName] = useState('');
  const [targetPrice, setTargetPrice] = useState('');
  const [alerts, setAlerts] = useState([
    { id: 1, product: 'Aashirvaad Atta (5kg)', target: 200, current: 240, status: 'watching' },
    { id: 2, product: 'Red Label Tea (1kg)', target: 350, current: 380, status: 'watching' },
    { id: 3, product: 'Maggi Noodles (Pack of 4)', target: 40, current: 38, status: 'reached' }
  ]);

  const handleAddAlert = (e) => {
    e.preventDefault();
    if (productName && targetPrice) {
      const newAlert = {
        id: Date.now(),
        product: productName,
        target: parseInt(targetPrice),
        current: parseInt(targetPrice) + Math.floor(Math.random() * 50) + 10, // Mock current price higher than target
        status: 'watching'
      };
      setAlerts([newAlert, ...alerts]);
      setProductName('');
      setTargetPrice('');
    }
  };

  const removeAlert = (id) => {
    setAlerts(alerts.filter(a => a.id !== id));
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-slate-50 p-6 sm:p-12 font-sans overflow-x-hidden">
        <div className="max-w-4xl mx-auto">
          {/* Page-level Back Button */}
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors mb-6 group"
          >
            <FaArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to previous page
          </button>
          
          <header className="mb-12">
            <h1 className="text-5xl font-black text-slate-900 tracking-tighter flex items-center mb-4">
              <span className="bg-indigo-600 text-white p-3 rounded-2xl mr-4 shadow-lg shadow-indigo-200">
                <FaBell className="h-8 w-8" />
              </span>
              Price <span className="text-indigo-600 ml-3">Alerts</span>
            </h1>
            <p className="text-slate-500 text-lg font-medium italic">Never miss a deal. We'll notify you when items drop below your target price.</p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Add Alert Form */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="md:col-span-1 bg-white p-8 rounded-[2rem] shadow-xl border border-gray-100 h-fit"
            >
              <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center">
                Create Alert <FaPlus className="ml-2 text-indigo-500 text-sm" />
              </h2>
              <form onSubmit={handleAddAlert} className="space-y-5">
                <div>
                  <label className="block text-[10px] uppercase font-black tracking-widest text-slate-400 mb-2">Product Name</label>
                  <input 
                    type="text" 
                    required
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="e.g. Greek Yogurt" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold placeholder-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-black tracking-widest text-slate-400 mb-2">Target Price (₹)</label>
                  <input 
                    type="number" 
                    required
                    min="1"
                    value={targetPrice}
                    onChange={(e) => setTargetPrice(e.target.value)}
                    placeholder="e.g. 150" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold placeholder-slate-300"
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-xl transition-colors shadow-lg shadow-indigo-100 mt-2"
                >
                  Set Alert
                </button>
              </form>
            </motion.div>

            {/* Active Alerts List */}
            <div className="md:col-span-2 space-y-4">
              <AnimatePresence>
                {alerts.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="bg-white p-12 rounded-[2rem] border border-dashed border-gray-300 text-center flex flex-col items-center justify-center text-slate-400"
                  >
                    <FaBell className="h-12 w-12 text-slate-200 mb-4" />
                    <h3 className="text-xl font-bold text-slate-600">No active alerts</h3>
                    <p>Add some products to watch for price drops.</p>
                  </motion.div>
                ) : (
                  alerts.map(alert => (
                    <motion.div 
                      key={alert.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      whileHover={{ scale: 1.02 }}
                      className="bg-white p-6 rounded-[2rem] shadow-md border border-gray-50 flex flex-col sm:flex-row justify-between items-center gap-4 group"
                    >
                      <div className="flex items-center space-x-4 w-full">
                        <div className={`h-12 w-12 rounded-xl flex items-center justify-center text-xl font-black ${alert.status === 'reached' ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-50 text-orange-500'}`}>
                          {alert.status === 'reached' ? '✓' : <FaTag />}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-black text-lg text-slate-800">{alert.product}</h3>
                          <div className="flex items-center text-sm font-bold mt-1">
                            <span className="text-slate-400 mr-4">Current: ₹{alert.current}</span>
                            <span className="text-indigo-600">Target: ₹{alert.target}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 w-full sm:w-auto justify-end">
                        {alert.status === 'reached' && (
                          <span className="px-3 py-1 bg-emerald-500 text-white text-[10px] uppercase font-black tracking-widest rounded-full animate-bounce">
                            Target Hit!
                          </span>
                        )}
                        <button 
                          onClick={() => removeAlert(alert.id)}
                          className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        >
                          <FaTrashAlt />
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PriceAlert;
