import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Zap, Cpu, Atom, Sparkles, ShoppingBag, Check, Shield, Crosshair, Terminal, RefreshCw, AlertTriangle } from 'lucide-react';
import confetti from 'canvas-confetti';

const SuperheroPortal = () => {
  const { hero } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const [products, setProducts] = useState([]);
  const [dbHero, setDbHero] = useState(null);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingHero, setLoadingHero] = useState(true);
  const [hudAlert, setHudAlert] = useState('Initializing Systems...');
  const [overlayActive, setOverlayActive] = useState(null);
  const [addedItemIds, setAddedItemIds] = useState({});
  const videoRef = useRef(null);

  // Fetch matched products and hero data from API
  useEffect(() => {
    const fetchPortalData = async () => {
      setLoadingHero(true);
      setLoadingProducts(true);
      try {
        const [itemsRes, heroesRes] = await Promise.all([
          api.get('products/items/'),
          api.get('products/hero-avatars/')
        ]);
        
        const fetchedHero = heroesRes.data.find(h => h.hero_id === hero?.toLowerCase());
        
        if (fetchedHero) {
          setDbHero(fetchedHero);
          setHudAlert(fetchedHero.audio_cue || 'Systems online.');
          
          // Trigger thunder effect immediately upon entering portal
          setOverlayActive('laser');
          setTimeout(() => setOverlayActive(null), 1200);
          
          const allItems = itemsRes.data;
          let matched = [];
          if (fetchedHero.product_slugs && fetchedHero.product_slugs.trim() !== "") {
            const slugs = fetchedHero.product_slugs.split(',').map(s => s.trim());
            matched = allItems.filter(item => slugs.includes(item.slug));
          } else {
            // Fallback: match by name if admin forgot to add slugs
            matched = allItems.filter(item => item.name.toLowerCase().includes(fetchedHero.name.toLowerCase()));
          }
          setProducts(matched);
        } else {
          setDbHero(null);
        }
      } catch (err) {
        console.error('Failed to load portal data:', err);
      } finally {
        setLoadingHero(false);
        setLoadingProducts(false);
      }
    };
    
    fetchPortalData();
  }, [hero]);

  // Trigger sound effect/overlay anims
  const handleActionClick = (actionName) => {
    if (actionName.includes('Deploy') || actionName.includes('Laser')) {
      setOverlayActive('laser');
      setHudAlert('System warning: Tactical deployment initiated.');
      setTimeout(() => setOverlayActive(null), 1200);
    } else {
      setHudAlert(`HUD Event: ${actionName} telemetry loaded.`);
      setTimeout(() => setHudAlert(dbHero?.audio_cue || 'Systems online.'), 3500);
    }
  };

  const handleBuyItem = async (prod) => {
    await addToCart(prod, 1);
    setAddedItemIds(prev => ({ ...prev, [prod.id]: true }));
    setHudAlert(`Decryption successful: ${prod.name} added to cart.`);
    setTimeout(() => {
      setAddedItemIds(prev => ({ ...prev, [prod.id]: false }));
    }, 2000);
  };

  if (loadingHero) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <RefreshCw size={40} className="animate-spin text-slate-500 mb-4" />
        <h2 className="text-xl font-black uppercase tracking-widest text-slate-300">Establishing Uplink</h2>
      </div>
    );
  }

  if (!dbHero) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white space-y-6">
        <AlertTriangle size={60} className="text-red-500 mb-2" />
        <h2 className="text-3xl font-black uppercase tracking-widest text-white">Portal Not Found</h2>
        <p className="text-slate-400 font-mono text-sm max-w-md text-center">
          The requested hero protocol '{hero}' does not exist in the mainframe.
        </p>
        <Link to="/home" className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full font-bold uppercase tracking-wider transition-colors">
          Return to HQ
        </Link>
      </div>
    );
  }

  // Dynamic Theme Generation
  const hex = dbHero.theme_color || '#8b5cf6';
  const getThemeStyles = () => ({
    borderColor: `${hex}80`,
    boxShadow: `0 0 50px ${hex}50, inset 0 0 20px ${hex}30`
  });

  return (
    <div className="relative min-h-screen w-full flex flex-col font-sans overflow-hidden bg-slate-950 text-white">
      {/* Laser overlay effect */}
      <AnimatePresence>
        {overlayActive === 'laser' && (
          <div className="absolute inset-0 z-50 pointer-events-none flex items-center justify-center overflow-hidden">
            {/* Rapid Background Flashes */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0, 0.9, 0, 0.6, 0] }}
              transition={{ duration: 0.5, times: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 1] }}
              className="absolute inset-0 bg-white mix-blend-overlay"
            />
            {/* Realistic Lightning Bolt */}
            <motion.svg 
              initial={{ opacity: 0, scaleY: 0.8 }}
              animate={{ opacity: [0, 1, 0, 1, 0, 0.8, 0], scaleY: [0.8, 1, 1, 1, 1, 1, 1] }}
              transition={{ duration: 0.8, times: [0, 0.05, 0.1, 0.15, 0.2, 0.25, 1] }}
              className="absolute w-full h-[150%] top-[-25%] origin-top mix-blend-screen opacity-100" 
              viewBox="0 0 100 100" 
              preserveAspectRatio="none"
              style={{ filter: `drop-shadow(0 0 15px white) drop-shadow(0 0 40px ${hex}) drop-shadow(0 0 60px ${hex})` }}
            >
              {/* Main Core Strike */}
              <polyline points="45,0 42,10 55,25 40,40 50,60 30,75 55,90 40,100" fill="none" stroke="white" strokeWidth="2" vectorEffect="non-scaling-stroke" />
              {/* Colored Glow Trace */}
              <polyline points="45,0 42,10 55,25 40,40 50,60 30,75 55,90 40,100" fill="none" stroke={hex} strokeWidth="4" vectorEffect="non-scaling-stroke" className="opacity-80" />
              {/* Branches */}
              <polyline points="55,25 65,30 62,40" fill="none" stroke="white" strokeWidth="1" vectorEffect="non-scaling-stroke" />
              <polyline points="40,40 25,45 28,55 15,65" fill="none" stroke="white" strokeWidth="0.8" vectorEffect="non-scaling-stroke" className="opacity-80" />
              <polyline points="50,60 70,65 75,80" fill="none" stroke={hex} strokeWidth="1" vectorEffect="non-scaling-stroke" />
              <polyline points="30,75 20,80 18,90" fill="none" stroke="white" strokeWidth="0.5" vectorEffect="non-scaling-stroke" className="opacity-90" />
            </motion.svg>
          </div>
        )}
      </AnimatePresence>

      {/* Background Looping Video */}
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
        {dbHero.video_url ? (
          <video
            ref={videoRef}
            src={dbHero.video_url}
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover object-center transform scale-105"
          />
        ) : (
          <div className="absolute inset-0 w-full h-full bg-slate-900 flex items-center justify-center opacity-50">
            <Shield size={100} className="text-slate-800" />
          </div>
        )}
        {/* Soft high-tech grid dark overlay for premium color grading */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-slate-950/20 to-slate-950/60 z-5" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(15,23,42,0.6))] z-5" />
      </div>

      {/* Header HUD Navigation */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4 flex items-center justify-between">
        <Link 
          to="/home"
          className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/15 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-md"
        >
          <ChevronLeft size={16} /> Exit to HQ
        </Link>
        <div className="flex items-center gap-2">
          <Terminal size={14} style={{ color: hex }} />
          <span className="text-[10px] font-mono font-black uppercase tracking-widest text-white/70">
            SYSTEM STATUS: ONLINE
          </span>
        </div>
      </header>

      {/* Main Grid Content */}
      <main className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-grow flex flex-col items-center">
        
        {/* Unified Box Panel */}
        <section 
          className="w-full bg-[#050814]/40 border rounded-[2rem] p-6 md:p-10 backdrop-blur-md relative overflow-hidden group flex flex-col gap-8 shadow-[0_0_50px_rgba(0,0,0,0.5)]"
          style={getThemeStyles()}
        >
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent animate-scan" />
          
          {/* Top Header Section */}
          <div className="flex flex-col gap-2 border-b border-white/5 pb-8">
            <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-widest font-display text-white" style={{ textShadow: `0 0 20px ${hex}` }}>
              {dbHero.name} PORTAL
            </h1>
            <p className="mt-2 text-[11px] sm:text-xs font-medium leading-relaxed text-slate-300">
              {dbHero.description || `Exclusive classified portal for ${dbHero.name}. Accessing secure databanks and tactical armament records.`}
            </p>
          </div>

          {/* Bottom Content for Products */}
          <div className="flex flex-col gap-6 w-full">
            
            {/* Products List */}
            <div className="flex flex-col space-y-4 w-full">
              <div className="flex justify-between items-center px-2">
                <div className="flex items-center gap-2">
                  <ShoppingBag size={18} style={{ color: hex }} />
                  <div>
                    <h2 className="text-base font-black uppercase tracking-wider font-display text-white">
                      Exclusive Armaments
                    </h2>
                    <p className="text-[9px] font-mono tracking-widest uppercase text-slate-400">
                      DECRYPTED DATABASE RECORDS
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold text-slate-500 hidden sm:block">
                  Found {products.length} Class-A weapons
                </span>
              </div>

              {/* List of items */}
              {loadingProducts ? (
                <div className="py-24 flex flex-col items-center justify-center gap-3">
                  <RefreshCw size={24} className="animate-spin text-slate-400" />
                  <span className="text-xs font-mono text-slate-400 font-bold uppercase tracking-widest">Accessing database...</span>
                </div>
              ) : products.length > 0 ? (
                <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                  {products.map((product) => (
                    <div 
                      key={product.id}
                      className="group relative p-4 sm:p-5 bg-[#08061d]/40 backdrop-blur-md border border-white/10 rounded-2xl flex flex-col sm:flex-row items-center gap-5 transition-all duration-300 hover:bg-[#0f0b29]/60 hover:shadow-[0_0_30px_rgba(255,255,255,0.05)] hover:border-white/20 overflow-hidden cursor-pointer"
                    >
                      {/* Hover Glow Background */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-15 transition-opacity duration-500 pointer-events-none" style={{ background: `radial-gradient(circle at 50% 50%, ${hex}, transparent 70%)` }} />
                      
                      <div className="relative shrink-0">
                        <img 
                          src={product.image_url} 
                          alt={product.name} 
                          className="w-24 h-24 sm:w-28 sm:h-28 object-cover rounded-xl border border-white/20 group-hover:scale-105 transition-transform duration-500 shadow-lg relative z-0" 
                        />
                      </div>
                      
                      <div className="flex-grow text-center sm:text-left space-y-1.5 relative z-10">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                          <h4 className="text-sm sm:text-base font-black uppercase text-white tracking-widest transition-all group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-slate-400">{product.name}</h4>
                          <span className="w-fit mx-auto sm:mx-0 text-[8px] px-2.5 py-0.5 bg-white/10 border border-white/20 rounded-full font-black uppercase tracking-widest text-slate-300 shadow-inner">
                            ★ Legendary Class
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium leading-relaxed line-clamp-2">
                          {product.description}
                        </p>
                        <div className="pt-2 flex items-center justify-center sm:justify-start gap-4">
                          <span className="font-mono text-sm font-black text-white bg-white/10 px-3 py-1 rounded-lg border border-white/5 shadow-inner">₹{product.final_price || product.price}</span>
                          <div className="flex items-center gap-1.5 opacity-80">
                            <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: product.stock > 0 ? '#10b981' : '#ef4444' }} />
                            <span className="text-[9px] font-mono text-slate-400 font-bold uppercase tracking-wider">{product.stock > 0 ? `Reserves: ${product.stock} units` : 'Depleted'}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="relative z-10 shrink-0 mt-2 sm:mt-0">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleBuyItem(product); }}
                          className="px-5 py-3 rounded-xl text-white font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all hover:-translate-y-1 hover:shadow-lg active:scale-95 cursor-pointer border border-white/20"
                          style={{ background: addedItemIds[product.id] ? '#10b981' : `linear-gradient(135deg, ${hex}90, #4f46e5)` }}
                        >
                          {addedItemIds[product.id] ? (
                            <>
                              <Check size={14} /> Decrypted
                            </>
                          ) : (
                            <>
                              <ShoppingBag size={14} /> Acquire Asset
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-24 text-center text-slate-400 text-xs font-bold uppercase tracking-widest border border-dashed border-white/10 rounded-2xl">
                  No matching portal armaments synchronized.
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Decorative cybernetic grid line footer */}
      <footer className="relative z-10 w-full py-4 text-center text-[8px] font-mono uppercase tracking-widest text-slate-600">
        SECURE PROTOCOL v4.3.0 // PORTAL DEPLOYMENT INTERFACING ACTIVE
      </footer>
    </div>
  );
};

export default SuperheroPortal;
