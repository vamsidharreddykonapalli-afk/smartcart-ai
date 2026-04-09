import React from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Features from "../components/Features";
import Footer from "../components/Footer";
import { motion } from "framer-motion";

const Home = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="min-h-screen font-sans"
    >
      <Navbar />
      <main>
        <Hero />
        <Features />
        {/* Additional sections like Testimonials or Pricing can be added here */}
      </main>
      <Footer />
    </motion.div>
  );
};

export default Home;
