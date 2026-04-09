import React from "react";
import { motion } from "framer-motion";
import { FaShoppingCart, FaChartBar, FaMagic, FaHistory, FaBolt, FaShieldAlt } from "react-icons/fa";

const Features = () => {
  const features = [
    {
      title: "Real-time Price Engine",
      description: "We monitor prices across 5+ major grocery stores in real-time to find the best deals.",
      icon: FaBolt,
      bgColor: "bg-indigo-50",
      iconColor: "text-indigo-600",
    },
    {
      title: "Greedy Optimization",
      description: "Our algorithm finds the cheapest combination for your entire cart, not just single items.",
      icon: FaMagic,
      bgColor: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
    {
      title: "Smart AI Insights",
      description: "AI-driven advice on bulk buying, brand alternatives, and seasonal timing.",
      icon: FaChartBar,
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
    },
    {
      title: "Shopping History",
      description: "Track your monthly spend and see total lifetime savings across all platforms.",
      icon: FaHistory,
      bgColor: "bg-amber-50",
      iconColor: "text-amber-600",
    },
    {
      title: "Secure Verification",
      description: "Authenticated sessions ensure your shopping lists and preferences stay private.",
      icon: FaShieldAlt,
      bgColor: "bg-red-50",
      iconColor: "text-red-600",
    },
    {
      title: "Unified Cart",
      description: "Add items once and see them compared across BigBasket, Zepto, and more instantly.",
      icon: FaShoppingCart,
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
    },
  ];

  return (
    <section id="features" className="py-32 bg-slate-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-24">
          <h2 className="text-[10px] uppercase tracking-[0.4em] font-black text-indigo-600 mb-4 animate-pulse">
            Core Potential
          </h2>
          <h3 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none mb-6">
            Engineered for <br />
            <span className="text-indigo-600">Maximum Savings.</span>
          </h3>
          <p className="text-xl text-slate-500 font-medium max-w-xl mx-auto">
            Traditional shopping is manual. SmartCart AI is automated. Here's how we revolutionize your grocery run.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5, ease: "easeOut" }}
              whileHover={{ y: -10 }}
              className="bg-white p-10 rounded-[3rem] shadow-xl shadow-slate-100 border border-slate-100 group relative overflow-hidden h-full"
            >
              <div className={`absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-125 transition-transform duration-700`}>
                 <feature.icon className="h-32 w-32" />
              </div>

              <div className="relative z-10">
                <div className={`${feature.bgColor} ${feature.iconColor} h-16 w-16 rounded-2xl flex items-center justify-center mb-8 shadow-inner group-hover:rotate-12 transition-transform`}>
                  <feature.icon className="h-8 w-8" />
                </div>
                <h4 className="text-2xl font-black text-slate-900 mb-4 tracking-tight group-hover:text-indigo-600 transition-colors uppercase leading-none">
                  {feature.title}
                </h4>
                <p className="text-slate-500 font-bold leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
