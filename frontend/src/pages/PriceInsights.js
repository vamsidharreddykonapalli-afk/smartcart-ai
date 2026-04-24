import React, { useState, useEffect } from "react";
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceArea, Line, ComposedChart 
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { FaSearch, FaStore, FaHistory, FaCheckCircle, FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import API from "../api";
import Navbar from "../components/Navbar";

const PriceInsights = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("Milk");
  const [historyData, setHistoryData] = useState([]);
  const [comparisonData, setComparisonData] = useState([]);
  const [productName, setProductName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchData = async (term) => {
    setLoading(true);
    setError("");
    try {
      // 1. Fetch Price Comparison
      const compRes = await API.get(`/products/compare/${term}`);
      setComparisonData(compRes.data.comparisons);
      setProductName(compRes.data.productName);

      // 2. Fetch Price History
      const histRes = await API.get(`/analytics/price-history/${term}`);
      const history = histRes.data.history;

      // 3. Fetch Price Predictions
      const predRes = await API.get(`/analytics/price-prediction/${term}`);
      const predictions = predRes.data.predictions;

      // Combine for Chart
      setHistoryData([...history, ...predictions]);

    } catch (err) {
      console.error("Error fetching price insights", err);
      setError("Product not found or data unavailable. Try 'Milk', 'Banana', or 'Tomato'.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData("Milk");
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      fetchData(searchTerm);
    }
  };

  const STORES = ["BigBasket", "Zepto", "Blinkit", "Instamart", "JioMart", "Swiggy", "Amazon Fresh"];
  const STORE_COLORS = {
    "BigBasket": "#4f46e5",
    "Zepto": "#10b981",
    "Blinkit": "#f59e0b",
    "Instamart": "#ef4444",
    "JioMart": "#3b82f6",
    "Swiggy": "#8b5cf6",
    "Amazon Fresh": "#ec4899"
  };

  const getCheapestStore = () => {
    if (!comparisonData.length) return null;
    return comparisonData.reduce((min, p) => p.price < min.price ? p : min, comparisonData[0]);
  };

  const cheapest = getCheapestStore();

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-slate-50 p-6 sm:p-12 font-sans overflow-x-hidden">
        <div className="max-w-7xl mx-auto">
          {/* Page-level Back Button */}
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors mb-6 group"
          >
            <FaArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to previous page
          </button>
        </div>
        <header className="max-w-7xl mx-auto mb-12">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-6xl font-black text-slate-900 tracking-tighter leading-none mb-4"
          >
             Price <span className="text-indigo-600">Insights.</span>
          </motion.h1>
          <p className="text-xl text-slate-500 font-medium max-w-xl italic">
            Compare real-time market prices and track historical trends across all major stores.
          </p>
        </header>

        {/* Search Section */}
        <div className="max-w-7xl mx-auto mb-12">
          <form onSubmit={handleSearch} className="relative max-w-2xl">
            <input 
              type="text"
              placeholder="Search product (e.g. Milk, Banana)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white px-8 py-6 rounded-[2rem] shadow-2xl border-none text-xl font-bold text-slate-800 placeholder-slate-300 focus:ring-4 focus:ring-indigo-100 transition-all"
            />
            <button 
              type="submit"
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-indigo-600 text-white p-4 rounded-2xl shadow-lg hover:scale-105 transition-transform"
            >
              <FaSearch className="h-6 w-6" />
            </button>
          </form>
          {error && <p className="mt-4 text-red-500 font-bold ml-4">{error}</p>}
        </div>

        {loading ? (
          <div className="max-w-7xl mx-auto flex h-64 items-center justify-center font-black text-2xl animate-pulse text-indigo-600">
            Fetching Market Intelligence...
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {productName && (
              <motion.div 
                key={productName}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-7xl mx-auto space-y-12"
              >
                {/* Active Product Banner */}
                <div className="bg-indigo-600 rounded-[3rem] p-10 text-white shadow-2xl flex flex-col md:flex-row justify-between items-center relative overflow-hidden">
                   <div className="relative z-10">
                      <p className="text-indigo-200 font-black uppercase text-xs tracking-widest mb-2">Currently Analyzing</p>
                      <h2 className="text-5xl font-black tracking-tighter">{productName}</h2>
                   </div>
                   {cheapest && (
                     <div className="mt-6 md:mt-0 bg-white/20 backdrop-blur-md rounded-[2rem] p-6 text-center border border-white/30 relative z-10">
                        <p className="text-indigo-100 font-black uppercase text-[10px] tracking-widest mb-1">Best Price Found</p>
                        <h3 className="text-4xl font-black tracking-tighter">₹{cheapest.price}</h3>
                        <p className="text-sm font-bold flex items-center justify-center mt-1">
                          at {cheapest.store} <FaCheckCircle className="ml-2 text-emerald-400" />
                        </p>
                     </div>
                   )}
                   <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-white/10 rounded-full blur-3xl opacity-50" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                  {/* Trend Chart */}
                  <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100">
                    <h3 className="text-2xl font-black text-slate-900 mb-10 tracking-tighter flex items-center uppercase italic">
                       <FaHistory className="mr-3 text-indigo-600" /> Market Trends & Forecast
                    </h3>
                    <div className="h-[400px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={historyData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis 
                            dataKey="date" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: '#94a3b8', fontWeight: 600, fontSize: 12 }} 
                            dy={10} 
                          />
                          <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: '#94a3b8', fontWeight: 600, fontSize: 12 }} 
                            dx={-10} 
                          />
                          <Tooltip 
                            contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} 
                          />
                          <Legend verticalAlign="top" height={36}/>
                          
                          {/* Prediction Zone Highlighting */}
                          {historyData.some(d => d.isPrediction) && (
                            <ReferenceArea 
                              x1={historyData.find(d => d.isPrediction)?.date} 
                              x2={historyData[historyData.length - 1]?.date} 
                              fill="#f8fafc" 
                              fillOpacity={1}
                            />
                          )}
                          
                          {STORES.map((store) => (
                            <Line 
                              key={store}
                              type="monotone" 
                              dataKey={store} 
                              stroke={STORE_COLORS[store]} 
                              strokeWidth={4}
                              dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                              activeDot={{ r: 8, strokeWidth: 0 }}
                              connectNulls
                            />
                          ))}
                        </ComposedChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Market Comparison Table */}
                  <div className="bg-slate-900 p-10 rounded-[3rem] shadow-xl text-white">
                    <h3 className="text-2xl font-black mb-8 tracking-tighter flex items-center uppercase italic text-indigo-400">
                       <FaStore className="mr-3" /> Market Comparison
                    </h3>
                    <div className="space-y-4">
                      {STORES.map(store => {
                        const storePrice = comparisonData.find(p => p.store === store);
                        const isCheapest = storePrice && cheapest && storePrice.price === cheapest.price;
                        
                        return (
                          <div 
                            key={store}
                            className={`flex items-center justify-between p-4 rounded-2xl transition-all ${
                              isCheapest ? "bg-emerald-500/20 border border-emerald-500/50" : "bg-white/5 border border-white/10"
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                               <div className="h-3 w-3 rounded-full" style={{ backgroundColor: STORE_COLORS[store] }} />
                               <span className="font-bold text-sm">{store}</span>
                            </div>
                            <div className="text-right">
                               <p className="text-lg font-black tracking-tight">
                                 {storePrice ? `₹${storePrice.price}` : "N/A"}
                               </p>
                               {isCheapest && <span className="text-[10px] font-black uppercase text-emerald-400 tracking-widest">Cheapest</span>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </>
  );
};

export default PriceInsights;
