import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area 
} from "recharts";
import { motion } from "framer-motion";
import API from "../api";
import Navbar from "../components/Navbar";
import { FaWallet, FaPiggyBank, FaChartPie, FaChartLine, FaShoppingBag, FaArrowLeft } from "react-icons/fa";

const Analytics = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      const res = await API.get("/analytics");
      setData(res.data);
    } catch (err) {
      console.error("Error fetching analytics", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const COLORS = ["#4f46e5", "#10b981", "#8b5cf6", "#f59e0b", "#ef4444", "#3b82f6"];

  if (loading) {
     return <div className="flex h-screen items-center justify-center font-black text-2xl animate-pulse">Analyzing Shopping Trends...</div>;
  }

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

        <header className="max-w-7xl mx-auto mb-16">
          <h1 className="text-6xl font-black text-slate-900 tracking-tighter leading-none mb-4">
             Shopping <span className="text-indigo-600">Analytics.</span>
          </h1>
          <p className="text-xl text-slate-500 font-medium max-w-xl italic">Track your spending patterns and cumulative savings across all integrated stores.</p>
        </header>

        {/* Stats Grid */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
           <motion.div whileHover={{ scale: 1.02 }} className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100 flex items-center space-x-6">
              <div className="h-20 w-20 bg-indigo-50 rounded-[2rem] flex items-center justify-center text-indigo-600">
                 <FaWallet className="h-10 w-10" />
              </div>
              <div>
                 <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest mb-1">Total Spent</p>
                 <h2 className="text-4xl font-black text-slate-900 tracking-tighter">₹{data?.totalSpent || 0}</h2>
              </div>
           </motion.div>

           <motion.div whileHover={{ scale: 1.02 }} className="bg-emerald-500 p-10 rounded-[3rem] shadow-xl text-white flex items-center space-x-6">
              <div className="h-20 w-20 bg-white/20 rounded-[2rem] flex items-center justify-center">
                 <FaPiggyBank className="h-10 w-10" />
              </div>
              <div>
                 <p className="text-emerald-100 font-black uppercase text-[10px] tracking-widest mb-1">Total Saved</p>
                 <h2 className="text-4xl font-black tracking-tighter">₹{data?.totalSaved || 0}</h2>
              </div>
           </motion.div>

           <motion.div whileHover={{ scale: 1.02 }} className="bg-slate-900 p-10 rounded-[3rem] shadow-xl text-white flex items-center space-x-6">
              <div className="h-20 w-20 bg-white/10 rounded-[2rem] flex items-center justify-center text-indigo-400">
                 <FaShoppingBag className="h-10 w-10" />
              </div>
              <div>
                 <p className="text-slate-500 font-black uppercase text-[10px] tracking-widest mb-1">Total Orders</p>
                 <h2 className="text-4xl font-black tracking-tighter">{data?.orderCount || 0}</h2>
              </div>
           </motion.div>
        </div>

        <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
           {/* Spending Trend Chart */}
           <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100">
              <h3 className="text-2xl font-black text-slate-900 mb-10 tracking-tighter flex items-center uppercase italic">
                 <FaChartLine className="mr-3 text-indigo-600" /> Recent Spending Trend
              </h3>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data?.spendingTrend}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontWeight: 600, fontSize: 12 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontWeight: 600, fontSize: 12 }} dx={-10} />
                    <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="spent" fill="#4f46e5" radius={[10, 10, 10, 10]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
           </motion.div>

           {/* Category Distribution Chart */}
           <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100">
              <h3 className="text-2xl font-black text-slate-900 mb-10 tracking-tighter flex items-center uppercase italic">
                 <FaChartPie className="mr-3 text-emerald-500" /> Category Distribution
              </h3>
              <div className="h-80 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data?.categoryDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={120}
                      paddingAngle={8}
                      dataKey="value"
                    >
                      {data?.categoryDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
           </motion.div>
        </main>
      </div>
    </>
  );
};

export default Analytics;
