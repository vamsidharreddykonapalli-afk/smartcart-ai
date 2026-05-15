import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaSearch, FaFire, FaShoppingCart, FaSpinner, FaArrowLeft } from 'react-icons/fa';
import axios from 'axios';

const HotDeals = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const { data } = await axios.get(`${process.env.REACT_APP_API_URL || "http://localhost:5000/api"}/products/hot-deals`);
        setDeals(data);
      } catch (error) {
        console.error("Error fetching deals", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDeals();
  }, []);

  const filteredDeals = deals.filter(deal =>
    deal.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in-up">
      {/* Page-level Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors mb-6 group"
      >
        <FaArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" />
        Back to previous page
      </button>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center">
            <FaFire className="text-orange-500 mr-2" /> Hot Deals
          </h1>
          <p className="text-slate-500 mt-2 font-medium">Discover the best limited-time price drops across all stores right now.</p>
        </div>

        {/* Search Bar for Hot Deals */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search deals..."
            className="w-full pl-10 pr-4 py-3 border-2 border-indigo-100 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all font-semibold outline-none text-slate-700 bg-white shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FaSearch className="absolute left-4 top-4 text-indigo-400" />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <FaSpinner className="animate-spin text-indigo-600 text-4xl" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDeals.map((deal) => (
            <motion.div
              key={deal.id}
              whileHover={{ y: -5, scale: 1.02 }}
              className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-6 flex flex-col relative overflow-hidden group"
            >
              {/* Discount Badge */}
              <div className="absolute top-0 right-0 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-black px-4 py-1.5 rounded-bl-2xl shadow-md">
                {deal.discount} OFF
              </div>

              <h3 className="font-black text-xl text-slate-800 mb-2 mt-4 tracking-tight leading-tight">{deal.name}</h3>

              <div className="mt-auto pt-5 border-t border-gray-50 flex justify-between items-end">
                <div>
                  <p className="text-sm text-slate-400 line-through font-bold">₹{deal.originalPrice}</p>
                  <p className="text-3xl font-black text-indigo-600 tracking-tighter">₹{deal.dealPrice}</p>
                  <p className="text-xs text-slate-500 mt-1 font-medium">Found on <span className="font-bold text-slate-800">{deal.store}</span></p>
                </div>
                <button className="bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white p-4 rounded-2xl transition-all shadow-sm group-hover:shadow-md group-hover:shadow-indigo-200">
                  <FaShoppingCart className="text-lg" />
                </button>
              </div>
            </motion.div>
          ))}
          {filteredDeals.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
              <div className="bg-slate-50 p-6 rounded-full mb-4">
                <FaSearch className="text-4xl text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-700">No deals found</h3>
              <p className="text-slate-500 font-medium mt-1">We couldn't find any hot deals matching "{searchTerm}"</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HotDeals;
