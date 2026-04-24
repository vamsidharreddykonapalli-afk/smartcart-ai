import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaGift, FaArrowLeft, FaShoppingCart } from 'react-icons/fa';
import Navbar from '../components/Navbar';

const giftCards = [
  { id: 1, brand: 'Amazon', value: 500, price: 475, discount: '5%', color: 'from-orange-400 to-yellow-500' },
  { id: 2, brand: 'Swiggy', value: 200, price: 180, discount: '10%', color: 'from-orange-500 to-red-500' },
  { id: 3, brand: 'BigBasket', value: 1000, price: 920, discount: '8%', color: 'from-emerald-400 to-green-600' },
  { id: 4, brand: 'Blinkit', value: 300, price: 285, discount: '5%', color: 'from-amber-300 to-orange-400' },
  { id: 5, brand: 'Myntra', value: 1500, price: 1350, discount: '10%', color: 'from-pink-500 to-rose-600' },
  { id: 6, brand: 'Uber', value: 500, price: 460, discount: '8%', color: 'from-slate-800 to-black' },
];

const GiftCards = () => {
  const navigate = useNavigate();

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
          
          <header className="mb-12">
            <h1 className="text-5xl font-black text-slate-900 tracking-tighter flex items-center mb-4">
              <span className="bg-indigo-600 text-white p-3 rounded-2xl mr-4 shadow-lg shadow-indigo-200">
                <FaGift className="h-8 w-8" />
              </span>
              Gift <span className="text-indigo-600 ml-3">Cards</span>
            </h1>
            <p className="text-slate-500 text-lg font-medium italic">Buy discounted digital gift cards for your favorite stores and save instantly at checkout.</p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {giftCards.map((card, index) => (
              <motion.div 
                key={card.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-gray-100 flex flex-col group overflow-hidden relative"
              >
                <div className={`h-40 w-full rounded-[2rem] bg-gradient-to-br ${card.color} flex items-center justify-center relative overflow-hidden mb-6 shadow-inner`}>
                  <div className="absolute inset-0 bg-black/10 mix-blend-overlay"></div>
                  <h2 className="text-4xl font-black text-white mix-blend-overlay opacity-50 absolute -right-6 -bottom-4 italic">{card.brand}</h2>
                  <span className="text-white text-3xl font-black z-10 tracking-widest uppercase">{card.brand}</span>
                  <div className="absolute top-4 left-4 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-black tracking-widest">
                    ₹{card.value}
                  </div>
                </div>

                <div className="flex-1 flex flex-col px-2">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Pay Only</p>
                      <h3 className="text-3xl font-black text-slate-800">₹{card.price}</h3>
                    </div>
                    <div className="bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-xl font-bold text-sm border border-emerald-100">
                      Save {card.discount}
                    </div>
                  </div>
                  
                  <button className="mt-auto w-full bg-slate-900 group-hover:bg-indigo-600 text-white font-black py-4 rounded-2xl flex items-center justify-center transition-colors shadow-lg shadow-indigo-100/0 group-hover:shadow-indigo-200">
                    <FaShoppingCart className="mr-2" /> Buy Now
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default GiftCards;
