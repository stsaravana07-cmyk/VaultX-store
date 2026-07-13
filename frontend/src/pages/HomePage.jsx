import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Zap, Award, Clock, ChevronRight, ChevronLeft, Truck, RotateCcw, Wallet, PhoneCall, Swords } from 'lucide-react';

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [banners, setBanners] = useState([]);
  const [currentBannerIdx, setCurrentBannerIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(28800); // 8 hours in seconds
  const navigate = useNavigate();

  // Fetch products, categories, and active banners
  useEffect(() => {
    const fetchData = async () => {
      try {
        const prodRes = await api.get('products/items/');
        setProducts(prodRes.data.results || prodRes.data);
        
        const catRes = await api.get('products/categories/');
        setCategories(catRes.data);

        const bannerRes = await api.get('products/banners/');
        setBanners(bannerRes.data.filter(b => b.is_active));
      } catch (error) {
        console.error('Error fetching home data:', error);
      }
    };
    fetchData();
  }, []);

  // Countdown timer for deals
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 28800));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto-rotate banners every 6 seconds
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentBannerIdx((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [banners]);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const presetImages = {
    hero_vault: '/templates/avg 2.jpg',
    avengers: '/templates/avg 2.jpg',
  };

  const getBannerImage = (banner) => {
    if (banner.banner_type === 'custom') {
      return banner.image_url || '/templates/avg 2.jpg';
    }
    return presetImages[banner.banner_type] || '/templates/avg 2.jpg';
  };

  // Framer Motion Animation Variants
  const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 25 },
    show: { 
      opacity: 1, 
      y: 0, 
      transition: { type: 'spring', stiffness: 100, damping: 15 } 
    }
  };

  return (
    <div className="bg-gradient-to-br from-[#fffdfa] via-[#f7f2ff] to-[#f0fdff] text-slate-800 min-h-screen flex flex-col font-sans pt-28 relative overflow-hidden">
      {/* Morphing Neon Background Spotlights */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-gradient-to-tr from-[#bd00ff]/20 to-[#00f0ff]/20 rounded-full blur-[120px] pointer-events-none z-0 animate-morph-slow" />
      <div className="absolute bottom-[20%] right-[-10%] w-[600px] h-[600px] bg-gradient-to-br from-[#ff0055]/15 to-[#ff8c00]/15 rounded-full blur-[120px] pointer-events-none z-0 animate-morph-slower" />
      <div className="absolute top-[40%] left-[30%] w-[450px] h-[450px] bg-gradient-to-br from-[#ffd700]/10 to-[#00f0ff]/10 rounded-full blur-[120px] pointer-events-none z-0 animate-float" />
      
      <Navbar />

      {/* Hero Banner Section */}
      <section className="relative py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full z-10">
        {banners.length > 0 ? (
          (() => {
            const activeBanner = banners[currentBannerIdx];
            return (
              <div 
                onClick={() => navigate(activeBanner.link_url)}
                className="relative rounded-3xl overflow-hidden border border-orange-550/25 shadow-[0_0_40px_rgba(255,140,0,0.15)] min-h-[400px] flex items-center p-8 md:p-16 transition-all duration-300 hover:shadow-[0_0_50px_rgba(255,140,0,0.3)] hover:scale-[1.01] hover:border-orange-550 cursor-pointer"
              >
                {/* Full Card Cover Image */}
                <img 
                  src={getBannerImage(activeBanner)} 
                  alt="Showcase Banner" 
                  className="absolute inset-0 w-full h-full object-cover object-center z-0"
                  onError={(e) => {
                    e.target.src = '/templates/avg 2.jpg';
                  }}
                />
                
                {/* Dark Vignette Overlay for maximum text readability */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/40 to-transparent z-5 pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 pointer-events-none" />

                {/* Banner Content (Absolute on top) */}
                <div className="relative max-w-xl space-y-6 z-10 text-left">
                  <motion.h1 
                    key={activeBanner.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl md:text-5.5xl font-black text-white leading-tight uppercase font-display tracking-tight text-shadow-md text-glow-orange animate-textGlow"
                  >
                    {activeBanner.title}
                  </motion.h1>
                  
                  {activeBanner.subtitle && (
                    <motion.p 
                      key={activeBanner.subtitle}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs text-slate-200 font-bold uppercase tracking-widest bg-orange-600/35 border border-orange-500/30 px-3 py-1.5 rounded-lg w-fit backdrop-blur-sm"
                    >
                      {activeBanner.subtitle}
                    </motion.p>
                  )}

                  <button
                    className="px-9 py-3.5 bg-gradient-to-r from-[#ff8c00] via-[#ff0055] to-[#bd00ff] hover:shadow-[0_0_25px_rgba(255,140,0,0.45)] text-white font-black text-xs uppercase tracking-widest rounded-full transition-all"
                  >
                    {activeBanner.button_text}
                  </button>
                </div>

                {/* Slider Controls */}
                {banners.length > 1 && (
                  <div className="absolute bottom-6 left-8 md:left-16 z-25 flex items-center gap-2">
                    {banners.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setCurrentBannerIdx(idx);
                        }}
                        className={`h-1.5 rounded-full transition-all cursor-pointer ${
                          idx === currentBannerIdx ? 'w-6 bg-orange-500' : 'w-2 bg-slate-400 hover:bg-slate-350'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })()
        ) : (
          /* Default Static Hero Banner */
          <div 
            onClick={() => navigate('/shop')}
            className="relative rounded-3xl overflow-hidden border border-orange-550/25 shadow-[0_0_40px_rgba(255,140,0,0.15)] min-h-[400px] flex items-center p-8 md:p-16 transition-all duration-300 hover:shadow-[0_0_50px_rgba(255,140,0,0.3)] hover:scale-[1.01] hover:border-orange-500 cursor-pointer"
          >
            {/* Full Card Cover Image */}
            <img 
              src="/templates/avg 2.jpg" 
              alt="Default Showcase" 
              className="absolute inset-0 w-full h-full object-cover object-center z-0"
            />
            
            {/* Dark Vignette Overlay for maximum text readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/40 to-transparent z-5 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 pointer-events-none" />
            
            <div className="relative max-w-xl space-y-6 z-10 text-left">
              <h1 className="text-4xl md:text-5.5xl font-black text-white leading-tight uppercase font-display tracking-tight text-shadow-md text-glow-orange animate-textGlow">
                Unleash Your Inner Hero!
              </h1>
              <p className="text-xs text-slate-200 font-bold uppercase tracking-widest bg-orange-600/35 border border-orange-500/30 px-3 py-1.5 rounded-lg w-fit backdrop-blur-sm">
                Premium Multiverse Gear for Champions
              </p>
              <button
                className="px-9 py-3.5 bg-gradient-to-r from-[#ff8c00] via-[#ff0055] to-[#bd00ff] hover:shadow-[0_0_25px_rgba(255,140,0,0.45)] text-white font-black text-xs uppercase tracking-widest rounded-full transition-all"
              >
                Shop Now
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Hot Deals */}
      <section className="bg-white/50 border-y border-slate-200/80 py-12 w-full backdrop-blur-md shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-slate-800 uppercase tracking-widest relative inline-block pb-1.5 border-b-2 border-orange-550 font-display flex items-center gap-2">
              <Zap className="text-orange-500" size={24} /> Hot Deals
            </h2>
            <div className="flex items-center gap-2 text-orange-550 font-bold bg-orange-50 px-3 py-1.5 rounded-lg border border-orange-200">
              <Clock size={16} className="animate-pulse" />
              <span className="font-mono text-sm tracking-widest">{formatTime(timeLeft)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {products.filter(p => p.discount >= 15).slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Featureg Diet / Featured Products Section */}
      <section className="py-16 w-full text-left relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="flex items-end justify-between border-b border-slate-200/80 pb-4">
            <div className="flex flex-col">
              <h2 className="text-2xl md:text-3.5xl font-black text-slate-850 uppercase tracking-tight font-display">
                Featured Products
              </h2>
              <span className="text-[10px] text-slate-450 uppercase tracking-widest font-black mt-1">Premium Multiverse Equipment</span>
            </div>
            <button
              onClick={() => navigate('/shop')}
              className="text-xs font-black uppercase tracking-widest text-orange-550 hover:text-orange-600 hover:underline flex items-center gap-1 cursor-pointer transition-colors"
            >
              View All Products <ChevronRight size={14} />
            </button>
          </div>

          {/* Countdown timer alert strip */}
          <div className="flex items-center gap-2 p-3 bg-white/95 border border-slate-200/80 rounded-xl text-xs font-bold text-slate-600 w-fit shadow-sm">
            <Clock size={14} className="text-orange-500 animate-pulse" />
            ⏱️ FLASH VAULT BRIEFING: <span className="font-mono text-orange-500 font-black ml-1">{formatTime(timeLeft)}</span>
          </div>

          {/* Staggered products grid with theme="light" */}
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 pt-2"
          >
            {products
              .filter(p => p.discount === 10)
              .sort((a, b) => parseFloat(a.final_price || a.price) - parseFloat(b.final_price || b.price))
              .slice(0, 8)
              .map((product) => (
              <motion.div key={product.id} variants={fadeInUp}>
                <ProductCard product={product} theme="light" />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Trust Badges Row */}
      <section className="bg-white/80 border-y border-slate-200/80 py-8 w-full backdrop-blur-md shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-5 gap-6 text-left font-bold text-[9px] uppercase tracking-widest text-slate-500">
          <div className="flex items-center gap-2.5">
            <Truck size={20} className="text-orange-500 animate-pulse" />
            <div>
              <p className="text-slate-800 font-black">Free Shipping</p>
              <p className="text-[7.5px] text-slate-450 font-medium lowercase">On orders over 1999 credits</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <Wallet size={20} className="text-orange-500 animate-pulse" />
            <div>
              <p className="text-slate-800 font-black">COD Available</p>
              <p className="text-[7.5px] text-slate-450 font-medium lowercase">Pay on delivery dispatch</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <Shield size={20} className="text-orange-500 animate-pulse" />
            <div>
              <p className="text-slate-800 font-black">Secure Payments</p>
              <p className="text-[7.5px] text-slate-450 font-medium lowercase">100% encrypted gateway</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <RotateCcw size={20} className="text-orange-500 animate-pulse" />
            <div>
              <p className="text-slate-800 font-black">7 Day Returns</p>
              <p className="text-[7.5px] text-slate-450 font-medium lowercase">No questions asked refund</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 col-span-2 md:col-span-1">
            <PhoneCall size={20} className="text-orange-500 animate-pulse" />
            <div>
              <p className="text-slate-800 font-black">Support 24/7</p>
              <p className="text-[7.5px] text-slate-450 font-medium lowercase">Academy help portal online</p>
            </div>
          </div>
        </div>
      </section>

      {/* securing console CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full text-left">
        <div className="p-8 rounded-3xl bg-gradient-to-r from-orange-500/5 via-[#bd00ff]/5 to-transparent border border-slate-200/80 flex flex-col md:flex-row items-center justify-between gap-6 shadow-md backdrop-blur-sm">
          <div>
            <h4 className="text-lg font-black text-slate-850 uppercase tracking-wider flex items-center gap-2">
              <Swords size={20} className="text-orange-500 animate-pulse" /> Academy Entrance Protocol
            </h4>
            <p className="text-xs text-slate-600 font-bold mt-1.5 max-w-xl leading-relaxed">
              Connect your neural credentials, decrypt your realm coordinates, and verify your candidate parameters to unlock full pricing and orders histories.
            </p>
          </div>
          <button
            onClick={() => navigate('/shop')}
            className="px-8 py-3.5 bg-gradient-to-r from-orange-550 to-red-650 text-white font-extrabold text-xs uppercase tracking-wider rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
          >
            Enter HQ Portal
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;
