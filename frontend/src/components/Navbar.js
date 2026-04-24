import React, { useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { FaHome, FaShoppingCart, FaChartBar, FaSignOutAlt, FaBolt, FaFire, FaBell, FaGift } from "react-icons/fa";
import { AuthContext } from "../context/AuthContext";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useContext(AuthContext);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const isLandingPage = location.pathname === "/";

  const appLinks = [
    { name: "Dashboard", path: "/dashboard", icon: FaHome },
    { name: "Analytics", path: "/analytics", icon: FaChartBar },
    { name: "My Cart", path: "/cart", icon: FaShoppingCart },
    { name: "Optimized Results", path: "/results", icon: FaBolt },
    { name: "Price Insights", path: "/price-insights", icon: FaChartBar },
    { name: "Hot Deals", path: "/hot-deals", icon: FaFire },
    { name: "Price Alert", path: "/price-alert", icon: FaBell },
    { name: "Gift Cards", path: "/gift-cards", icon: FaGift },
  ];

  const landingLinks = [
    { name: "Features", path: "/#features" },
    { name: "Pricing", path: "/#pricing" },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 backdrop-blur-md bg-white/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          {/* Logo Section */}
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center space-x-3 group">
              <motion.div 
                whileHover={{ rotate: 15 }}
                className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-200 flex items-center justify-center text-white"
              >
                <FaBolt className="h-6 w-6" />
              </motion.div>
              <h1 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-indigo-800 tracking-tighter">
                SmartCart<span className="font-light text-indigo-400">AI</span>
              </h1>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden sm:flex sm:items-center sm:space-x-4">
            {!user ? (
              <>
                {landingLinks.map((link) => (
                  <a
                    key={link.path}
                    href={link.path}
                    className="px-4 py-2 text-sm font-black text-slate-500 hover:text-indigo-600 transition-colors uppercase tracking-widest leading-none"
                  >
                    {link.name}
                  </a>
                ))}
                <div className="h-8 w-px bg-gray-100 mx-4" />
                <Link to="/login" className="px-4 py-2 text-sm font-black text-slate-900 hover:text-indigo-600 transition-colors uppercase tracking-widest leading-none">
                  Login
                </Link>
                <motion.div
                   whileHover={{ scale: 1.05 }}
                   whileTap={{ scale: 0.95 }}
                >
                  <Link to="/register" className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-indigo-200 transition-all">
                    Get Started
                  </Link>
                </motion.div>
              </>
            ) : (
              <>
                {appLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className="relative"
                  >
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-black transition-all ${
                        isActive(link.path)
                          ? "text-indigo-600 bg-indigo-50"
                          : "text-gray-500 hover:text-indigo-500 hover:bg-gray-50"
                      }`}
                    >
                      <link.icon className="h-4 w-4" />
                      <span>{link.name}</span>
                    </motion.div>
                    {isActive(link.path) && (
                      <motion.div 
                        layoutId="underline" 
                        className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded-full"
                      />
                    )}
                  </Link>
                ))}

                <div className="h-8 w-px bg-gray-100 mx-4" />

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-5 py-2.5 rounded-2xl text-sm font-black text-white bg-red-500 hover:bg-red-600 shadow-lg shadow-red-100 transition-all font-sans"
                >
                  <FaSignOutAlt className="h-4 w-4" />
                  <span>Sign Out</span>
                </motion.button>
              </>
            )}
          </div>

          {/* Mobile menu toggle */}
          <div className="flex sm:hidden items-center">
             {/* Small screen toggle would go here */}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
