import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Zap, Shield, Sparkles, Cpu, Layers, Compass, ChevronRight, Activity, LogIn, Target, Star, Swords } from 'lucide-react';
import gsap from 'gsap';

const FeaturedSpecs = [
  {
    id: 1,
    name: 'Iron-inspired Mark-85 Armor',
    category: 'Costumes',
    slug: 'iron-mark-85-armor',
    price: 4999.99,
    description: 'Full-body tactical exo-armor with integrated Arc Reactor. Features flight thrusters, heavy repulsors, and a smart AI system interface.',
    image: 'https://images.unsplash.com/photo-1608889174649-011830e6c69e?w=600',
    accentColor: '#bd00ff',
    gradient: 'from-[#bd00ff] to-[#ff00a0]',
    colorClass: 'text-glow-purple',
    specs: [
      { label: 'Core Energy Output', value: '1.2M Volts', percent: 100, info: 'Arc Reactor Stable' },
      { label: 'Structural Durability', value: '96% (Vibranium alloy)', percent: 96, info: 'Heavy Impact Rated' },
      { label: 'Flight Velocity', value: 'Mach 8.2', percent: 85, info: 'Supersonic Thrusters' },
      { label: 'Tactical Assist AI', value: 'Jarvis Core v4', percent: 92, info: 'Neural Interface' }
    ]
  },
  {
    id: 2,
    name: 'Spider-inspired Nano Suit',
    category: 'Costumes',
    slug: 'spider-nano-battle-suit',
    price: 1299.99,
    description: 'Advanced nanotech armor suit offering enhanced agility, integrated web-shooters, and multi-spectral HUD. Complete with structural mesh design.',
    image: 'https://images.unsplash.com/photo-1604200213928-ba3cf4fc8436?w=600',
    accentColor: '#00f0ff',
    gradient: 'from-[#00f0ff] to-[#0088ff]',
    colorClass: 'text-glow-cyan',
    specs: [
      { label: 'Movement Agility', value: '98% Response', percent: 98, info: 'Bio-mesh Feedback' },
      { label: 'Tensile Web Strength', value: '1200 MPa', percent: 92, info: 'Synthetic Fibers' },
      { label: 'Sensory Spectrum HUD', value: '360° Vision', percent: 88, info: 'Multi-spectral' },
      { label: 'Stealth Camouflage', value: '95% Camo', percent: 95, info: 'Light Refraction' }
    ]
  },
  {
    id: 3,
    name: 'Thunder Hero Storm-Hammer',
    category: 'Weapons',
    slug: 'thunder-hero-storm-hammer',
    price: 899.99,
    description: 'Forged in the heart of a dying star. Channels cosmic lightning and storm-level drafts. Extremely heavy, worthy candidates only.',
    image: 'https://images.unsplash.com/photo-1613771404724-17c1e7a0008b?w=600',
    accentColor: '#ffd700',
    gradient: 'from-[#ffd700] to-[#ff7700]',
    colorClass: 'text-glow-gold',
    specs: [
      { label: 'Lightning Voltage', value: '1.2M Volts', percent: 95, info: 'Sky Channeling' },
      { label: 'Impact Kinetic Mass', value: 'Extreme', percent: 100, info: 'Star Core Forged' },
      { label: 'Planetary Range', value: 'Interstellar', percent: 90, info: 'Bifrost Linked' },
      { label: 'Worthy Certification', value: 'Secured', percent: 100, info: 'Worthiness Locked' }
    ]
  }
];

const PreviewProducts = [
  {
    name: 'Bat-inspired Knight Armor',
    price: '₹2499.00',
    category: 'Costumes',
    rating: '4.9',
    image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400',
    description: 'Tactical carbon fiber stealth armor.'
  },
  {
    name: 'Wizard Staff of Light',
    price: '₹349.99',
    category: 'Magic Items',
    rating: '4.8',
    image: 'https://images.unsplash.com/photo-1519074069444-1ba4e66631d4?w=400',
    description: 'Staff of ancient stellar light magic.'
  },
  {
    name: 'Cosmic Gauntlet Replica',
    price: '₹799.00',
    category: 'Accessories',
    rating: '4.7',
    image: 'https://images.unsplash.com/photo-1559583985-c80d8ad9b29f?w=400',
    description: 'Gold-finished crystal slotting model.'
  }
];

const LandingPage = () => {
  const canvasRef = useRef(null);
  const heroRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const buttonsRef = useRef(null);
  const navigate = useNavigate();

  const [activeSpecIndex, setActiveSpecIndex] = useState(0);

  // Background Interactive Canvas particles
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const numStars = 80;
    const stars = [];
    for (let i = 0; i < numStars; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.0 + 0.3,
        alpha: Math.random(),
        speed: Math.random() * 0.01 + 0.003,
      });
    }

    const render = () => {
      ctx.fillStyle = '#08061d';
      ctx.fillRect(0, 0, width, height);

      // Star field
      ctx.fillStyle = '#ffffff';
      stars.forEach((star) => {
        star.alpha += star.speed;
        if (star.alpha > 1 || star.alpha < 0) {
          star.speed = -star.speed;
        }
        ctx.globalAlpha = Math.max(0, Math.min(1, star.alpha));
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1.0;

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // GSAP Mouse Move Parallax
  useEffect(() => {
    const handleMouseMove = (e) => {
      const { clientX, clientY } = e;
      const xPercent = (clientX / window.innerWidth - 0.5) * 15;
      const yPercent = (clientY / window.innerHeight - 0.5) * 15;

      gsap.to(titleRef.current, {
        x: xPercent,
        y: yPercent,
        duration: 0.8,
        ease: 'power2.out',
      });
      
      gsap.to(subtitleRef.current, {
        x: xPercent * 0.6,
        y: yPercent * 0.6,
        duration: 0.8,
        ease: 'power2.out',
      });

      gsap.to(buttonsRef.current, {
        x: xPercent * 0.4,
        y: yPercent * 0.4,
        duration: 0.8,
        ease: 'power2.out',
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Entrance animations
  useEffect(() => {
    const tl = gsap.timeline();
    tl.fromTo(titleRef.current, 
      { y: 50, opacity: 0 }, 
      { y: 0, opacity: 1, duration: 1.0, ease: 'power3.out' }
    );
    tl.fromTo(subtitleRef.current, 
      { y: 20, opacity: 0 }, 
      { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' },
      '-=0.5'
    );
    tl.fromTo(buttonsRef.current, 
      { scale: 0.95, opacity: 0 }, 
      { scale: 1, opacity: 1, duration: 0.6, ease: 'power3.out' },
      '-=0.4'
    );
  }, []);

  const activeGear = FeaturedSpecs[activeSpecIndex];

  return (
    <div 
      ref={heroRef}
      className="relative w-screen min-h-screen flex flex-col bg-[#08061d] overflow-x-hidden font-sans text-slate-100"
    >
      {/* Background Interactive Starfield */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-cover pointer-events-none z-0" />

      {/* Massive Neon Glowing Morphing Background Spotlights */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 rounded-full blur-[140px] pointer-events-none z-0 animate-morph-slow" />
      <div className="absolute top-1/3 right-10 w-[600px] h-[600px] bg-gradient-to-tr from-purple-500/25 to-pink-500/20 rounded-full blur-[160px] pointer-events-none z-0 animate-morph-slower" />
      <div className="absolute bottom-10 left-10 w-[450px] h-[450px] bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-full blur-[130px] pointer-events-none z-0 animate-morph-slow" />

      {/* Header */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 h-24 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-2.5 font-display text-xl md:text-2xl font-black text-white text-glow-cyan tracking-wider">
          <Award className="text-primary animate-pulse w-7 h-7" />
          SUPERHERO<span className="text-secondary">STORE</span>
        </div>
        <div className="flex items-center gap-6">
          <button
            onClick={() => navigate('/home')}
            className="text-xs font-bold uppercase tracking-wider text-slate-300 hover:text-primary transition-colors cursor-pointer"
          >
            Explore Catalog
          </button>
          <button
            onClick={() => navigate('/login')}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary to-neon-blue rounded-xl text-xs font-black uppercase tracking-wider text-black hover:scale-105 active:scale-95 shadow-md shadow-primary/20 transition-transform cursor-pointer"
          >
            <LogIn size={14} /> Hero Login
          </button>
        </div>
      </header>

      {/* Main Core Content Container */}
      <main className="relative z-10 flex-grow w-full max-w-7xl mx-auto px-6 py-12 flex flex-col gap-20">
        
        {/* SECTION 1: Massive Colorful Hero Banner */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center py-6 text-left">
          
          {/* Hero Left Column */}
          <div className="lg:col-span-7 flex flex-col space-y-6">
            <div className="w-fit px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-[10px] font-bold tracking-widest text-primary text-glow-cyan uppercase">
              ✨ THE WEAPONRY OF CHOSEN DEFENDERS
            </div>
            
            <h1 
              ref={titleRef}
              className="text-5xl md:text-7.5xl font-black font-display tracking-tight text-white leading-none uppercase"
            >
              Equip The Ultimate <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-[#ff0077] text-glow-cyan">
                Multiverse Tech
              </span>
            </h1>

            <p 
              ref={subtitleRef}
              className="text-sm md:text-base text-slate-300 font-medium max-w-xl leading-relaxed"
            >
              Welcome to the premier cosmic distribution hub. Equip yourself with Stark-engineered battle suites, Worthy-class weapons, and magic-enchanted armor built for galactic peacekeepers.
            </p>

            <div 
              ref={buttonsRef}
              className="flex flex-wrap items-center gap-4 pt-4"
            >
              <button
                onClick={() => navigate('/home')}
                className="px-8 py-4 bg-gradient-to-r from-primary via-cyan-400 to-neon-blue rounded-xl text-black font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-primary/30 cursor-pointer hover:scale-105 active:scale-95 transition-all"
              >
                Access Showroom
              </button>
              
              <button
                onClick={() => navigate('/register')}
                className="px-6 py-4 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 text-white font-extrabold text-xs uppercase tracking-wider cursor-pointer hover:scale-105 active:scale-95 transition-all shadow-md"
              >
                Create Account
              </button>
            </div>
          </div>

          {/* Hero Right Column: Glowing holographic telemetry specs monitor */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="w-full max-w-md glass-premium rounded-3xl p-6 border-white/15 relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
              <div className="flex justify-between items-center mb-6">
                <span className="flex items-center gap-1 text-[9px] font-black uppercase text-slate-400 tracking-wider">
                  <Activity size={10} className="text-primary animate-pulse" /> Telemetry Feed
                </span>
                <span className="px-2 py-0.5 rounded bg-primary/15 border border-primary/30 text-primary text-[8px] font-mono uppercase font-black">
                  Link Stable
                </span>
              </div>

              <h4 className="text-base font-black text-white uppercase tracking-wider mb-2 flex items-center gap-2">
                <Shield size={16} className="text-primary" /> Wakanda Shield Matrix
              </h4>
              <p className="text-xs text-slate-400 font-bold leading-relaxed mb-6">
                High-density vibranium micro-mesh composite providing ultimate blast absorption parameters.
              </p>

              <div className="space-y-3 font-bold text-xs border-t border-white/10 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">PROTECTION INDEX</span>
                  <span className="text-white font-mono uppercase bg-white/5 px-2 py-0.5 rounded">CLASS 5 ALPHA</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">STABILITY STATUS</span>
                  <span className="text-emerald-400 font-mono">100% NOMINAL</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">PORTAL COORDINATES</span>
                  <span className="text-white font-mono">REALM-9 LINKS</span>
                </div>
              </div>
            </div>
          </div>

        </section>

        {/* SECTION 2: Holographic Specifications Hub (The Interactive Specification Dashboard) */}
        <section className="p-8 rounded-3xl bg-[#110e31]/80 border border-white/15 shadow-2xl space-y-8 backdrop-blur-xl relative overflow-hidden text-left">
          {/* Top subtle glow */}
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/10 pb-6 gap-4">
            <div>
              <span className="flex items-center gap-1.5 text-xs font-black text-secondary uppercase tracking-widest mb-1">
                <Target size={14} className="animate-pulse" /> Telemetry Specs Terminal
              </span>
              <h2 className="text-2xl md:text-3.5xl font-black text-white uppercase tracking-wider font-display">
                Armament Details & Specs
              </h2>
            </div>
            
            {/* Interactive Tab Selectors */}
            <div className="flex flex-wrap gap-2">
              {FeaturedSpecs.map((item, idx) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSpecIndex(idx)}
                  className={`px-4.5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer border ${
                    activeSpecIndex === idx 
                      ? 'bg-gradient-to-r from-secondary to-[#ff00a0] text-white border-transparent font-black shadow-lg shadow-secondary/20 scale-105'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:border-white/30'
                  }`}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>

          {/* Details Panel grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Showcase Image with Gradient Spotlights */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative group rounded-2xl overflow-hidden border border-white/15 shadow-2xl w-full h-[250px] sm:h-[320px]">
                <img 
                  src={activeGear.image} 
                  alt={activeGear.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                {/* Dark gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#08061d]/90 via-[#08061d]/10 to-transparent" />
                
                {/* Floating category badge */}
                <div className="absolute top-4 left-4 px-3 py-1 bg-black/70 backdrop-blur-md rounded-lg border border-white/10 text-[9px] font-black uppercase tracking-widest text-slate-300">
                  {activeGear.category}
                </div>
              </div>
            </div>

            {/* Showcase Specs & Progress Bars */}
            <div className="lg:col-span-7 flex flex-col space-y-6">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Spotlight Selection</span>
                <h3 className="text-2xl md:text-3.5xl font-black text-white uppercase tracking-wide mt-1">
                  {activeGear.name}
                </h3>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="text-sm font-black font-mono text-primary bg-primary/10 px-2.5 py-0.5 rounded border border-primary/20">
                    ₹{activeGear.price}
                  </span>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">
                    SKU: SH-{activeGear.slug.toUpperCase().slice(0,8)}
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-bold mt-4 leading-relaxed">
                  {activeGear.description}
                </p>
              </div>

              {/* Progress bars showing specs */}
              <div className="space-y-4 pt-2">
                {activeGear.specs.map((spec, specIdx) => (
                  <div key={specIdx} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-350 flex items-center gap-1.5">
                        <Cpu size={12} className="text-secondary" /> {spec.label}
                      </span>
                      <span className="text-white font-mono text-[10px] bg-white/5 px-2 py-0.5 rounded border border-white/10">
                        {spec.value} • {spec.info}
                      </span>
                    </div>
                    {/* Progress Track */}
                    <div className="w-full h-2.5 bg-black/60 rounded-full overflow-hidden border border-white/5 p-[1px]">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${spec.percent}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className={`h-full rounded-full bg-gradient-to-r ${activeGear.gradient}`}
                        style={{
                          boxShadow: `0 0 10px ${activeGear.accentColor}80`
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => navigate(`/product/${activeGear.slug}`)}
                  className="px-6 py-3 bg-[#16123e] border border-white/15 hover:border-primary text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  Acquire Armament <ChevronRight size={14} />
                </button>
              </div>

            </div>

          </div>

        </section>

        {/* SECTION 3: Stylish Grid Showroom */}
        <section className="space-y-10">
          <div className="text-center space-y-2">
            <span className="px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-[9px] font-black tracking-widest text-primary text-glow-cyan uppercase">
              🏛️ MULTIVERSE ARSENAL SHOWROOM
            </span>
            <h2 className="text-3xl md:text-4.5xl font-black text-white uppercase tracking-wider font-display">
              Academy Approved Showroom
            </h2>
            <p className="text-xs text-slate-400 font-bold max-w-md mx-auto leading-relaxed">
              Enlist in the academy now to customize your battle parameters and purchase restricted armaments.
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-bold text-left">
            {PreviewProducts.map((p, idx) => (
              <div
                key={idx}
                className="glass-premium glass-premium-hover rounded-2xl overflow-hidden flex flex-col group"
              >
                <div className="h-48 overflow-hidden relative">
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#08061d]/90 to-transparent" />
                  
                  {/* Rating badge */}
                  <div className="absolute top-3 right-3 px-2 py-0.5 rounded-lg bg-black/60 border border-white/10 text-[9px] font-black text-accent-gold flex items-center gap-1 tracking-wider">
                    <Star size={10} className="fill-accent-gold" /> {p.rating}
                  </div>
                  
                  {/* Category badge */}
                  <div className="absolute bottom-3 left-3 text-[10px] text-slate-300 font-black uppercase tracking-wider">
                    {p.category}
                  </div>
                </div>

                <div className="p-5 flex-grow flex flex-col justify-between items-start space-y-4 bg-white/[0.01]">
                  <div>
                    <h4 className="text-base font-black text-white uppercase tracking-wide group-hover:text-glow-cyan transition-all">
                      {p.name}
                    </h4>
                    <p className="text-xs text-slate-450 font-bold mt-1.5 leading-relaxed">
                      {p.description}
                    </p>
                  </div>

                  <div className="w-full flex items-center justify-between pt-3 border-t border-white/10">
                    <span className="font-mono text-sm text-primary">{p.price}</span>
                    <button
                      onClick={() => navigate('/home')}
                      className="px-3.5 py-2 bg-gradient-to-r from-secondary to-[#ff00a0] text-white font-extrabold text-[9px] uppercase tracking-widest rounded-lg hover:scale-105 active:scale-95 transition-transform cursor-pointer"
                    >
                      Enlist
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA Box Panel */}
          <div className="p-8 rounded-3xl bg-gradient-to-r from-[#bd00ff]/10 via-[#00f0ff]/10 to-transparent border border-white/10 max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between text-left gap-6">
            <div>
              <h4 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Swords size={20} className="text-primary animate-pulse" /> Academy Entrance Protocol
              </h4>
              <p className="text-xs text-slate-400 font-bold mt-1.5 max-w-xl leading-relaxed">
                Connect your neural credentials, decrypt your realm coordinates, and verify your candidate parameters to unlock full pricing and orders histories.
              </p>
            </div>
            <button
              onClick={() => navigate('/home')}
              className="px-8 py-3.5 bg-gradient-to-r from-primary to-neon-blue text-black font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
            >
              Enter HQ Portal
            </button>
          </div>

        </section>

      </main>

      {/* Footer */}
      <footer className="relative z-10 bg-[#040312] border-t border-white/10 py-12 mt-20 font-sans">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8 text-left text-xs font-bold">
          
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-2 font-display text-lg font-black text-white text-glow-cyan tracking-wider">
              <Award className="text-primary w-6 h-6" />
              SUPERHERO<span className="text-secondary">STORE</span>
            </div>
            <p className="text-slate-450 max-w-sm font-medium leading-relaxed">
              Restricted logistics provider for tactical armaments. Supplying defense suits, weaponry, magic crystals, and collectible action items across nine realms.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-slate-200 uppercase tracking-widest font-black text-[10px]">Portal Directory</h4>
            <ul className="space-y-2 text-slate-450 font-medium">
              <li><button onClick={() => navigate('/home')} className="hover:text-white transition-colors cursor-pointer">Explore Catalog</button></li>
              <li><button onClick={() => navigate('/shop')} className="hover:text-white transition-colors cursor-pointer">Academy Shop</button></li>
              <li><button onClick={() => navigate('/login')} className="hover:text-white transition-colors cursor-pointer">Defenders Portal</button></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-slate-200 uppercase tracking-widest font-black text-[10px]">Secure HQ Protocols</h4>
            <ul className="space-y-2 text-slate-450 font-mono text-[10px]">
              <li>ENCRYPTION: AES-256 GCM</li>
              <li>SYNC STATE: LOCAL SYNC</li>
              <li>ACADEMY STATUS: ONLINE</li>
            </ul>
          </div>

        </div>

        <div className="max-w-7xl mx-auto px-6 border-t border-white/10 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between text-[10px] text-slate-600 font-bold">
          <p>&copy; {new Date().getFullYear()} Multiverse Superhero Store Inc. All Rights Reserved.</p>
          <p className="tracking-wider">RESTRICTED TO COUNCIL CERTIFIED DEFENDERS ONLY</p>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
